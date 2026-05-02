import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const COURSE_PRODUCT_ID = "prod_UGS5RogVDYy4Qy";
const COURSE_AMOUNT_CENTS = 12000;

function resolveStripeSecretKey(): string | null {
  const candidates = [
    process.env.STRIPE_SECRET_KEY,
    process.env.STRIPE_API_KEY,
    process.env.STRIPE_KEY,
    process.env.STRIPE_SK_LIVE,
  ].filter(Boolean) as string[];

  for (const raw of candidates) {
    const key = raw.trim();
    if (!key) continue;
    // Server-side Checkout: use sk_... (full secret) or rk_... (restricted secret with correct permissions)
    if (key.startsWith("sk_") || key.startsWith("rk_")) return key;
  }

  return null;
}

function getStripe() {
  const key = resolveStripeSecretKey();
  if (!key) return null;
  // Omit apiVersion so the SDK uses its default pinned version for this package (avoids version mismatch).
  return new Stripe(key);
}

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      {
        error:
          "Online card checkout is temporarily unavailable. Please contact us on WhatsApp to enroll right now.",
      },
      { status: 503 }
    );
  }

  try {
    const origin = req.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      allow_promotion_codes: true,
      success_url: `${origin}/freight/dispatch-training?success=1`,
      cancel_url: `${origin}/freight/dispatch-training?canceled=1`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: COURSE_AMOUNT_CENTS,
            product: COURSE_PRODUCT_ID,
          },
        },
      ],
      metadata: {
        productId: COURSE_PRODUCT_ID,
        sku: "dispatch-training",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[stripe] dispatch-training checkout:", e);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

