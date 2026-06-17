"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { PortalClock } from "@/components/freight/PortalClock";

type DriverLoad = {
  id: string;
  load_number: string;
  pickup: string;
  delivery: string;
  rate: number;
  status: string;
  miles: number;
  broker: string;
  carrier: string;
};

type DriverDashboardPayload = {
  driver: { name: string; company: string };
  loads: DriverLoad[];
  generated_at: string;
};

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function DriverDashboardClient() {
  const [data, setData] = useState<DriverDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/freight/driver/dashboard", { cache: "no-store" });
      const json = (await res.json()) as DriverDashboardPayload & { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Failed to load");
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading && !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[var(--color-muted)]">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Loading your loads…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
        <p className="text-red-300">{error}</p>
        <button type="button" onClick={() => void refresh()} className="mt-4 rounded-lg border px-4 py-2 text-sm">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--color-accent)]">Driver cockpit</p>
          <h1 className="mt-1 text-2xl font-bold text-[var(--color-text)]">{data.driver.name}</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">{data.driver.company}</p>
        </div>
        <div className="flex items-center gap-2">
          <PortalClock compact />
          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-3 py-2 text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </header>

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--color-surface)]/80 text-xs uppercase text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Load #</th>
              <th className="px-4 py-3">Pickup</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Broker</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {data.loads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[var(--color-muted)]">
                  No loads assigned yet. Dispatch will assign trips from the portal.
                </td>
              </tr>
            ) : (
              data.loads.map((load) => (
                <tr key={load.id} className="hover:bg-[var(--color-accent-dim)]/20">
                  <td className="px-4 py-3 font-medium">{load.load_number}</td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">{load.pickup}</td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">{load.delivery}</td>
                  <td className="px-4 py-3">{load.broker}</td>
                  <td className="px-4 py-3 tabular-nums">{formatUsd(load.rate)}</td>
                  <td className="px-4 py-3">{load.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
