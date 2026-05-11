import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { verifyPasswordForEmail } from "@/lib/auth/verify-password-for-email";
import { deliverAuthNotifications } from "@/lib/email/auth-notify";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { sendStudentWelcomeEmail } from "@/lib/freight/emails";

const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
const stripe = stripeKey ? new Stripe(stripeKey) : null;

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  customerId: z.string().min(5),
  plan: z.enum(["monthly", "lifetime"]),
  paymentIntentId: z.string().nullable().optional(),
  subscriptionId: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const admin = getServiceRoleClient();
  if (!admin || !stripe) {
    return NextResponse.json(
      { error: "Server misconfiguration" },
      { status: 500 },
    );
  }

  try {
    const body = schema.parse(await req.json());
    let paid = false;
    let paymentIntentId: string | null = body.paymentIntentId ?? null;

    if (body.plan === "lifetime") {
      if (!paymentIntentId) {
        return NextResponse.json(
          { error: "paymentIntentId required" },
          { status: 400 },
        );
      }
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      paid =
        intent.status === "succeeded" &&
        intent.customer === body.customerId &&
        intent.amount === 12000 &&
        intent.currency === "usd";
      if (!paid) {
        return NextResponse.json(
          { error: "Payment not completed" },
          { status: 402 },
        );
      }
    } else {
      if (!body.subscriptionId) {
        return NextResponse.json(
          { error: "subscriptionId required" },
          { status: 400 },
        );
      }
      const sub = await stripe.subscriptions.retrieve(body.subscriptionId, {
        expand: ["latest_invoice.payment_intent"],
      });

      paid =
        (sub.status === "active" || sub.status === "trialing") &&
        sub.customer === body.customerId;
      const invoiceRaw = sub.latest_invoice;
      if (invoiceRaw && typeof invoiceRaw === "object") {
        const inv = invoiceRaw as {
          payment_intent?: Stripe.PaymentIntent | string | null;
        };
        const ref = inv.payment_intent;
        paymentIntentId =
          typeof ref === "string"
            ? ref
            : ref && typeof ref === "object" && ref.id
              ? ref.id
              : paymentIntentId;
      }
      if (!paid) {
        return NextResponse.json(
          { error: "Subscription inactive" },
          { status: 402 },
        );
      }
    }

    const normalizedEmail = body.email.trim().toLowerCase();
    const { data: dup } = await admin.rpc("check_freight_email_registered", {
      candidate: normalizedEmail,
    });

    const studentProfile = {
      email: normalizedEmail,
      full_name: body.name.trim(),
      role: "student" as const,
      enrollment_status: "paid" as const,
      enrollment_plan: body.plan,
      stripe_customer_id: body.customerId,
      stripe_subscription_id:
        body.plan === "monthly" ? body.subscriptionId : null,
      stripe_payment_intent_id: paymentIntentId ?? null,
      enrolled_at: new Date().toISOString(),
    };

    let userId: string;

    if (dup) {
      const verified = await verifyPasswordForEmail(normalizedEmail, body.password);
      if ("error" in verified) {
        return NextResponse.json(
          { error: verified.error },
          { status: verified.status },
        );
      }
      userId = verified.userId;

      const { data: existingProf } = await admin
        .from("profiles")
        .select("role, enrollment_status")
        .eq("id", userId)
        .maybeSingle();

      const r = existingProf?.role;
      if (r === "carrier" || r === "driver" || r === "dispatcher") {
        return NextResponse.json(
          {
            error:
              "This email is already used for another Alpha Freight role. Use a different email for Academy enrollment.",
          },
          { status: 409 },
        );
      }
      if (r === "student" && existingProf?.enrollment_status === "paid") {
        return NextResponse.json(
          { error: "You already have an active student account. Sign in instead." },
          { status: 409 },
        );
      }

      let profErr: { message?: string } | null = null;
      if (existingProf) {
        const { error } = await admin
          .from("profiles")
          .update(studentProfile)
          .eq("id", userId);
        profErr = error;
      } else {
        const { error } = await admin
          .from("profiles")
          .insert({ id: userId, ...studentProfile });
        profErr = error;
      }

      if (profErr) {
        console.error("[complete-enrollment] profile upsert (existing auth)", profErr);
        return NextResponse.json(
          { error: "Profile setup failed — please contact support" },
          { status: 500 },
        );
      }

      await admin.auth.admin
        .updateUserById(userId, {
          user_metadata: { role: "student", full_name: body.name.trim() },
        })
        .catch(() => {});
    } else {
      const { data: created, error: createErr } =
        await admin.auth.admin.createUser({
          email: normalizedEmail,
          password: body.password,
          email_confirm: true,
          user_metadata: { role: "student", full_name: body.name.trim() },
        });

      if (createErr || !created.user) {
        console.error("[complete-enrollment] createUser", createErr);
        return NextResponse.json(
          { error: "Unable to finish account signup" },
          { status: 500 },
        );
      }

      userId = created.user.id;

      const { error: profErr } = await admin
        .from("profiles")
        .insert({ id: userId, ...studentProfile });

      if (profErr) {
        console.error("[complete-enrollment] profile", profErr);
        await admin.auth.admin.deleteUser(userId);
        return NextResponse.json(
          { error: "Profile setup failed — please contact support" },
          { status: 500 },
        );
      }
    }

    await sendStudentWelcomeEmail(
      normalizedEmail,
      body.name.trim(),
      body.plan === "monthly"
        ? "Monthly Access — Alpha Freight Academy"
        : "Lifetime Access — Alpha Freight Academy",
    );

    void deliverAuthNotifications({
      kind: "signup",
      userId,
      email: normalizedEmail,
      profileRole: "student",
      detail: "Student account created after paid enrollment.",
    }).catch(() => {});

    return NextResponse.json({ success: true, userId });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    console.error("[complete-enrollment]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
