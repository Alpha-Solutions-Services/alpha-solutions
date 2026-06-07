"use client";

import { useDispatchDashboard } from "@/components/freight/useDispatchDashboard";

export function DispatcherCarriersSheet() {
  const { data, loading, error } = useDispatchDashboard();

  if (loading && !data) return null;
  if (error || !data) return null;

  const sheetCarriers = data.carriers;

  return (
    <section className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 p-5 sm:p-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-accent)]">
        Dispatch sheet carriers
      </h2>
      <p className="mt-1 text-xs text-[var(--color-muted)]">
        Unique company names from your Google sheet
      </p>
      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--color-surface)]/80 text-xs uppercase text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Equipment</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Loads</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Source</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {sheetCarriers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-muted)]">
                  No carriers on the dispatch sheet yet
                </td>
              </tr>
            ) : (
              sheetCarriers.map((c) => (
                <tr key={c.carrier_id} className="hover:bg-[var(--color-accent-dim)]/20">
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                    {c.company_name}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">{c.equipment}</td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">{c.location}</td>
                  <td className="px-4 py-3 tabular-nums">{c.loads_count}</td>
                  <td className="px-4 py-3">{c.status}</td>
                  <td className="px-4 py-3 text-xs capitalize text-[var(--color-muted)]">
                    {c.source}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
