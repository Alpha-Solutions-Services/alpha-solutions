"use client";

import { FleetDonutChart, RevenueLineChart } from "@/components/freight/DispatchCharts";
import { useDispatchDashboard } from "@/components/freight/useDispatchDashboard";

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function DispatcherReportsPage() {
  const { data, loading, error } = useDispatchDashboard();

  if (loading && !data) return <p className="p-8 text-[var(--color-muted)]">Loading reports…</p>;
  if (error && !data) return <p className="p-8 text-red-300">{error}</p>;
  if (!data) return null;

  const paidCount = data.invoices.filter((i) => i.status === "Paid").length;
  const unpaidCount = data.invoices.filter(
    (i) => i.status === "Unpaid" || i.balance > 0,
  ).length;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
          Reports
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Performance snapshot from Dispatch Sheet
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total loads", value: String(data.loads.length) },
          { label: "Total miles", value: data.footer_stats.total_miles.toLocaleString() },
          { label: "Gross revenue", value: formatUsd(data.summary_cards[3]?.value ?? 0) },
          { label: "Commission", value: formatUsd(data.summary_cards[4]?.value ?? 0) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 p-4"
          >
            <p className="text-xs uppercase text-[var(--color-muted)]">{stat.label}</p>
            <p className="mt-2 text-xl font-bold text-[var(--color-text)]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 p-5">
          <h2 className="text-sm font-semibold">Fleet distribution</h2>
          <div className="mt-4">
            <FleetDonutChart fleet={data.fleet_overview} />
          </div>
        </div>
        <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 p-5">
          <h2 className="text-sm font-semibold">Weekly revenue</h2>
          <div className="mt-4">
            <RevenueLineChart data={data.revenue_chart.data} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 p-5">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Invoice summary</h2>
        <div className="mt-4 flex flex-wrap gap-8 text-sm">
          <p>
            <span className="text-[var(--color-muted)]">Paid: </span>
            <strong className="text-emerald-400">{paidCount}</strong>
          </p>
          <p>
            <span className="text-[var(--color-muted)]">Unpaid / open: </span>
            <strong className="text-orange-300">{unpaidCount}</strong>
          </p>
          <p>
            <span className="text-[var(--color-muted)]">Outstanding balance: </span>
            <strong className="text-orange-300">
              {formatUsd(data.footer_stats.unpaid_invoices)}
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
}
