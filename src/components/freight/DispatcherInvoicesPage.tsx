"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { FileDown, Loader2, Mail, Send } from "lucide-react";
import { DispatchMonthSelector } from "@/components/freight/DispatchMonthSelector";
import { useDispatchDashboard } from "@/components/freight/useDispatchDashboard";
import {
  buildCarrierInvoices,
  formatInvoiceDate,
  getInvoiceFriday,
  groupLoadsByCarrier,
  isInvoiceableLoad,
} from "@/lib/freight/dispatch-invoice";
import {
  INVOICE_PAYMENT_OPTIONS,
  type InvoicePaymentMethod,
} from "@/lib/freight/dispatch-invoice-payment";

const PAYMENT_PREVIEW: Record<InvoicePaymentMethod, string> = {
  s_zelle: "Suzy Agon · +1 (908) 848-9815",
  m_zelle: "Maliha Shahid · (332) 263-3544 · malihaawais1997@gmail.com",
  stripe: "Secure card payment — Stripe Checkout link in PDF & email",
};

function formatUsd(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

export function DispatcherInvoicesPage() {
  const { data, loading, error, activeTab, changeTab } = useDispatchDashboard();
  const searchParams = useSearchParams();
  const generateMode = searchParams.get("action") === "generate";
  const [selectedCarriers, setSelectedCarriers] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<InvoicePaymentMethod>("s_zelle");

  const friday = useMemo(() => getInvoiceFriday(), []);
  const fridayLabel = formatInvoiceDate(friday);

  const carrierGroups = useMemo(() => {
    if (!data) return [];
    const grouped = groupLoadsByCarrier(data.loads);
    const allPreview = buildCarrierInvoices(data.loads, { invoiceDate: friday });
    const numberByCarrier = new Map(allPreview.map((inv) => [inv.carrierName, inv.invoiceNumber]));

    return Array.from(grouped.entries()).map(([carrier, loads]) => {
      const preview = buildCarrierInvoices(loads, { invoiceDate: friday });
      const invoice = preview[0];
      const first = loads[0];
      const email = first.email !== "—" ? first.email.trim() : "";
      return {
        carrier,
        loads,
        invoiceNumber: numberByCarrier.get(carrier) ?? invoice?.invoiceNumber ?? 0,
        email,
        loadNumbers: loads
          .map((l) => (l.load_number !== "—" ? l.load_number : `SR-${l.sr}`))
          .join(", "),
        total: invoice?.total ?? 0,
        lineCount: loads.length,
      };
    });
  }, [data, friday]);

  if (loading && !data) return <p className="p-8 text-[var(--color-muted)]">Loading invoices…</p>;
  if (error && !data) return <p className="p-8 text-red-300">{error}</p>;
  if (!data) return null;

  function toggleCarrier(carrier: string) {
    setSelectedCarriers((prev) => {
      const next = new Set(prev);
      if (next.has(carrier)) next.delete(carrier);
      else next.add(carrier);
      return next;
    });
  }

  function selectAll() {
    setSelectedCarriers(new Set(carrierGroups.map((g) => g.carrier)));
  }

  const selectedTotal = carrierGroups
    .filter((g) => selectedCarriers.has(g.carrier))
    .reduce((s, g) => s + g.total, 0);

  async function downloadPdfInvoices(carriers?: string[]) {
    setGenerating(true);
    setGenError(null);
    setSendSuccess(null);
    try {
      const res = await fetch("/api/freight/dispatcher/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tab: activeTab,
          carriers: carriers?.length ? carriers : undefined,
          paymentMethod,
        }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `Failed (${res.status})`);
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename =
        match?.[1] ??
        (blob.type.includes("zip")
          ? `dispatch-invoices-${friday.toISOString().slice(0, 10)}.zip`
          : `Invoice.pdf`);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Could not generate invoices");
    } finally {
      setGenerating(false);
    }
  }

  async function sendInvoices(carriers?: string[]) {
    setSending(true);
    setGenError(null);
    setSendSuccess(null);
    try {
      const res = await fetch("/api/freight/dispatcher/invoices/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tab: activeTab,
          carriers: carriers?.length ? carriers : undefined,
          paymentMethod,
        }),
      });

      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        sent?: number;
        failed?: number;
        results?: { carrier: string; ok: boolean; error?: string }[];
      };

      if (!res.ok) {
        throw new Error(body.error ?? `Failed (${res.status})`);
      }

      const failed = body.results?.filter((r) => !r.ok) ?? [];
      if (failed.length) {
        setSendSuccess(
          `Sent ${body.sent ?? 0} invoice(s). ${failed.length} failed: ${failed.map((f) => f.carrier).join(", ")}`,
        );
      } else {
        setSendSuccess(`Sent ${body.sent ?? 0} invoice email(s) with PDF attached.`);
      }
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Could not send invoices");
    } finally {
      setSending(false);
    }
  }

  const busy = generating || sending;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Invoices
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Weekly carrier invoices — issued Fridays · due {fridayLabel}
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            One PDF per carrier — e.g. <em>Invoice 1 Abo Trucking LLC.pdf</em> where{" "}
            <strong className="text-[var(--color-text)]">1</strong> is the invoice number.
          </p>
        </div>
        <DispatchMonthSelector
          value={activeTab}
          options={data.sheet_meta.available_tabs}
          onChange={changeTab}
          disabled={loading}
        />
      </div>

      <div className="rounded-2xl border border-[var(--color-accent)]/30 bg-[var(--color-surface)]/50 p-5">
        <h2 className="text-sm font-semibold text-[var(--color-text)]">Generate & send invoices</h2>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Choose one payment method per batch — only that option appears on the PDF and email.
        </p>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            Payment method
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {INVOICE_PAYMENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPaymentMethod(opt.value)}
                className={clsx(
                  "rounded-xl border px-4 py-2 text-sm font-medium transition",
                  paymentMethod === opt.value
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)]/40",
                )}
              >
                {opt.shortLabel}
              </button>
            ))}
          </div>
          <p className="mt-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-3 py-2 text-xs text-[var(--color-muted)]">
            {PAYMENT_PREVIEW[paymentMethod]}
          </p>
        </div>

        {generateMode && carrierGroups.length > 0 && selectedCarriers.size === 0 ? (
          <button
            type="button"
            onClick={selectAll}
            className="mt-3 text-xs text-[var(--color-accent)] hover:underline"
          >
            Select all carriers with invoiceable loads
          </button>
        ) : null}

        <p className="mt-3 text-lg font-bold text-orange-300">
          Selected total: {formatUsd(selectedTotal)}
          {selectedCarriers.size > 0 ? ` · ${selectedCarriers.size} carrier(s)` : ""}
        </p>

        {genError ? <p className="mt-2 text-sm text-red-300">{genError}</p> : null}
        {sendSuccess ? <p className="mt-2 text-sm text-emerald-400">{sendSuccess}</p> : null}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={busy || selectedCarriers.size === 0}
            onClick={() => void sendInvoices(Array.from(selectedCarriers))}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-[#05080f] disabled:opacity-40"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send selected
          </button>
          <button
            type="button"
            disabled={busy || selectedCarriers.size === 0}
            onClick={() => void downloadPdfInvoices(Array.from(selectedCarriers))}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[#05080f] disabled:opacity-40"
          >
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            Download PDF{selectedCarriers.size > 1 ? "s (ZIP)" : ""}
          </button>
          <button
            type="button"
            disabled={busy || carrierGroups.length === 0}
            onClick={() => void sendInvoices()}
            className="rounded-xl border border-emerald-500/40 px-4 py-2 text-sm text-emerald-300 disabled:opacity-40"
          >
            Send all Friday invoices
          </button>
          <button
            type="button"
            disabled={busy || carrierGroups.length === 0}
            onClick={() => void downloadPdfInvoices()}
            className="rounded-xl border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text)] disabled:opacity-40"
          >
            Download all
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)]">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--color-surface)]/80 text-xs uppercase text-[var(--color-muted)]">
            <tr>
              <th className="px-4 py-3">Select</th>
              <th className="px-4 py-3">Invoice #</th>
              <th className="px-4 py-3">Carrier</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Load #</th>
              <th className="px-4 py-3">Loads</th>
              <th className="px-4 py-3">Dispatch total</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Send</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {carrierGroups.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-[var(--color-muted)]">
                  No invoiceable loads yet. Fill in Company Name, Load #, RC-Invoice, and % on the
                  dispatch sheet.
                </td>
              </tr>
            ) : (
              carrierGroups.map((group) => (
                <tr key={group.carrier} className="hover:bg-[var(--color-accent-dim)]/20">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedCarriers.has(group.carrier)}
                      onChange={() => toggleCarrier(group.carrier)}
                    />
                  </td>
                  <td className="px-4 py-3 tabular-nums font-semibold text-[var(--color-accent)]">
                    #{group.invoiceNumber}
                  </td>
                  <td className="px-4 py-3 font-medium text-[var(--color-text)]">
                    {group.carrier}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 text-[var(--color-muted)]" title={group.email}>
                    {group.email || (
                      <span className="text-red-300" title="Add Email column on dispatch sheet">
                        Missing
                      </span>
                    )}
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-[var(--color-muted)]" title={group.loadNumbers}>
                    {group.loadNumbers}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{group.lineCount}</td>
                  <td className="px-4 py-3 tabular-nums text-emerald-400">
                    {formatUsd(group.total)}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted)]">{fridayLabel}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={busy || !group.email}
                      onClick={() => void sendInvoices([group.carrier])}
                      title={
                        group.email
                          ? `Send Invoice ${group.invoiceNumber} to ${group.email}`
                          : "Add carrier email on dispatch sheet"
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 px-2.5 py-1.5 text-xs font-medium text-emerald-300 disabled:opacity-40"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Send
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <details className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 p-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--color-text)]">
          Per-load detail ({data.loads.filter(isInvoiceableLoad).length} rows)
        </summary>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-xs">
            <thead className="text-[var(--color-muted)]">
              <tr>
                <th className="px-2 py-2">SR#</th>
                <th className="px-2 py-2">Load #</th>
                <th className="px-2 py-2">Carrier</th>
                <th className="px-2 py-2">Broker</th>
                <th className="px-2 py-2">RC Invoice</th>
                <th className="px-2 py-2">%</th>
                <th className="px-2 py-2">Dispatch Fee</th>
                <th className="px-2 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {data.loads.map((load) => (
                <tr key={`${load.sr}-${load.load_id}`}>
                  <td className="px-2 py-2">{load.sr}</td>
                  <td className="px-2 py-2">{load.load_number}</td>
                  <td className="px-2 py-2">{load.carrier}</td>
                  <td className="px-2 py-2">{load.broker}</td>
                  <td className="px-2 py-2">{formatUsd(load.rate)}</td>
                  <td className="px-2 py-2">{load.dispatch_percent || "—"}</td>
                  <td className="px-2 py-2">{formatUsd(load.dispatch_fee)}</td>
                  <td className="px-2 py-2">
                    <span
                      className={clsx(
                        "rounded-full px-2 py-0.5",
                        load.status.toLowerCase() === "unpaid"
                          ? "bg-red-500/15 text-red-300"
                          : "bg-white/5 text-[var(--color-muted)]",
                      )}
                    >
                      {load.status || load.invoice_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
