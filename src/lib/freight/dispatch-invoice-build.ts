import type { CarrierDispatchInvoice, InvoiceIssuer } from "./dispatch-invoice";
import { renderCarrierInvoicePdf } from "./dispatch-invoice-pdf";
import {
  createInvoiceStripeCheckoutUrl,
  parseInvoicePaymentMethod,
  resolveInvoicePaymentDetails,
  type InvoicePaymentMethod,
} from "./dispatch-invoice-payment";

export async function buildInvoicePdfWithPayment(
  invoice: CarrierDispatchInvoice,
  issuer: InvoiceIssuer,
  paymentMethodInput: unknown,
  origin: string,
): Promise<{
  pdf: Buffer;
  paymentMethod: InvoicePaymentMethod;
  payment: ReturnType<typeof resolveInvoicePaymentDetails>;
}> {
  const paymentMethod = parseInvoicePaymentMethod(paymentMethodInput);

  let stripeUrl: string | undefined;
  if (paymentMethod === "stripe") {
    const url = await createInvoiceStripeCheckoutUrl(invoice, origin);
    if (!url) {
      throw new Error(
        "Stripe is not configured — add STRIPE_SECRET_KEY on the server, or choose S Zelle / M Zelle",
      );
    }
    stripeUrl = url;
  }

  const payment = resolveInvoicePaymentDetails(issuer, paymentMethod, stripeUrl);
  const pdf = await renderCarrierInvoicePdf(invoice, issuer, payment);

  return { pdf, paymentMethod, payment };
}
