import type { DispatchDashboardData } from "./dispatch-dashboard-types";
import { enrichLoadsWithCarrierRoster } from "./carrier-contact";
import { buildTopBookers } from "./carrier-sheet";
import {
  buildDashboardFromRows,
  fetchDispatchSheetCsv,
  parseDispatchCsv,
} from "./dispatch-sheet";
import {
  dbLoadToDashboardLoad,
  fetchDispatchLoadsFromDb,
} from "./dispatch-loads-db";
import { loadCarrierRoster, loadDriverRoster } from "./dispatch-roster";
import { createClient } from "@/lib/supabase/server";
import { resolveActiveMonthTab } from "./dispatch-sheet-tabs";

function attachLoadsToRoster(
  roster: DispatchDashboardData["carrier_roster"],
  loads: DispatchDashboardData["loads"],
): DispatchDashboardData["carrier_roster"] {
  const counts = new Map<string, number>();
  for (const load of loads) {
    const key = load.carrier.trim().toLowerCase();
    if (!key || key === "—") continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return roster.map((c) => ({
    ...c,
    loadsBooked: counts.get(c.companyName.toLowerCase()) ?? 0,
  }));
}

export async function buildDispatchDashboard(
  requestedTab?: string | null,
): Promise<DispatchDashboardData> {
  let pendingCarriers = 0;
  const supabaseCarriers: DispatchDashboardData["carriers"] = [];

  const sb = await createClient();
  if (sb) {
    const { count } = await sb
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "carrier")
      .eq("carrier_status", "pending");
    pendingCarriers = count ?? 0;

    const { data: verified } = await sb
      .from("profiles")
      .select("id,company_name,full_name,carrier_status")
      .eq("role", "carrier")
      .eq("carrier_status", "verified")
      .order("company_name", { ascending: true });

    for (const c of verified ?? []) {
      supabaseCarriers.push({
        carrier_id: c.id,
        company_name: c.company_name || c.full_name || "Unnamed carrier",
        equipment: "—",
        location: "—",
        status: "Verified",
        loads_count: 0,
        source: "supabase",
      });
    }
  }

  const [carrierRosterResult, driverRoster] = await Promise.all([
    loadCarrierRoster(),
    loadDriverRoster(),
  ]);

  const activeTab = requestedTab?.trim() || resolveActiveMonthTab();
  const dbRows = await fetchDispatchLoadsFromDb(activeTab);

  if (dbRows.length > 0) {
    const loads = dbRows.map((row, i) => dbLoadToDashboardLoad(row, i));
    const dashboard = buildDashboardFromRows(
      dbRows.map((r) => ({
        sr: String(r.sr),
        bookedBy: r.booked_by ?? "",
        rcDate: r.rc_date ?? "",
        truckTrailer: r.truck_trailer ?? "",
        companyName: r.company_name,
        broker: r.broker ?? "",
        loadDetails: r.load_details ?? "",
        pickupDateTime: r.pickup_date_time ?? "",
        deliveryDateTime: r.delivery_date_time ?? "",
        miles: Number(r.miles) || 0,
        loadNumber: r.load_number ?? "",
        states: r.states ?? "",
        rcInvoice: Number(r.rc_invoice) || 0,
        dispatchPercent: Number(r.dispatch_percent) || 0,
        dispatchFee: Number(r.dispatch_fee) || 0,
        invoice: r.invoice ?? "",
        received: Number(r.received) || 0,
        balance: Number(r.balance) || 0,
        notes: r.notes ?? "",
        claim: r.claim ?? "",
        status: r.status ?? "",
        cpay: r.cpay ?? "",
        dtp: r.dtp ?? "",
        brokerAgentName: r.broker_agent_name ?? "",
        email: r.email ?? "",
        phone: r.phone ?? "",
        extraNotes: "",
      })),
      {
        pendingCarriers,
        sheetConnected: true,
        sheetSource: "supabase",
        activeTab,
      },
    );

    dashboard.loads = enrichLoadsWithCarrierRoster(loads, carrierRosterResult.carriers);
    dashboard.top_bookers = buildTopBookers(
      dashboard.loads.map((l) => ({
        booked_by: l.booked_by,
        rate: l.rate,
        dispatch_fee: l.dispatch_fee,
      })),
    );
    dashboard.carrier_roster = attachLoadsToRoster(
      carrierRosterResult.carriers,
      dashboard.loads,
    );
    dashboard.driver_roster = driverRoster;
    dashboard.sheet_meta.carrier_sheet_connected = carrierRosterResult.sheetConnected;
    dashboard.sheet_meta.source = "supabase";

    const mergedCarriers = [...dashboard.carriers];
    for (const sc of supabaseCarriers) {
      if (!mergedCarriers.some((c) => c.company_name === sc.company_name)) {
        mergedCarriers.push(sc);
      }
    }
    dashboard.carriers = mergedCarriers;
    dashboard.footer_stats.carriers_managed = Math.max(
      dashboard.footer_stats.carriers_managed,
      dashboard.carrier_roster.length,
    );
    return dashboard;
  }

  try {
    const { csv, source, activeTab } = await fetchDispatchSheetCsv(requestedTab);
    if (csv) {
      const rows = parseDispatchCsv(csv);
      const dashboard = buildDashboardFromRows(rows, {
        pendingCarriers,
        sheetConnected: true,
        sheetSource: source,
        activeTab,
      });

      dashboard.loads = enrichLoadsWithCarrierRoster(
        dashboard.loads,
        carrierRosterResult.carriers,
      );

      dashboard.top_bookers = buildTopBookers(
        dashboard.loads.map((l) => ({
          booked_by: l.booked_by,
          rate: l.rate,
          dispatch_fee: l.dispatch_fee,
        })),
      );
      dashboard.carrier_roster = attachLoadsToRoster(
        carrierRosterResult.carriers,
        dashboard.loads,
      );
      dashboard.driver_roster = driverRoster;
      dashboard.sheet_meta.carrier_sheet_connected = carrierRosterResult.sheetConnected;

      const mergedCarriers = [...dashboard.carriers];
      for (const sc of supabaseCarriers) {
        if (!mergedCarriers.some((c) => c.company_name === sc.company_name)) {
          mergedCarriers.push(sc);
        }
      }
      dashboard.carriers = mergedCarriers;
      dashboard.footer_stats.carriers_managed = Math.max(
        dashboard.footer_stats.carriers_managed,
        dashboard.carrier_roster.length,
      );
      return dashboard;
    }
  } catch (e) {
    console.error("[dispatch-dashboard] sheet fetch failed:", e);
  }

  const empty = buildDashboardFromRows([], {
    pendingCarriers,
    sheetConnected: false,
    sheetSource: "not-configured",
    activeTab: requestedTab ?? "",
  });
  empty.top_bookers = [];
  empty.carrier_roster = carrierRosterResult.carriers;
  empty.driver_roster = driverRoster;
  empty.sheet_meta.carrier_sheet_connected = carrierRosterResult.sheetConnected;
  empty.carriers = supabaseCarriers;
  empty.footer_stats.carriers_managed = supabaseCarriers.length;
  empty.alerts.unshift({
    type: "config",
    message:
      "Connect your Google Dispatch Sheet — set GOOGLE_DISPATCH_SHEET_ID in environment variables",
    severity: "medium",
  });
  return empty;
}
