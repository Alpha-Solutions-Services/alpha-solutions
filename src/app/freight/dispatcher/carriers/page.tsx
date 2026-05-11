import type { Metadata } from "next";
import { DispatcherCarrierReview } from "@/components/freight/DispatcherCarrierReview";

export const metadata: Metadata = {
  title: "Carrier onboarding — Dispatcher",
};

export default function DispatcherCarriersPage() {
  return (
    <main className="min-h-[70vh] bg-[var(--color-bg)] px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 px-4 py-8 sm:px-8 sm:py-10 md:px-10">
        <DispatcherCarrierReview />
      </div>
    </main>
  );
}
