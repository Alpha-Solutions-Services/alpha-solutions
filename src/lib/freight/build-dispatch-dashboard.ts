import type { DispatchDashboardData } from "./dispatch-dashboard-types";
import {
  buildDashboardFromRows,
  fetchDispatchSheetCsv,
  parseDispatchCsv,
} from "./dispatch-sheet";
import { createClient } from "@/lib/supabase/server";

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

      const mergedCarriers = [...dashboard.carriers];
      for (const sc of supabaseCarriers) {
        if (!mergedCarriers.some((c) => c.company_name === sc.company_name)) {
          mergedCarriers.push(sc);
        }
      }
      dashboard.carriers = mergedCarriers;
      dashboard.footer_stats.carriers_managed = Math.max(
        dashboard.footer_stats.carriers_managed,
        mergedCarriers.length,
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
