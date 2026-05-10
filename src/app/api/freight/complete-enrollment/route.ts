import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
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
    if (dup) {
      return NextResponse.json(
        { error: "An account already exists for this email" },
        { status: 409 },
      );
    }

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

    const userId = created.user.id;

    const { error: profErr } = await admin.from("profiles").insert({
      id: userId,
      email: normalizedEmail,
      full_name: body.name.trim(),
      role: "student",
      enrollment_status: "paid",
      enrollment_plan: body.plan,
      stripe_customer_id: body.customerId,
      stripe_subscription_id:
        body.plan === "monthly" ? body.subscriptionId : null,
      stripe_payment_intent_id: paymentIntentId ?? null,
      enrolled_at: new Date().toISOString(),
    });

    if (profErr) {
      console.error("[complete-enrollment] profile", profErr);
      await admin.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: "Profile setup failed — please contact support" },
        { status: 500 },
      );
    }

    await sendStudentWelcomeEmail(
      normalizedEmail,
      body.name.trim(),
      body.plan === "monthly"
        ? "Monthly Access — Alpha Freight Academy"
        : "Lifetime Access — Alpha Freight Academy",
    );

    return NextResponse.json({ success: true, userId });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    console.error("[complete-enrollment]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
