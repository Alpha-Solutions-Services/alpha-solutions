"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { DispatchLoadsTable } from "@/components/freight/DispatchLoadsTable";
import { DispatchMonthSelector } from "@/components/freight/DispatchMonthSelector";
import { useDispatchDashboard } from "@/components/freight/useDispatchDashboard";

export function DispatcherLoadsPage() {
  const { data, loading, error, refresh, activeTab, changeTab } = useDispatchDashboard();
  const searchParams = useSearchParams();
  const showBook = searchParams.get("action") === "book";
  const [bookOpen, setBookOpen] = useState(showBook);
  const [form, setForm] = useState({
    company: "",
    broker: "",
    loadDetails: "",
    pickup: "",
    rate: "",
  });
  const [copied, setCopied] = useState(false);

  function exportRow() {
    const row = [
      "",
      "",
      new Date().toLocaleDateString(),
      "",
      form.company,
      form.broker,
      form.loadDetails,
      form.pickup,
      "",
      "",
      "",
      "",
      form.rate || "0",
      "5",
      "",
      "Pending",
      "0",
      "0",
      "",
      "",
      "",
      "Quick Pay",
    ].join("\t");
    void navigator.clipboard.writeText(row);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (loading && !data) {
    return <p className="p-8 text-[var(--color-muted)]">Loading loads…</p>;
  }
  if (error && !data) {
    return <p className="p-8 text-red-300">{error}</p>;
  }
  if (!data) return null;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
            Load board
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {data.loads.length} loads from Dispatch Sheet
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DispatchMonthSelector
            value={activeTab}
            options={data.sheet_meta.available_tabs}
            onChange={changeTab}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setBookOpen((o) => !o)}
            className="rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[#05080f]"
          >
            Book load
          </button>
        </div>
      </div>

      {bookOpen ? (
        <div className="rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-surface)]/50 p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">New load entry</h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Fill details, then copy a row to paste into your Google Dispatch Sheet.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(
              [
                ["company", "Company name"],
                ["broker", "Broker"],
                ["loadDetails", "Load details / lane"],
                ["pickup", "Pickup date & time"],
                ["rate", "RC invoice ($)"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-sm">
                <span className="text-[var(--color-muted)]">{label}</span>
                <input
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/60 px-3 py-2 text-[var(--color-text)]"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportRow}
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text)]"
            >
              {copied ? "Copied to clipboard" : "Copy row for sheet"}
            </button>
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-lg px-4 py-2 text-sm text-[var(--color-muted)]"
            >
              Refresh board
            </button>
          </div>
        </div>
      ) : null}

      <DispatchLoadsTable loads={data.loads} />
    </div>
  );
}
