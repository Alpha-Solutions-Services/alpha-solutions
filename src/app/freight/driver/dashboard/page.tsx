import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Driver Dashboard — Alpha Freight",
};

export default function DriverDashboardPage() {
  return (
    <main className="min-h-[70vh] bg-[var(--color-bg)] px-4 pb-24 pt-12">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 px-4 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Driver cockpit</h1>
        <p className="mt-3 text-sm text-[var(--color-muted)]">
          Hook your assigned loads dataset here once dispatch pushes trips into Supabase. Mobile-friendly status buttons follow the same primitives as dispatcher boards.
        </p>
        <Link href="/freight/login" className="mt-8 inline-flex text-xs text-[var(--color-accent)] underline">
          Switch accounts
        </Link>
      </div>
    </main>
  );
}
