import { normalizeCompanyKey } from "./carrier-contact";
import type { CarrierDashboardData, CarrierLoadRow } from "./carrier-dashboard-types";
import {
  fetchCarrierPortalConfig,
  mergePortalConfig,
} from "./carrier-portal-db";
import { getCarrierMockDashboard } from "./carrier-mock-data";
import {
  dbLoadToDashboardLoad,
  fetchCarrierLoadsFromDb,
} from "./dispatch-loads-db";
import { fetchDispatchSheetCsv, parseDispatchCsv } from "./dispatch-sheet";
import { loadDriverRoster } from "./dispatch-roster";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

function mapSheetRowToLoad(row: {
  loadNumber: string;
  sr: string;
  pickupDateTime: string;
  deliveryDateTime: string;
  rcInvoice: number;
  status: string;
  bookedBy: string;
  miles: number;
}): CarrierLoadRow {
  return {
    load_id: row.loadNumber || `LD-${row.sr}`,
    load_number: row.loadNumber || row.sr,
    pickup: row.pickupDateTime || "—",
    delivery: row.deliveryDateTime || "—",
    rate: row.rcInvoice,
    status: row.status || "Booked",
    dispatcher: row.bookedBy || "Alpha Dispatch",
    miles: row.miles,
  };
}

function applyLoadsToDashboard(
  dashboard: CarrierDashboardData,
  loads: CarrierLoadRow[],
  miles: number,
): CarrierDashboardData {
  const revenue = loads.reduce((s, l) => s + l.rate, 0);
  const inTransit = loads.find((l) => l.status.toLowerCase().includes("transit"));

  dashboard.loads = loads;
  dashboard.summary.active_loads = loads.filter(
    (l) => !["delivered", "paid", "completed"].includes(l.status.toLowerCase()),
  ).length;
  dashboard.summary.weekly_revenue = revenue || dashboard.summary.weekly_revenue;
  dashboard.summary.miles_driven = miles || dashboard.summary.miles_driven;
  dashboard.summary.rpm =
    miles > 0 ? Math.round((revenue / miles) * 100) / 100 : dashboard.summary.rpm;

  if (inTransit) {
    dashboard.current_load = {
      load_number: inTransit.load_number,
      pickup: inTransit.pickup,
      delivery: inTransit.delivery,
      rate: inTransit.rate,
      status: inTransit.status,
      eta: "—",
      truck_location: dashboard.trucks[0]?.location,
    };
  }

  return dashboard;
}

export async function buildCarrierDashboard(opts: {
  companyName: string;
  mcNumber?: string;
  ownerName?: string;
  carrierProfileId?: string;
}): Promise<CarrierDashboardData> {
  let dashboard = getCarrierMockDashboard(opts.companyName || "ABC Trucking LLC");

  if (opts.mcNumber) dashboard.carrier.mc_number = opts.mcNumber;
  if (opts.ownerName) dashboard.carrier.owner = opts.ownerName;
  dashboard.carrier.company_name = opts.companyName || dashboard.carrier.company_name;
  if (opts.carrierProfileId) dashboard.carrier.carrier_id = opts.carrierProfileId;

  const key = normalizeCompanyKey(opts.companyName || "");

  const dbRows = await fetchCarrierLoadsFromDb({
    companyName: opts.companyName || "",
    carrierProfileId: opts.carrierProfileId,
  });

  if (dbRows.length > 0) {
    const loads = dbRows.map((row, i) => {
      const dl = dbLoadToDashboardLoad(row, i);
      return {
        load_id: dl.load_id,
        load_number: dl.load_number !== "—" ? dl.load_number : dl.sr,
        pickup: dl.pickup,
        delivery: dl.delivery,
        rate: dl.rate,
        status: dl.status,
        dispatcher: dl.booked_by !== "—" ? dl.booked_by : "Alpha Dispatch",
        miles: dl.miles,
      };
    });
    const miles = dbRows.reduce((s, r) => s + (Number(r.miles) || 0), 0);
    dashboard = applyLoadsToDashboard(dashboard, loads, miles);
    dashboard.data_source = "live";
  } else {
    try {
      const { csv } = await fetchDispatchSheetCsv();
      if (csv && key) {
        const rows = parseDispatchCsv(csv).filter(
          (r) => normalizeCompanyKey(r.companyName) === key,
        );
        if (rows.length > 0) {
          const loads = rows.map(mapSheetRowToLoad);
          const miles = rows.reduce((s, r) => s + r.miles, 0);
          dashboard = applyLoadsToDashboard(dashboard, loads, miles);
          dashboard.data_source = "hybrid";
        }
      }
    } catch (e) {
      console.warn("[carrier-dashboard] sheet merge skipped:", e);
    }
  }

  const driverRoster = await loadDriverRoster();
  const companyDrivers = driverRoster
    .filter((d) => normalizeCompanyKey(d.carrierCompanyName) === key)
    .map((d) => ({
      driver_id: d.id,
      name: d.driverName,
      phone: d.driverPhone,
      status: "Active",
      score: 90,
    }));
  if (companyDrivers.length) {
    dashboard.drivers = companyDrivers;
  }

  const admin = getServiceRoleClient();
  if (admin && opts.carrierProfileId) {
    const { data: driverProfiles } = await admin
      .from("profiles")
      .select("id,full_name,phone")
      .eq("role", "driver")
      .eq("carrier_id", opts.carrierProfileId);
    for (const dp of driverProfiles ?? []) {
      if (!dashboard.drivers.some((d) => d.driver_id === dp.id)) {
        dashboard.drivers.push({
          driver_id: dp.id,
          name: (dp.full_name as string) || "Driver",
          phone: (dp.phone as string) || "—",
          status: "Active",
        });
      }
    }
  }

  const portalConfig = await fetchCarrierPortalConfig({
    companyName: opts.companyName || "",
    carrierProfileId: opts.carrierProfileId,
  });

  return mergePortalConfig(dashboard, portalConfig);
}
