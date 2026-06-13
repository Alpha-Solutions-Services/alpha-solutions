import { normalizeCompanyKey } from "./carrier-contact";
import type { CarrierDashboardData, CarrierLoadRow } from "./carrier-dashboard-types";
import { getCarrierMockDashboard } from "./carrier-mock-data";
import { fetchDispatchSheetCsv, parseDispatchCsv } from "./dispatch-sheet";

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

export async function buildCarrierDashboard(opts: {
  companyName: string;
  mcNumber?: string;
  ownerName?: string;
}): Promise<CarrierDashboardData> {
  const dashboard = getCarrierMockDashboard(opts.companyName || "ABC Trucking LLC");

  if (opts.mcNumber) dashboard.carrier.mc_number = opts.mcNumber;
  if (opts.ownerName) dashboard.carrier.owner = opts.ownerName;
  dashboard.carrier.company_name = opts.companyName || dashboard.carrier.company_name;

  const key = normalizeCompanyKey(opts.companyName || "");

  try {
    const { csv } = await fetchDispatchSheetCsv();
    if (!csv || !key) return dashboard;

    const rows = parseDispatchCsv(csv).filter(
      (r) => normalizeCompanyKey(r.companyName) === key,
    );

    if (rows.length === 0) return dashboard;

    const loads = rows.map(mapSheetRowToLoad);
    const revenue = loads.reduce((s, l) => s + l.rate, 0);
    const miles = rows.reduce((s, r) => s + r.miles, 0);
    const inTransit = loads.find((l) =>
      l.status.toLowerCase().includes("transit"),
    );

    dashboard.loads = loads.length ? loads : dashboard.loads;
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

    dashboard.data_source = "hybrid";
  } catch (e) {
    console.warn("[carrier-dashboard] sheet merge skipped:", e);
  }

  return dashboard;
}
