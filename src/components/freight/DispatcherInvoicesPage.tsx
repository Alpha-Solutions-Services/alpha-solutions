"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { useDispatchDashboard } from "@/components/freight/useDispatchDashboard";

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function DispatcherInvoicesPage() {
  const { data, loading, error } = useDispatchDashboard();
  const searchParams = useSearchParams();
  const generateMode = searchParams.get("action") === "generate";
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const unpaid = useMemo(
    () => data?.invoices.filter((i) => i.status === "Unpaid" || i.balance > 0) ?? [],
    [data],
  );

  if (loading && !data) return <p className="p-8 text-[var(--color-muted)]">Loading invoices…</p>;
  if (error && !data) return <p className="p-8 text-red-300">{error}</p>;
  if (!data) return null;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedTotal = unpaid
    .filter((i) => selected.has(i.invoice_id))
    .reduce((s, i) => s + (i.balance || i.amount), 0);

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
          Invoices
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          RC invoice, received, and balance from Dispatch Sheet
        </p>
      </div>

      {generateMode || selected.size > 0 ? (
        <div className="rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-surface)]/50 p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">Generate invoice batch</h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Select unpaid rows, then download a summary for billing.
          </p>
          <p className="mt-3 text-lg font-bold text-orange-300">
            Selected total: {formatUsd(selectedTotal)}
          </p>
          <button
            type="button"
            disabled={selected.size === 0}
            onClick={() => {
              const lines = unpaid
                .filter((i) => selected.has(i.invoice_id))
                .map(
                  (i) =>
                    `${i.invoice_id}\t${i.carrier}\t${i.amount}\t${i.balance}\t${i.due_date}`,
                );
              const tsv = [
                ["Invoice ID", "Carrier", "Amount", "Balance", "Due"].join("\t"),
                ...lines,
              ].join("\n");
              const blob = new Blob([tsv], {
                type: "text/tab-separated-values",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `dispatch-invoices-${new Date().toISOString().slice(0, 10)}.tsv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="mt-4 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[#05080f] disabled:opacity-40"
          >
            Download invoice batch ({selected.size})
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--color-surface)]/80 text-xs uppercase text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Select</th>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Carrier</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Balance</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {data.invoices.map((inv) => (
              <tr key={inv.invoice_id} className="hover:bg-[var(--color-accent-dim)]/20">
                <td className="px-4 py-3">
                  {(inv.status === "Unpaid" || inv.balance > 0) && (
                    <input
                      type="checkbox"
                      checked={selected.has(inv.invoice_id)}
                      onChange={() => toggle(inv.invoice_id)}
                    />
                  )}
                </td>
                <td className="px-4 py-3 text-[var(--color-text)]">{inv.invoice_id}</td>
                <td className="px-4 py-3">{inv.carrier}</td>
                <td className="px-4 py-3 tabular-nums text-emerald-400">{formatUsd(inv.amount)}</td>
                <td className="px-4 py-3 tabular-nums">{formatUsd(inv.received)}</td>
                <td className="px-4 py-3 tabular-nums text-orange-300">
                  {inv.balance > 0 ? formatUsd(inv.balance) : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={clsx(
                      "rounded-full px-2 py-0.5 text-xs",
                      inv.status === "Paid"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : inv.status === "Unpaid"
                          ? "bg-red-500/15 text-red-300"
                          : "bg-white/5 text-[var(--color-muted)]",
                    )}
                  >
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
