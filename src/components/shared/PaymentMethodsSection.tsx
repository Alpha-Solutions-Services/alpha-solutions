const PAYMENT_METHODS = [
  "Payoneer",
  "Wise",
  "Zelle",
  "iFast",
  "Binance",
] as const;

const SUPPORTED_CURRENCIES = ["USD", "PKR", "EUR", "GBP"] as const;

export function PaymentMethodsSection() {
  return (
    <section
      aria-labelledby="payment-methods-heading"
      className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 p-6 sm:p-8"
    >
      <h2
        id="payment-methods-heading"
        className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl"
        style={{ fontFamily: "var(--font-display), sans-serif" }}
      >
        Payment Methods
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--color-muted)]">
        We support flexible payment options for local and international clients.
        Invoices are available for project milestones, retainers, and monthly
        service plans.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PAYMENT_METHODS.map((method) => (
          <div
            key={method}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/50 px-4 py-3 text-sm font-semibold text-[var(--color-text)]"
          >
            {method}
          </div>
        ))}
      </div>

      <p className="mt-5 text-sm text-[var(--color-muted)]">
        Supported currencies: {SUPPORTED_CURRENCIES.join(", ")}.
      </p>
    </section>
  );
}
