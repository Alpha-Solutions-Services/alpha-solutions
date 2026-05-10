import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import {
  sendStudentPaymentFailedEmail,
  sendStudentSubscriptionCancelledEmail,
} from "@/lib/freight/emails";

export const runtime = "nodejs";

const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured" }, {
      status: 500,
    });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, {
      status: 400,
    });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("[stripe webhook] Invalid signature:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = getServiceRoleClient();
  if (!admin) return NextResponse.json({ error: "DB not configured" }, { status: 500 });

  try {
    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object as Stripe.PaymentIntent;
      const email =
        pi.metadata?.freight_student_email ??
        (typeof pi.receipt_email === "string" ? pi.receipt_email : "");
      const customer =
        typeof pi.customer === "string" ? pi.customer : pi.customer?.id;
      if (email && customer) {
        await admin
          .from("profiles")
          .update({
            enrollment_status: "paid",
            stripe_payment_intent_id: pi.id,
            stripe_customer_id: customer,
            enrolled_at: new Date().toISOString(),
            enrollment_plan: "lifetime",
          })
          .eq("role", "student")
          .eq("stripe_customer_id", customer);
      }
    }

    if (event.type === "invoice.payment_failed") {
      const inv = event.data.object as Stripe.Invoice;
      const cust =
        typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
      if (!cust) return NextResponse.json({ received: true });
      const { data: profile } = await admin
        .from("profiles")
        .select("email,full_name")
        .eq("role", "student")
        .eq("stripe_customer_id", cust)
        .maybeSingle();
      const em = profile?.email;
      const name =
        typeof profile?.full_name === "string" && profile.full_name.trim()
          ? profile.full_name
          : em ?? "student";
      if (em)
        await sendStudentPaymentFailedEmail(em, name);
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const cust =
        typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
      if (!cust) return NextResponse.json({ received: true });
      const { data: rows } = await admin
        .from("profiles")
        .select("email,full_name")
        .eq("role", "student")
        .eq("stripe_customer_id", cust)
        .limit(1);
      const profile = rows?.[0];
      await admin
        .from("profiles")
        .update({
          enrollment_status: "unpaid",
          stripe_subscription_id: null,
        })
        .eq("role", "student")
        .eq("stripe_customer_id", cust);
      if (profile?.email)
        await sendStudentSubscriptionCancelledEmail(
          profile.email,
          profile.full_name || profile.email || "student",
        );
    }
  } catch (err) {
    console.error("[stripe webhook] Handler error:", err);
    return NextResponse.json({ error: "Webhook processing failed" }, {
      status: 500 });
  }

  return NextResponse.json({ received: true });
}
