import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { checkRateLimit } from "@/lib/freight/api-security";
import { PUBLIC_SITE_URL } from "@/lib/freight/constants";
import { createClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();
const stripe = stripeKey ? new Stripe(stripeKey) : null;

const DRIVER_SLOT_CENTS = 500;

const schema = z.object({
  driverName: z.string().min(2).max(120),
  driverEmail: z.string().email(),
});

/** Carrier pays $5 before driver invite; dispatcher skips this route. */
export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  }

  if (!checkRateLimit(req, "driver-slot-payment", 10)) {
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
    .select("role, carrier_status, stripe_customer_id, email, company_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "carrier" || profile.carrier_status !== "verified") {
    return NextResponse.json({ error: "Verified carrier only" }, { status: 403 });
  }

  try {
    const body = schema.parse(await req.json());

    let customerId = profile.stripe_customer_id as string | null;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: (profile.email as string)?.trim().toLowerCase(),
        name: (profile.company_name as string)?.trim() || "Carrier",
        metadata: { freight_carrier: "1", profile_id: user.id },
      });
      customerId = customer.id;
      const admin = getServiceRoleClient();
      if (admin) {
        await admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id);
      }
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: DRIVER_SLOT_CENTS,
            product_data: {
              name: "Driver slot — Alpha Freight",
              description: `Add driver ${body.driverName}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        freight_driver_slot: "1",
        profile_id: user.id,
        driver_name: body.driverName,
        driver_email: body.driverEmail.trim().toLowerCase(),
      },
      success_url: `${PUBLIC_SITE_URL}/freight/carrier/drivers?driver_paid=1&name=${encodeURIComponent(body.driverName)}&email=${encodeURIComponent(body.driverEmail)}`,
      cancel_url: `${PUBLIC_SITE_URL}/freight/carrier/drivers?canceled=1`,
    });

    const admin = getServiceRoleClient();
    if (admin) {
      await admin.from("driver_slot_payments").insert({
        carrier_profile_id: user.id,
        amount_cents: DRIVER_SLOT_CENTS,
        status: "pending",
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
