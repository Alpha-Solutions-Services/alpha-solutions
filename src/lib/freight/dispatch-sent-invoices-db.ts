import type { CarrierDispatchInvoice } from "./dispatch-invoice";
import type { DashboardLoad } from "./dispatch-dashboard-types";
import type { InvoicePaymentMethod } from "./dispatch-invoice-payment";
import { computeBalance } from "./load-notifications";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { sanitizeMoney, sanitizeText } from "./api-security";

export type SentInvoicePaymentStatus = "unpaid" | "partial" | "paid";

export type SentInvoiceLineItem = {
  sr: string;
  load_number: string;
  amount: number;
  db_id: string | null;
};

export type DbSentInvoice = {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  invoice_number: string;
  month_tab: string;
  carrier_name: string;
  carrier_email: string | null;
  invoice_date: string;
  due_date: string;
  amount_total: number;
  amount_received: number;
  payment_status: SentInvoicePaymentStatus;
  payment_method: string | null;
  sent_at: string;
  sent_by: string | null;
  line_items: SentInvoiceLineItem[];
  notes: string | null;
};

export type SentInvoiceRecord = {
  id: string;
  invoiceNumber: string;
  monthTab: string;
  carrierName: string;
  carrierEmail: string;
  invoiceDate: string;
  dueDate: string;
  amountTotal: number;
  amountReceived: number;
  paymentStatus: SentInvoicePaymentStatus;
  paymentMethod: string;
  sentAt: string;
  lineItems: SentInvoiceLineItem[];
  notes: string;
};

function rowToRecord(row: DbSentInvoice): SentInvoiceRecord {
  return {
    id: row.id,
    invoiceNumber: row.invoice_number,
    monthTab: row.month_tab,
    carrierName: row.carrier_name,
    carrierEmail: row.carrier_email ?? "",
    invoiceDate: row.invoice_date,
    dueDate: row.due_date,
    amountTotal: Number(row.amount_total) || 0,
    amountReceived: Number(row.amount_received) || 0,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method ?? "",
    sentAt: row.sent_at,
    lineItems: Array.isArray(row.line_items) ? row.line_items : [],
    notes: row.notes ?? "",
  };
}

function parseNumericInvoiceNumber(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  const n = Number.parseInt(digits, 10);
  return Number.isFinite(n) ? n : null;
}

export async function getNextInvoiceNumber(): Promise<number> {
  const admin = getServiceRoleClient();
  if (!admin) return 1;

  const { data, error } = await admin
    .from("dispatch_sent_invoices")
    .select("invoice_number")
    .is("deleted_at", null);

  if (error) {
    console.error("[dispatch-sent-invoices-db] next number failed:", error);
    return 1;
  }

  let max = 0;
  for (const row of data ?? []) {
    const n = parseNumericInvoiceNumber(String(row.invoice_number ?? ""));
    if (n !== null && n > max) max = n;
  }
  return max + 1;
}

export function buildSentInvoiceLineItems(
  invoice: CarrierDispatchInvoice,
  loads: DashboardLoad[],
): SentInvoiceLineItem[] {
  return invoice.lineItems.map((li) => {
    const load = loads.find((l) => l.sr === li.sr);
    return {
      sr: li.sr,
      load_number: li.loadNumber,
      amount: li.amount,
      db_id: load?.db_id ?? null,
    };
  });
}

export async function recordSentInvoice(params: {
  invoice: CarrierDispatchInvoice;
  loads: DashboardLoad[];
  monthTab: string;
  paymentMethod?: InvoicePaymentMethod;
  sentBy: string;
}): Promise<SentInvoiceRecord | null> {
  const admin = getServiceRoleClient();
  if (!admin) return null;

  const lineItems = buildSentInvoiceLineItems(params.invoice, params.loads);
  const invoiceDate = params.invoice.invoiceDate.toISOString().slice(0, 10);
  const dueDate = params.invoice.dueDate.toISOString().slice(0, 10);

  const { data, error } = await admin
    .from("dispatch_sent_invoices")
    .insert({
      invoice_number: sanitizeText(String(params.invoice.invoiceNumber), 40),
      month_tab: sanitizeText(params.monthTab, 40),
      carrier_name: sanitizeText(params.invoice.carrierName, 200),
      carrier_email: params.invoice.billTo.email
        ? sanitizeText(params.invoice.billTo.email, 200)
        : null,
      invoice_date: invoiceDate,
      due_date: dueDate,
      amount_total: sanitizeMoney(params.invoice.total),
      amount_received: 0,
      payment_status: "unpaid",
      payment_method: params.paymentMethod ?? null,
      sent_by: params.sentBy,
      line_items: lineItems,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[dispatch-sent-invoices-db] insert failed:", error);
    return null;
  }
  return rowToRecord(data as DbSentInvoice);
}

export async function listSentInvoices(monthTab?: string): Promise<SentInvoiceRecord[]> {
  const admin = getServiceRoleClient();
  if (!admin) return [];

  let query = admin
    .from("dispatch_sent_invoices")
    .select("*")
    .is("deleted_at", null)
    .order("sent_at", { ascending: false });

  if (monthTab) {
    query = query.eq("month_tab", monthTab);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[dispatch-sent-invoices-db] list failed:", error);
    return [];
  }

  return (data as DbSentInvoice[]).map(rowToRecord);
}

async function syncLoadsForPayment(
  lineItems: SentInvoiceLineItem[],
  paymentStatus: SentInvoicePaymentStatus,
  amountReceived: number,
): Promise<void> {
  const admin = getServiceRoleClient();
  if (!admin) return;

  const dbIds = lineItems.map((li) => li.db_id).filter(Boolean) as string[];
  if (dbIds.length === 0) return;

  if (paymentStatus === "paid") {
    for (const item of lineItems) {
      if (!item.db_id) continue;
      const { data: existing } = await admin
        .from("dispatch_loads")
        .select("dispatch_fee, received")
        .eq("id", item.db_id)
        .maybeSingle();
      const fee = Number(existing?.dispatch_fee) || item.amount;
      const received = Math.max(Number(existing?.received) || 0, fee);
      await admin
        .from("dispatch_loads")
        .update({
          status: "Paid",
          received,
          balance: 0,
        })
        .eq("id", item.db_id);
    }
    return;
  }

  if (paymentStatus === "partial" && amountReceived > 0) {
    const total = lineItems.reduce((s, li) => s + li.amount, 0);
    if (total <= 0) return;

    for (const item of lineItems) {
      if (!item.db_id) continue;
      const share = Math.round((item.amount / total) * amountReceived * 100) / 100;
      const { data: existing } = await admin
        .from("dispatch_loads")
        .select("dispatch_fee, received")
        .eq("id", item.db_id)
        .maybeSingle();
      const fee = Number(existing?.dispatch_fee) || item.amount;
      const received = Math.min(fee, share);
      await admin
        .from("dispatch_loads")
        .update({
          status: "Partial",
          received,
          balance: computeBalance(fee, received),
        })
        .eq("id", item.db_id);
    }
    return;
  }

  if (paymentStatus === "unpaid") {
    for (const item of lineItems) {
      if (!item.db_id) continue;
      await admin
        .from("dispatch_loads")
        .update({
          status: "Unpaid",
          received: 0,
          balance: item.amount,
        })
        .eq("id", item.db_id);
    }
  }
}

export async function updateSentInvoice(params: {
  id: string;
  paymentStatus?: SentInvoicePaymentStatus;
  amountReceived?: number;
  invoiceNumber?: string;
  notes?: string;
  syncLoads?: boolean;
}): Promise<SentInvoiceRecord | null> {
  const admin = getServiceRoleClient();
  if (!admin) return null;

  const { data: existing } = await admin
    .from("dispatch_sent_invoices")
    .select("*")
    .eq("id", params.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (!existing) return null;

  const row = existing as DbSentInvoice;
  const patch: Record<string, unknown> = {};

  if (params.invoiceNumber !== undefined) {
    patch.invoice_number = sanitizeText(params.invoiceNumber, 40);
  }
  if (params.notes !== undefined) {
    patch.notes = params.notes ? sanitizeText(params.notes, 500) : null;
  }

  let paymentStatus = row.payment_status as SentInvoicePaymentStatus;
  let amountReceived = Number(row.amount_received) || 0;
  const amountTotal = Number(row.amount_total) || 0;

  if (params.paymentStatus !== undefined) {
    paymentStatus = params.paymentStatus;
    patch.payment_status = paymentStatus;

    if (paymentStatus === "paid") {
      amountReceived = amountTotal;
      patch.amount_received = amountReceived;
    } else if (paymentStatus === "unpaid") {
      amountReceived = 0;
      patch.amount_received = 0;
    }
  }

  if (params.amountReceived !== undefined) {
    amountReceived = sanitizeMoney(params.amountReceived);
    patch.amount_received = amountReceived;
    if (amountReceived <= 0) {
      paymentStatus = "unpaid";
      patch.payment_status = "unpaid";
    } else if (amountReceived >= amountTotal) {
      paymentStatus = "paid";
      patch.payment_status = "paid";
      patch.amount_received = amountTotal;
      amountReceived = amountTotal;
    } else {
      paymentStatus = "partial";
      patch.payment_status = "partial";
    }
  }

  const { data, error } = await admin
    .from("dispatch_sent_invoices")
    .update(patch)
    .eq("id", params.id)
    .select("*")
    .single();

  if (error) {
    console.error("[dispatch-sent-invoices-db] update failed:", error);
    return null;
  }

  if (params.syncLoads !== false) {
    const lineItems = (row.line_items as SentInvoiceLineItem[]) ?? [];
    await syncLoadsForPayment(lineItems, paymentStatus, amountReceived);
  }

  return rowToRecord(data as DbSentInvoice);
}

export async function softDeleteSentInvoice(id: string): Promise<boolean> {
  const admin = getServiceRoleClient();
  if (!admin) return false;

  const { error } = await admin
    .from("dispatch_sent_invoices")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);

  return !error;
}
