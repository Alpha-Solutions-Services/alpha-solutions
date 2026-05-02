import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Alpha Solutions Services LLC",
  description:
    "Terms of Service for Alpha Solutions Services LLC including engagement scope, payment terms, and delivery standards.",
  alternates: { canonical: "/terms-of-service" },
};

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl">
        Terms of Service
      </h1>
      <p className="mt-4 text-sm text-[var(--color-muted)]">
        Effective date: May 2, 2026
      </p>
      <div className="mt-8 space-y-5 text-sm leading-relaxed text-[var(--color-muted)]">
        <p>
          Alpha Solutions Services LLC provides software, web development, and
          automation services based on agreed proposals, scope, and milestones.
        </p>
        <p>
          Delivery timelines depend on client approvals, content availability,
          and third-party dependencies. Changes outside agreed scope may require
          timeline and budget adjustments.
        </p>
        <p>
          Payments are due according to project agreements or active subscription
          terms. Delays in payment may pause delivery.
        </p>
        <p>
          For contract questions, contact{" "}
          <a
            href="mailto:info@alphasolutions.software"
            className="text-[var(--color-accent)] hover:underline"
          >
            info@alphasolutions.software
          </a>
          .
        </p>
      </div>
    </main>
  );
}
