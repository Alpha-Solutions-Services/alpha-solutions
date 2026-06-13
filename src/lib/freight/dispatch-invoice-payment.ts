import Stripe from "stripe";
import type { CarrierDispatchInvoice, InvoiceIssuer } from "./dispatch-invoice";

export type InvoicePaymentMethod = "s_zelle" | "m_zelle" | "stripe";

export type InvoicePaymentDetails = {
  method: InvoicePaymentMethod;
  heading: string;
  lines: string[];
  stripeUrl?: string;
};

export const INVOICE_PAYMENT_OPTIONS: {
  value: InvoicePaymentMethod;
  label: string;
  shortLabel: string;
}[] = [
  { value: "s_zelle", label: "S Zelle — Suzy Agon", shortLabel: "S Zelle" },
  { value: "m_zelle", label: "M Zelle — Maliha Shahid", shortLabel: "M Zelle" },
  { value: "stripe", label: "Stripe — card payment", shortLabel: "Stripe" },
];

export function parseInvoicePaymentMethod(value: unknown): InvoicePaymentMethod {
  if (value === "m_zelle" || value === "stripe" || value === "s_zelle") {
    return value;
  }
  return "s_zelle";
}

export const STRIPE_BRAND_COLOR = "#635BFF";
export const STRIPE_PAY_BUTTON_LABEL = "Pay through Stripe";

export function resolveInvoicePaymentDetails(
  issuer: InvoiceIssuer,
  method: InvoicePaymentMethod,
  stripeUrl?: string,
): InvoicePaymentDetails {
  if (method === "m_zelle") {
    const lines = [
      `Number : ${issuer.zelleNumber2}`,
      `Name : ${issuer.zelleName2}`,
    ];
    if (issuer.zelleEmail2) lines.push(`Email : ${issuer.zelleEmail2}`);
    return { method, heading: "Zelle", lines };
  }

  if (method === "stripe") {
    return {
      method,
      heading: "Stripe",
      lines: stripeUrl ? [] : ["Card payment — checkout link will be sent by email"],
      stripeUrl,
    };
  }

  return {
    method,
    heading: "Zelle",
    lines: [`Number : ${issuer.zelleNumber}`, `Name : ${issuer.zelleName}`],
  };
}

export function paymentDetailsToEmailText(details: InvoicePaymentDetails): string {
  if (details.method === "stripe") {
    return details.stripeUrl
      ? `${STRIPE_PAY_BUTTON_LABEL}:\n${details.stripeUrl}`
      : "Stripe card payment — contact us for a payment link.";
  }

  const prefix = details.method === "s_zelle" ? "Zelle" : "Zelle";
  const body = details.lines
    .map((line) => {
      const [key, ...rest] = line.split(" : ");
      return `${key}: ${rest.join(" : ")}`;
    })
    .join("\n");
  return `${prefix} Payment Information:\n\n${body}`;
}

export function stripePayButtonEmailHtml(url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0 10px;">
    <tr>
      <td style="border-radius:8px;background:${STRIPE_BRAND_COLOR};">
        <a href="${escapeAttr(url)}"
           style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;font-family:'Segoe UI',system-ui,-apple-system,sans-serif;letter-spacing:0.01em;">
          ${escapeHtml(STRIPE_PAY_BUTTON_LABEL)}
        </a>
      </td>
    </tr>
  </table>
  <p style="margin:0 0 4px;font-size:12px;color:#6a8caf;">Secure card payment powered by Stripe</p>`;
}

export function paymentDetailsToEmailHtml(details: InvoicePaymentDetails): string {
  if (details.method === "stripe") {
    if (details.stripeUrl) {
      return `<p style="margin-bottom:4px;"><strong>Card payment</strong></p>${stripePayButtonEmailHtml(details.stripeUrl)}`;
    }
    return `<p style="margin-bottom:8px;"><strong>Stripe card payment</strong> — payment link unavailable. Contact ${escapeHtml(process.env.FREIGHT_SUPPORT_EMAIL ?? "support")}.</p>`;
  }

  const rows = details.lines
    .map((line) => {
      const idx = line.indexOf(" : ");
      if (idx < 0) return `<p style="margin:0 0 6px">${escapeHtml(line)}</p>`;
      const key = line.slice(0, idx);
      const val = line.slice(idx + 3);
      return `<p style="margin:0 0 6px"><strong>${escapeHtml(key)}:</strong> ${escapeHtml(val)}</p>`;
    })
    .join("");

  return `<p style="margin-bottom:8px;"><strong>Zelle Payment Information:</strong></p>${rows}`;
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(s: string) {
  return escapeHtml(s);
}

function resolveStripeSecretKey(): string | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (key?.startsWith("sk_") || key?.startsWith("rk_")) return key;
  return null;
}

export function isStripeInvoicePaymentsConfigured(): boolean {
  return Boolean(resolveStripeSecretKey());
}

export async function createInvoiceStripeCheckoutUrl(
  invoice: CarrierDispatchInvoice,
  origin: string,
): Promise<string | null> {
  const key = resolveStripeSecretKey();
  if (!key) return null;

  const amountCents = Math.round(invoice.total * 100);
  if (amountCents < 50) return null;

  const stripe = new Stripe(key);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: invoice.billTo.email?.trim() || undefined,
    success_url: `${origin}/freight/dispatcher/invoices?stripe=success&invoice=${invoice.invoiceNumber}`,
    cancel_url: `${origin}/freight/dispatcher/invoices?stripe=cancel`,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: `Invoice #${invoice.invoiceNumber} — ${invoice.carrierName}`,
            description: "Alpha Freight Network dispatch fee",
          },
        },
      },
    ],
    metadata: {
      type: "dispatch_invoice",
      invoiceNumber: String(invoice.invoiceNumber),
      carrierName: invoice.carrierName,
    },
  });

  return session.url;
}
