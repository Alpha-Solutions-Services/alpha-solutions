import type { DashboardLoad, DispatchSheetRow } from "./dispatch-dashboard-types";
import { splitRoute } from "./dispatch-sheet";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { sanitizeMoney, sanitizeText } from "./api-security";

export type DbDispatchLoad = {
  id: string;
  month_tab: string;
  sr: number;
  booked_by: string | null;
  rc_date: string | null;
  truck_trailer: string | null;
  company_name: string;
  broker: string | null;
  load_details: string | null;
  pickup_date_time: string | null;
  delivery_date_time: string | null;
  miles: number;
  load_number: string | null;
  states: string | null;
  rc_invoice: number;
  dispatch_percent: number;
  dispatch_fee: number;
  invoice: string | null;
  received: number;
  balance: number;
  notes: string | null;
  claim: string | null;
  status: string;
  cpay: string | null;
  dtp: string | null;
  broker_agent_name: string | null;
  email: string | null;
  phone: string | null;
  carrier_profile_id: string | null;
  assigned_driver_profile_id: string | null;
  deleted_at: string | null;
};

export type LoadInsertPayload = {
  monthTab: string;
  companyName: string;
  broker?: string;
  loadDetails?: string;
  pickupDateTime?: string;
  deliveryDateTime?: string;
  miles?: number;
  loadNumber?: string;
  states?: string;
  rcInvoice?: number;
  dispatchPercent?: number;
  dispatchFee?: number;
  status?: string;
  bookedBy?: string;
  truckTrailer?: string;
  email?: string;
  phone?: string;
  carrierProfileId?: string;
  assignedDriverProfileId?: string;
};

function dbToSheetRow(row: DbDispatchLoad): DispatchSheetRow {
  return {
    sr: String(row.sr),
    bookedBy: row.booked_by ?? "",
    rcDate: row.rc_date ?? "",
    truckTrailer: row.truck_trailer ?? "",
    companyName: row.company_name,
    broker: row.broker ?? "",
    loadDetails: row.load_details ?? "",
    pickupDateTime: row.pickup_date_time ?? "",
    deliveryDateTime: row.delivery_date_time ?? "",
    miles: Number(row.miles) || 0,
    loadNumber: row.load_number ?? "",
    states: row.states ?? "",
    rcInvoice: Number(row.rc_invoice) || 0,
    dispatchPercent: Number(row.dispatch_percent) || 0,
    dispatchFee: Number(row.dispatch_fee) || 0,
    invoice: row.invoice ?? "",
    received: Number(row.received) || 0,
    balance: Number(row.balance) || 0,
    notes: row.notes ?? "",
    claim: row.claim ?? "",
    status: row.status ?? "",
    cpay: row.cpay ?? "",
    dtp: row.dtp ?? "",
    brokerAgentName: row.broker_agent_name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    extraNotes: "",
  };
}

export function dbLoadToDashboardLoad(row: DbDispatchLoad, index: number): DashboardLoad {
  const sheet = dbToSheetRow(row);
  const { origin, destination } = splitRoute(sheet.loadDetails, sheet.states);
  return {
    load_id: sheet.loadNumber || `LD-${sheet.sr || index + 1}`,
    sr: sheet.sr || String(index + 1),
    booked_by: sheet.bookedBy || "—",
    rc_date: sheet.rcDate || "—",
    truck_trailer: sheet.truckTrailer || "—",
    carrier: sheet.companyName || "—",
    broker: sheet.broker || "—",
    load_details: sheet.loadDetails || "—",
    origin,
    destination,
    pickup: sheet.pickupDateTime || "—",
    delivery: sheet.deliveryDateTime || "—",
    miles: sheet.miles,
    load_number: sheet.loadNumber || "—",
    states: sheet.states || "—",
    rate: sheet.rcInvoice,
    dispatch_percent: sheet.dispatchPercent,
    dispatch_fee: sheet.dispatchFee,
    invoice_status: sheet.invoice || "—",
    received: sheet.received,
    balance: sheet.balance,
    notes: sheet.notes || "—",
    claim: sheet.claim || "—",
    status: sheet.status || "Unpaid",
    cpay: sheet.cpay || "—",
    broker_agent: sheet.brokerAgentName || "—",
    email: sheet.email || "—",
    phone: sheet.phone || "—",
    db_id: row.id,
    data_source: "supabase",
  };
}

export async function fetchDispatchLoadsFromDb(
  monthTab: string,
): Promise<DbDispatchLoad[]> {
  const admin = getServiceRoleClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("dispatch_loads")
    .select("*")
    .eq("month_tab", monthTab)
    .is("deleted_at", null)
    .order("sr", { ascending: true });

  if (error) {
    console.warn("[dispatch-loads-db] fetch failed:", error.message);
    return [];
  }

  return (data ?? []) as DbDispatchLoad[];
}

export async function fetchCarrierLoadsFromDb(opts: {
  companyName: string;
  carrierProfileId?: string;
}): Promise<DbDispatchLoad[]> {
  const admin = getServiceRoleClient();
  if (!admin) return [];

  let query = admin
    .from("dispatch_loads")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (opts.carrierProfileId) {
    query = query.or(
      `carrier_profile_id.eq.${opts.carrierProfileId},company_name.ilike.${opts.companyName}`,
    );
  } else {
    query = query.ilike("company_name", opts.companyName);
  }

  const { data, error } = await query;
  if (error) {
    console.warn("[dispatch-loads-db] carrier fetch failed:", error.message);
    return [];
  }
  return (data ?? []) as DbDispatchLoad[];
}

export async function fetchDriverLoadsFromDb(
  driverProfileId: string,
): Promise<DbDispatchLoad[]> {
  const admin = getServiceRoleClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("dispatch_loads")
    .select("*")
    .eq("assigned_driver_profile_id", driverProfileId)
    .is("deleted_at", null)
    .order("pickup_date_time", { ascending: false });

  if (error) {
    console.warn("[dispatch-loads-db] driver fetch failed:", error.message);
    return [];
  }
  return (data ?? []) as DbDispatchLoad[];
}

async function nextSrForTab(monthTab: string): Promise<number> {
  const admin = getServiceRoleClient();
  if (!admin) return 1;

  const { data } = await admin
    .from("dispatch_loads")
    .select("sr")
    .eq("month_tab", monthTab)
    .is("deleted_at", null)
    .order("sr", { ascending: false })
    .limit(1);

  const max = data?.[0]?.sr;
  return (typeof max === "number" ? max : 0) + 1;
}

function computeDispatchFeeFromPayload(
  rcInvoice: number,
  dispatchPercent: number,
  dispatchFee?: number,
): number {
  if (dispatchFee && dispatchFee > 0) return dispatchFee;
  if (rcInvoice > 0 && dispatchPercent > 0) {
    return Math.round((rcInvoice * dispatchPercent) / 100 * 100) / 100;
  }
  return 0;
}

export async function insertDispatchLoad(
  payload: LoadInsertPayload,
  createdBy: string,
): Promise<{ id: string; sr: number } | null> {
  const admin = getServiceRoleClient();
  if (!admin) return null;

  const rcInvoice = sanitizeMoney(payload.rcInvoice ?? 0);
  const dispatchPercent = sanitizeMoney(payload.dispatchPercent ?? 5);
  const fee = computeDispatchFeeFromPayload(
    rcInvoice,
    dispatchPercent,
    payload.dispatchFee,
  );
  const sr = await nextSrForTab(payload.monthTab);

  const { data, error } = await admin
    .from("dispatch_loads")
    .insert({
      created_by: createdBy,
      month_tab: sanitizeText(payload.monthTab, 40),
      sr,
      company_name: sanitizeText(payload.companyName, 200),
      broker: payload.broker ? sanitizeText(payload.broker, 200) : null,
      load_details: payload.loadDetails ? sanitizeText(payload.loadDetails, 500) : null,
      pickup_date_time: payload.pickupDateTime
        ? sanitizeText(payload.pickupDateTime, 120)
        : null,
      delivery_date_time: payload.deliveryDateTime
        ? sanitizeText(payload.deliveryDateTime, 120)
        : null,
      miles: sanitizeMoney(payload.miles ?? 0),
      load_number: payload.loadNumber ? sanitizeText(payload.loadNumber, 80) : null,
      states: payload.states ? sanitizeText(payload.states, 80) : null,
      rc_invoice: rcInvoice,
      dispatch_percent: dispatchPercent,
      dispatch_fee: fee,
      status: payload.status ? sanitizeText(payload.status, 40) : "Unpaid",
      balance: fee,
      booked_by: payload.bookedBy ? sanitizeText(payload.bookedBy, 120) : null,
      truck_trailer: payload.truckTrailer ? sanitizeText(payload.truckTrailer, 120) : null,
      email: payload.email ? sanitizeText(payload.email, 200) : null,
      phone: payload.phone ? sanitizeText(payload.phone, 40) : null,
      carrier_profile_id: payload.carrierProfileId ?? null,
      assigned_driver_profile_id: payload.assignedDriverProfileId ?? null,
      rc_date: new Date().toLocaleDateString("en-US"),
      invoice: "Pending",
    })
    .select("id,sr")
    .single();

  if (error) {
    console.error("[dispatch-loads-db] insert failed:", error);
    return null;
  }
  return { id: data.id as string, sr: data.sr as number };
}

export async function softDeleteDispatchLoad(id: string): Promise<boolean> {
  const admin = getServiceRoleClient();
  if (!admin) return false;

  const { error } = await admin
    .from("dispatch_loads")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);

  return !error;
}

export async function updateDispatchLoad(
  id: string,
  patch: Partial<LoadInsertPayload & { status: string; received: number; balance: number }>,
): Promise<boolean> {
  const admin = getServiceRoleClient();
  if (!admin) return false;

  const row: Record<string, unknown> = {};
  if (patch.companyName !== undefined) row.company_name = sanitizeText(patch.companyName, 200);
  if (patch.broker !== undefined) row.broker = sanitizeText(patch.broker, 200);
  if (patch.loadDetails !== undefined) row.load_details = sanitizeText(patch.loadDetails, 500);
  if (patch.pickupDateTime !== undefined) {
    row.pickup_date_time = sanitizeText(patch.pickupDateTime, 120);
  }
  if (patch.deliveryDateTime !== undefined) {
    row.delivery_date_time = sanitizeText(patch.deliveryDateTime, 120);
  }
  if (patch.miles !== undefined) row.miles = sanitizeMoney(patch.miles);
  if (patch.loadNumber !== undefined) row.load_number = sanitizeText(patch.loadNumber, 80);
  if (patch.rcInvoice !== undefined) row.rc_invoice = sanitizeMoney(patch.rcInvoice);
  if (patch.dispatchPercent !== undefined) {
    row.dispatch_percent = sanitizeMoney(patch.dispatchPercent);
  }
  if (patch.status !== undefined) row.status = sanitizeText(patch.status, 40);
  if (patch.received !== undefined) row.received = sanitizeMoney(patch.received);
  if (patch.balance !== undefined) row.balance = sanitizeMoney(patch.balance);
  if (patch.assignedDriverProfileId !== undefined) {
    row.assigned_driver_profile_id = patch.assignedDriverProfileId || null;
  }

  const { error } = await admin.from("dispatch_loads").update(row).eq("id", id);
  return !error;
}
