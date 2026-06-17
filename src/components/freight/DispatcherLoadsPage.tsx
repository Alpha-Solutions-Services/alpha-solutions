"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { DispatchLoadsTable } from "@/components/freight/DispatchLoadsTable";
import { DispatchMonthSelector } from "@/components/freight/DispatchMonthSelector";
import { PortalClock } from "@/components/freight/PortalClock";
import { useDispatchDashboard } from "@/components/freight/useDispatchDashboard";

export function DispatcherLoadsPage() {
  const { data, loading, error, refresh, activeTab, changeTab } = useDispatchDashboard();
  const searchParams = useSearchParams();
  const showBook = searchParams.get("action") === "book";
  const [bookOpen, setBookOpen] = useState(showBook);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [form, setForm] = useState({
    company: "",
    broker: "",
    loadDetails: "",
    pickup: "",
    rate: "",
    loadNumber: "",
  });

  async function saveLoad() {
    if (!form.company.trim()) {
      setSaveMsg("Company name is required.");
      return;
    }
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await fetch("/api/freight/dispatcher/loads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthTab: activeTab,
          companyName: form.company.trim(),
          broker: form.broker.trim() || undefined,
          loadDetails: form.loadDetails.trim() || undefined,
          pickupDateTime: form.pickup.trim() || undefined,
          loadNumber: form.loadNumber.trim() || undefined,
          rcInvoice: form.rate ? Number.parseFloat(form.rate) : 0,
          dispatchPercent: 5,
          status: "Unpaid",
        }),
      });
      const json = (await res.json()) as { error?: string; sr?: number };
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setSaveMsg(`Load saved (SR-${json.sr}). Carrier notified by email.`);
      setForm({ company: "", broker: "", loadDetails: "", pickup: "", rate: "", loadNumber: "" });
      await refresh();
    } catch (e) {
      setSaveMsg(e instanceof Error ? e.message : "Could not save load");
    } finally {
      setSaving(false);
    }
  }

  async function removeLoad(id: string) {
    if (!window.confirm("Remove this load? Carrier will be notified by email.")) return;
    const res = await fetch(`/api/freight/dispatcher/loads?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      alert(json.error ?? "Delete failed");
      return;
    }
    await refresh();
  }

  if (loading && !data) {
    return <p className="p-8 text-[var(--color-muted)]">Loading loads…</p>;
  }
  if (error && !data) {
    return <p className="p-8 text-red-300">{error}</p>;
  }
  if (!data) return null;

  const sourceLabel =
    data.sheet_meta.source === "supabase"
      ? "Supabase (editable)"
      : data.sheet_meta.connected
        ? "Google Sheet (read-only fallback)"
        : "Not connected";

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]" style={{ fontFamily: "var(--font-display)" }}>
            Load board
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {data.loads.length} loads · {sourceLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PortalClock compact />
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
            Add load
          </button>
        </div>
      </div>

      {bookOpen ? (
        <div className="rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-surface)]/50 p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text)]">New load</h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Saves to Supabase — reflected instantly on the carrier portal. Emails carrier + dispatch team.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(
              [
                ["company", "Company name *"],
                ["broker", "Broker"],
                ["loadDetails", "Load details / lane"],
                ["pickup", "Pickup date & time"],
                ["loadNumber", "Load #"],
                ["rate", "RC invoice ($)"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block text-sm">
                <span className="text-[var(--color-muted)]">{label}</span>
                <input
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="dispatch-field mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/60 px-3 py-2 text-[var(--color-text)]"
                />
              </label>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveLoad()}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#05080f] disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save load
            </button>
            <button
              type="button"
              onClick={() => void refresh()}
              className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text)]"
            >
              Refresh
            </button>
          </div>
          {saveMsg ? <p className="mt-3 text-sm text-[var(--color-muted)]">{saveMsg}</p> : null}
        </div>
      ) : null}

      <DispatchLoadsTable
        loads={data.loads}
        onRemove={data.sheet_meta.source === "supabase" ? removeLoad : undefined}
      />
    </div>
  );
}
