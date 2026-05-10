import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

// 1. Install: npm install stripe @stripe/stripe-js @stripe/react-stripe-js
// 2. Add to .env.local:
//    STRIPE_SECRET_KEY=sk_live_...
//    STRIPE_WEBHOOK_SECRET=whsec_...
//    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
// 3. Create products in Stripe dashboard:
//    Product 1: "Alpha Freight Monthly" — $49/month recurring (update Price ID in Dashboard + enrollment_plans)
//    Product 2: "Alpha Freight Lifetime" — sync price ($120+) one-time Price ID + enrollment_plans
// Copy the Price IDs into STRIPE_MONTHLY_PRICE_ID / STRIPE_LIFETIME_PRICE_ID env or enrollment_plans table.

const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
const stripe = stripeKey ? new Stripe(stripeKey) : null;

const monthlyPrice =
  process.env.STRIPE_MONTHLY_PRICE_ID?.trim() ??
  process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID?.trim();
const lifetimePrice =
  process.env.STRIPE_LIFETIME_PRICE_ID?.trim() ??
  process.env.NEXT_PUBLIC_STRIPE_LIFETIME_PRICE_ID?.trim();

const schema = z.object({
  plan: z.enum(["monthly", "lifetime"]),
  email: z.string().email(),
  name: z.string().min(2),
});

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  try {
    const json = schema.parse(await req.json());

    const customer = await stripe.customers.create({
      email: json.email.trim().toLowerCase(),
      name: json.name.trim(),
      metadata: { freight_student: "1", enrollment_plan: json.plan },
    });

    const priceId =
      json.plan === "monthly" ? monthlyPrice : lifetimePrice;
    if (!priceId || priceId.startsWith("REPLACE_")) {
      return NextResponse.json(
        {
          error:
            "Missing Stripe Price ID. Set STRIPE_MONTHLY_PRICE_ID / STRIPE_LIFETIME_PRICE_ID.",
        },
        { status: 500 },
      );
    }

    if (json.plan === "lifetime") {
      const intent = await stripe.paymentIntents.create({
        customer: customer.id,
        automatic_payment_methods: { enabled: true, allow_redirects: "never" },
        amount: 12000, // $120.00 · keep synced with enrollment_plans + marketing copy
        currency: "usd",
        metadata: {
          freight_student_email: json.email.trim().toLowerCase(),
          enrollment_plan: "lifetime",
          student_display_name: json.name.trim(),
        },
        receipt_email: json.email.trim().toLowerCase(),
        description: "Alpha Freight Academy — Lifetime access",
      });

      return NextResponse.json({
        customerId: customer.id,
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
        mode: "payment" as const,
      });
    }

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      metadata: {
        freight_student_email: json.email.trim().toLowerCase(),
        enrollment_plan: "monthly",
        student_display_name: json.name.trim(),
      },
      payment_behavior: "default_incomplete",
      payment_settings: {
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    });

    const invoiceRaw = subscription.latest_invoice;
    let pi: Stripe.PaymentIntent | null = null;

    if (invoiceRaw && typeof invoiceRaw === "object") {
      const ref = (invoiceRaw as { payment_intent?: Stripe.PaymentIntent | string | null }).payment_intent;
      pi =
        typeof ref === "string"
          ? null
          : ref && typeof ref === "object"
            ? ref
            : null;
    }

    const clientSecret = pi?.client_secret ?? null;

    if (!clientSecret) {
      return NextResponse.json(
        { error: "Could not initialise subscription payment." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      customerId: customer.id,
      clientSecret,
      subscriptionId: subscription.id,
      paymentIntentId: pi?.id ?? null,
      mode: "subscription" as const,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    console.error("[create-payment-intent]", e);
    return NextResponse.json({ error: "Stripe error" }, { status: 502 });
  }
}
