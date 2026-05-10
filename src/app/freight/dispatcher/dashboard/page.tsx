import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dispatcher Dashboard — Alpha Freight",
  description:
    "Manage approvals, manifests, invitations — scaffold for live integrations via Supabase + Mapbox.",
};

export default function DispatcherDashboardPage() {
  return (
    <main className="min-h-[70vh] bg-[var(--color-bg)] px-4 pb-24 pt-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 px-10 py-12">
        <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
          Dispatcher HQ
        </h1>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Start with onboarding hygiene — approvals control who sees live boards.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          <Link
            href="/freight/dispatcher/carriers"
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/40 px-6 py-8 text-[var(--color-text)] transition hover:border-[var(--color-accent)]/35"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">Queue</span>
            <span className="mt-4 block font-bold">Carrier onboarding</span>
            <span className="mt-2 block text-xs text-[var(--color-muted)]">Approve or reject filings</span>
          </Link>
          <Link
            href="/freight/dispatcher/drivers"
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)]/40 px-6 py-8 text-[var(--color-text)] transition hover:border-[var(--color-accent)]/35"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">Drivers</span>
            <span className="mt-4 block font-bold">Invite seated drivers</span>
            <span className="mt-2 block text-xs text-[var(--color-muted)]">Assign invites to carriers</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
