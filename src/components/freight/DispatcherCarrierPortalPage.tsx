"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useDispatchDashboard } from "@/components/freight/useDispatchDashboard";
import type { CarrierDashboardData } from "@/lib/freight/carrier-dashboard-types";

export function DispatcherCarrierPortalPage() {
  const { data, loading } = useDispatchDashboard();
  const [carrier, setCarrier] = useState("");
  const [configJson, setConfigJson] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const carriers = useMemo(() => data?.carriers ?? [], [data?.carriers]);

  useEffect(() => {
    if (!carrier && carriers[0]) {
      setCarrier(carriers[0].company_name);
    }
  }, [carriers, carrier]);

  function loadTemplate() {
    const template: Partial<CarrierDashboardData> = {
      summary: {
        weekly_revenue: 0,
        monthly_revenue: 0,
        active_loads: 0,
        rpm: 0,
        miles_driven: 0,
        outstanding_invoices: 0,
      },
      trucks: [
        {
          truck_id: "TRK001",
          truck_number: "101",
          driver: "Driver name",
          equipment: "Dry Van",
          location: "City, ST",
          status: "Available",
        },
      ],
      compliance: {
        insurance_status: "Active",
        insurance_expiry: "2026-12-31",
        mc_authority: "Active",
        mc_expiry: "2026-12-31",
        cdl_expiry: "2027-01-01",
        ifta_due: "2026-Q3",
        registration_expiry: "2026-12-31",
      },
      dispatcher: {
        name: "Alpha Dispatch",
        email: "freight@alphasolutions.software",
        phone: "—",
      },
    };
    setConfigJson(JSON.stringify(template, null, 2));
  }

  async function save() {
    if (!carrier.trim()) {
      setMsg("Select a carrier.");
      return;
    }
    setBusy(true);
    setMsg(null);
    try {
      const portalConfig = JSON.parse(configJson) as Record<string, unknown>;
      const matched = carriers.find((c) => c.company_name === carrier);
      const res = await fetch("/api/freight/dispatcher/carrier-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: carrier,
          carrierProfileId: matched?.source === "supabase" ? matched.carrier_id : undefined,
          portalConfig,
        }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Save failed");
      setMsg("Carrier portal updated — carrier will see changes on refresh.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Invalid JSON or save error");
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) {
    return <p className="p-8 text-[var(--color-muted)]">Loading…</p>;
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Edit carrier portal</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Customize what each carrier sees (trucks, compliance, dispatcher contact, KPIs). Loads come from Supabase automatically.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/50 p-5">
        <label className="block text-sm">
          <span className="text-[var(--color-muted)]">Carrier</span>
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="dispatch-field mt-1 w-full max-w-md rounded-lg border border-[var(--color-border)] px-3 py-2"
          >
            {carriers.map((c) => (
              <option key={c.carrier_id} value={c.company_name}>
                {c.company_name}
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={loadTemplate}
            className="rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
          >
            Load template
          </button>
        </div>

        <label className="mt-4 block text-sm">
          <span className="text-[var(--color-muted)]">Portal config (JSON)</span>
          <textarea
            value={configJson}
            onChange={(e) => setConfigJson(e.target.value)}
            rows={18}
            className="dispatch-field mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]/60 px-3 py-2 font-mono text-xs"
            placeholder='{"trucks":[...],"compliance":{...}}'
          />
        </label>

        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[#05080f] disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save to carrier portal
        </button>
        {msg ? <p className="mt-3 text-sm text-[var(--color-muted)]">{msg}</p> : null}
      </div>
    </div>
  );
}
