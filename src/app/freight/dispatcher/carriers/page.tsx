import type { Metadata } from "next";
import { DispatcherCarrierReview } from "@/components/freight/DispatcherCarrierReview";
import { DispatcherCarriersSheet } from "@/components/freight/DispatcherCarriersSheet";

export const metadata: Metadata = {
  title: "Carriers — Dispatcher",
};

export default function DispatcherCarriersPage() {
  return (
    <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1
          className="text-2xl font-bold text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Carriers
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Onboarding queue plus carriers from your Dispatch Sheet
        </p>
      </div>

      <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 p-5 sm:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          Onboarding queue
        </h2>
        <div className="mt-6">
          <DispatcherCarrierReview />
        </div>
      </section>

      <DispatcherCarriersSheet />
    </div>
  );
}
