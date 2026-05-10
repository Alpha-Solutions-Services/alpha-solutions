import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { sendStudentWelcomeEmail } from "@/lib/freight/emails";

const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
const stripe = stripeKey ? new Stripe(stripeKey) : null;

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  customerId: z.string().min(5),
  plan: z.enum(["monthly", "lifetime"]),
  paymentIntentId: z.string().nullable().optional(),
  subscriptionId: z.string().nullable().optional(),
});

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const admin = getServiceRoleClient();
  if (!url || !anon || !admin || !stripe) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const cookieStore = cookies();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const body = schema.parse(await req.json());
    const normalizedEmail = body.email.trim().toLowerCase();

    if ((user.email ?? "").toLowerCase() !== normalizedEmail) {
      return NextResponse.json({ error: "Signed-in email must match checkout email." }, { status: 422 });
    }

    let paid = false;
    let paymentIntentId: string | null = body.paymentIntentId ?? null;

    if (body.plan === "lifetime") {
      if (!paymentIntentId) {
        return NextResponse.json({ error: "paymentIntentId required" }, { status: 400 });
      }
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      paid =
        intent.status === "succeeded" &&
        intent.customer === body.customerId &&
        intent.amount === 12000 &&
        intent.currency === "usd";
      if (!paid) {
        return NextResponse.json({ error: "Payment not completed" }, { status: 402 });
      }
    } else {
      if (!body.subscriptionId) {
        return NextResponse.json({ error: "subscriptionId required" }, { status: 400 });
      }
      const sub = await stripe.subscriptions.retrieve(body.subscriptionId, {
        expand: ["latest_invoice.payment_intent"],
      });
      paid = (sub.status === "active" || sub.status === "trialing") && sub.customer === body.customerId;

      const invoiceRaw = sub.latest_invoice;
      if (invoiceRaw && typeof invoiceRaw === "object") {
        const inv = invoiceRaw as { payment_intent?: Stripe.PaymentIntent | string | null };
        const ref = inv.payment_intent;
        paymentIntentId =
          typeof ref === "string"
            ? ref
            : ref && typeof ref === "object" && ref.id
              ? ref.id
              : paymentIntentId;
      }
      if (!paid) {
        return NextResponse.json({ error: "Subscription inactive" }, { status: 402 });
      }
    }

    const { data: existing } = await admin
      .from("profiles")
      .select("enrollment_status")
      .eq("id", user.id)
      .maybeSingle();

    if (existing?.enrollment_status === "paid") {
      return NextResponse.json({ error: "Enrollment already active", success: false }, { status: 409 });
    }

    const { error: upErr } = await admin
      .from("profiles")
      .upsert(
        {
          id: user.id,
          email: normalizedEmail,
          full_name: body.name.trim(),
          role: "student",
          enrollment_status: "paid",
          enrollment_plan: body.plan,
          stripe_customer_id: body.customerId,
          stripe_subscription_id: body.plan === "monthly" ? body.subscriptionId : null,
          stripe_payment_intent_id: paymentIntentId ?? null,
          enrolled_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

    if (upErr) {
      console.error("[complete-enrollment-existing] profile", upErr);
      return NextResponse.json({ error: "Profile setup failed", success: false }, { status: 500 });
    }

    await admin.auth.admin
      .updateUserById(user.id, { user_metadata: { role: "student", full_name: body.name.trim() } })
      .catch(() => {});

    await sendStudentWelcomeEmail(
      normalizedEmail,
      body.name.trim(),
      body.plan === "monthly" ? "Monthly Access — Alpha Freight Academy" : "Lifetime Access — Alpha Freight Academy",
    ).catch(() => {});

    return NextResponse.json({ success: true, userId: user.id });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    console.error("[complete-enrollment-existing]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

