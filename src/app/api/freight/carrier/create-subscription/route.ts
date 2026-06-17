import { NextResponse } from "next/server";
import Stripe from "stripe";
import { checkRateLimit } from "@/lib/freight/api-security";
import { createClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { PUBLIC_SITE_URL } from "@/lib/freight/constants";

const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
const stripe = stripeKey ? new Stripe(stripeKey) : null;
const carrierPriceId = process.env.STRIPE_CARRIER_PORTAL_PRICE_ID?.trim();

export async function POST(req: Request) {
  if (!stripe || !carrierPriceId) {
    return NextResponse.json({ error: "Stripe carrier plan not configured" }, { status: 500 });
  }

  const nextReq = req as unknown as import("next/server").NextRequest;
  if (!checkRateLimit(nextReq, "carrier-subscription", 10)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const sb = await createClient();
  if (!sb) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 });

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await sb
    .from("profiles")
    .select("role, carrier_status, email, full_name, company_name, stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "carrier" || profile.carrier_status !== "verified") {
    return NextResponse.json({ error: "Verified carrier only" }, { status: 403 });
  }

  let customerId = profile.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: (profile.email as string)?.trim().toLowerCase(),
      name:
        (profile.company_name as string)?.trim() ||
        (profile.full_name as string)?.trim() ||
        "Carrier",
      metadata: { freight_carrier: "1", profile_id: user.id },
    });
    customerId = customer.id;
    const admin = getServiceRoleClient();
    if (admin) {
      await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
    }
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: carrierPriceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: 7,
      metadata: { freight_carrier: "1", profile_id: user.id },
    },
    success_url: `${PUBLIC_SITE_URL}/freight/carrier/payments?success=1`,
    cancel_url: `${PUBLIC_SITE_URL}/freight/carrier/payments?canceled=1`,
    metadata: { freight_carrier: "1", profile_id: user.id },
  });

  return NextResponse.json({ url: session.url });
}
