import type {
  DashboardAlert,
  DashboardCarrier,
  DashboardInvoice,
  DashboardLoad,
  DispatchDashboardData,
  DispatchSheetRow,
  FleetOverview,
  RevenuePoint,
  SummaryCard,
} from "./dispatch-dashboard-types";
import {
  listMonthTabOptions,
  resolveActiveMonthTab,
  resolveGidForMonthTab,
} from "./dispatch-sheet-tabs";
import { buildTopBookers } from "./carrier-sheet";

const SHEET_HEADERS = [
  "SR#",
  "Booked By",
  "RC DATE",
  "Truck & Trailer",
  "Company Name",
  "BROKER",
  "Load Details",
  "Pickup Date & Time",
  "Delivery Date & Time",
  "MILES",
  "Load #",
  "States",
  "RC-INVOICE",
  "%",
  "DISPATCH FEE",
  "INVOICE",
  "RECEIVED",
  "BALANCE",
  "NOTES",
  "CLAIM",
  "STATUS",
  "CPAY",
  "DTP",
  "Broker Agent Name",
  "Email",
  "Phone",
  "Notes",
] as const;

/** Parse a CSV line respecting quoted fields. */
export function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

export function parseMoney(value: string | undefined): number {
  if (!value) return 0;
  const cleaned = value.replace(/[$,\s]/g, "");
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function parseNumber(value: string | undefined): number {
  if (!value) return 0;
  const n = Number.parseFloat(value.replace(/[,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, " ");
}

function rowFromCells(cells: string[]): DispatchSheetRow | null {
  const padded = [...cells];
  while (padded.length < SHEET_HEADERS.length) padded.push("");

  const sr = padded[0]?.trim() ?? "";
  const company = padded[4]?.trim() ?? "";
  const loadNum = padded[10]?.trim() ?? "";

  const joined = cells.join(" ").toUpperCase();
  if (joined.includes("TOTAL MILES") || joined.includes("TOTAL LOAD AMOUNT")) return null;
  if (!sr && !company && !loadNum) return null;
  if (sr.toUpperCase().includes("TOTAL")) return null;

  return {
    sr,
    bookedBy: padded[1]?.trim() ?? "",
    rcDate: padded[2]?.trim() ?? "",
    truckTrailer: padded[3]?.trim() ?? "",
    companyName: company,
    broker: padded[5]?.trim() ?? "",
    loadDetails: padded[6]?.trim() ?? "",
    pickupDateTime: padded[7]?.trim() ?? "",
    deliveryDateTime: padded[8]?.trim() ?? "",
    miles: parseNumber(padded[9]),
    loadNumber: loadNum,
    states: padded[11]?.trim() ?? "",
    rcInvoice: parseMoney(padded[12]),
    dispatchPercent: parseNumber(padded[13]),
    dispatchFee: parseMoney(padded[14]),
    invoice: padded[15]?.trim() ?? "",
    received: parseMoney(padded[16]),
    balance: parseMoney(padded[17]),
    notes: padded[18]?.trim() ?? "",
    claim: padded[19]?.trim() ?? "",
    status: padded[20]?.trim() ?? "",
    cpay: padded[21]?.trim() ?? "",
    dtp: padded[22]?.trim() ?? "",
    brokerAgentName: padded[23]?.trim() ?? "",
    email: padded[24]?.trim() ?? "",
    phone: padded[25]?.trim() ?? "",
    extraNotes: padded[26]?.trim() ?? "",
  };
}

function findHeaderRowIndex(lines: string[]): number {
  for (let i = 0; i < Math.min(lines.length, 8); i++) {
    const first = normalizeHeader(parseCsvLine(lines[i])[0] ?? "");
    if (first === "sr#" || first === "sr") return i;
  }
  return 0;
}

export function parseDispatchCsv(csv: string): DispatchSheetRow[] {
  const lines = csv.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  const headerIndex = findHeaderRowIndex(lines);
  const dataLines = lines.slice(headerIndex + 1);
  const rows: DispatchSheetRow[] = [];

  for (const line of dataLines) {
    const row = rowFromCells(parseCsvLine(line));
    if (row) rows.push(row);
  }

  return rows;
}

function parseFlexibleDate(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isToday(value: string): boolean {
  const d = parseFlexibleDate(value);
  if (!d) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isSameWeek(date: Date, ref: Date): boolean {
  const start = new Date(ref);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return date >= start && date < end;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function deriveLoadStatus(row: DispatchSheetRow): string {
  if (row.status) return row.status;
  if (row.claim) return "Claim";
  if (row.invoice.toLowerCase() === "pending") return "Pending Invoice";
  if (row.balance > 0) return "Unpaid";
  if (row.pickupDateTime && !row.deliveryDateTime) return "In Transit";
  if (row.deliveryDateTime) return "Delivered";
  return "Booked";
}

function splitRoute(loadDetails: string, states: string): { origin: string; destination: string } {
  if (!loadDetails && !states) return { origin: "—", destination: "—" };
  const parts = loadDetails.split(/\s*(?:→|->| to |—|-)\s*/i).filter(Boolean);
  if (parts.length >= 2) {
    return { origin: parts[0], destination: parts[parts.length - 1] };
  }
  if (states) {
    const st = states.split(/[,/]/).map((s) => s.trim()).filter(Boolean);
    if (st.length >= 2) return { origin: st[0], destination: st[st.length - 1] };
    if (st.length === 1) return { origin: st[0], destination: "—" };
  }
  return { origin: loadDetails || "—", destination: "—" };
}

function buildRevenueChart(rows: DispatchSheetRow[]): RevenuePoint[] {
  const now = new Date();
  const buckets = new Map<string, number>();
  for (const day of WEEKDAYS.slice(0, 5)) buckets.set(day, 0);

  for (const row of rows) {
    const d = parseFlexibleDate(row.rcDate);
    if (!d || !isSameWeek(d, now)) continue;
    const idx = (d.getDay() + 6) % 7;
    if (idx > 4) continue;
    const key = WEEKDAYS[idx];
    buckets.set(key, (buckets.get(key) ?? 0) + row.rcInvoice);
  }

  return WEEKDAYS.slice(0, 5).map((day) => ({
    day,
    amount: Math.round(buckets.get(day) ?? 0),
  }));
}

function buildFleetOverview(rows: DispatchSheetRow[]): FleetOverview {
  const trucks = new Set<string>();
  const activeTrucks = new Set<string>();
  const inTransitTrucks = new Set<string>();

  for (const row of rows) {
    if (!row.truckTrailer) continue;
    trucks.add(row.truckTrailer);
    const status = deriveLoadStatus(row).toLowerCase();
    if (status.includes("transit") || (row.pickupDateTime && !row.deliveryDateTime)) {
      activeTrucks.add(row.truckTrailer);
      inTransitTrucks.add(row.truckTrailer);
    } else if (row.pickupDateTime || row.rcInvoice > 0) {
      activeTrucks.add(row.truckTrailer);
    }
  }

  const total = Math.max(trucks.size, rows.filter((r) => r.companyName).length, 1);
  const active = activeTrucks.size || Math.min(total, rows.filter((r) => r.pickupDateTime).length);
  const inTransit = inTransitTrucks.size;
  const available = Math.max(total - active, 0);

  return {
    total_units: total,
    active,
    available,
    in_transit: inTransit,
  };
}

function buildAlerts(rows: DispatchSheetRow[], pendingCarriers: number): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];

  if (pendingCarriers > 0) {
    alerts.push({
      type: "carrier_packet",
      message: `${pendingCarriers} carrier packet${pendingCarriers > 1 ? "s" : ""} pending review`,
      severity: "medium",
    });
  }

  const unpaid = rows.filter(
    (r) => r.balance > 0 || r.status.toLowerCase() === "unpaid",
  );
  if (unpaid.length > 0) {
    alerts.push({
      type: "payment",
      message: `Payment follow-up required (${unpaid.length} open balance${unpaid.length > 1 ? "s" : ""})`,
      severity: "high",
    });
  }

  const pendingInvoices = rows.filter((r) => r.invoice.toLowerCase() === "pending");
  if (pendingInvoices.length > 0) {
    alerts.push({
      type: "invoice",
      message: `${pendingInvoices.length} invoice${pendingInvoices.length > 1 ? "s" : ""} pending`,
      severity: "medium",
    });
  }

  const claims = rows.filter((r) => r.claim.trim().length > 0);
  if (claims.length > 0) {
    alerts.push({
      type: "claim",
      message: `${claims.length} active claim${claims.length > 1 ? "s" : ""} on loads`,
      severity: "high",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      type: "ok",
      message: "No critical alerts — dispatch sheet is current",
      severity: "low",
    });
  }

  return alerts;
}

export function buildDashboardFromRows(
  rows: DispatchSheetRow[],
  opts?: {
    pendingCarriers?: number;
    sheetConnected?: boolean;
    sheetSource?: string;
    activeTab?: string;
  },
): DispatchDashboardData {
  const grossRevenue = rows.reduce((s, r) => s + r.rcInvoice, 0);
  const commission = rows.reduce((s, r) => s + r.dispatchFee, 0);
  const totalMiles = rows.reduce((s, r) => s + r.miles, 0);
  const loadsToday = rows.filter(
    (r) => isToday(r.rcDate) || isToday(r.pickupDateTime),
  ).length;
  const fleet = buildFleetOverview(rows);
  const revenueChart = buildRevenueChart(rows);
  const revenueThisWeek = revenueChart.reduce((s, p) => s + p.amount, 0);
  const unpaidTotal = rows.reduce((s, r) => s + Math.max(r.balance, 0), 0);

  const carriersMap = new Map<string, DashboardCarrier>();
  for (const row of rows) {
    if (!row.companyName) continue;
    const existing = carriersMap.get(row.companyName);
    if (existing) {
      existing.loads_count += 1;
      if (row.truckTrailer) existing.equipment = row.truckTrailer;
    } else {
      const { origin } = splitRoute(row.loadDetails, row.states);
      carriersMap.set(row.companyName, {
        carrier_id: row.companyName,
        company_name: row.companyName,
        equipment: row.truckTrailer || "—",
        location: origin,
        status: deriveLoadStatus(row).includes("Transit") ? "In Transit" : "Active",
        loads_count: 1,
        source: "sheet",
      });
    }
  }

  const summary_cards: SummaryCard[] = [
    { title: "Active Trucks", value: fleet.active, icon: "truck" },
    { title: "Available Trucks", value: fleet.available, icon: "truck-available" },
    { title: "Loads Today", value: loadsToday, icon: "load" },
    {
      title: "Gross Revenue",
      value: Math.round(grossRevenue),
      currency: "USD",
      icon: "dollar",
      highlight: "green",
    },
    {
      title: "Dispatcher Commission",
      value: Math.round(commission),
      currency: "USD",
      icon: "wallet",
      highlight: "orange",
    },
  ];

  const loads: DashboardLoad[] = rows.map((row, i) => {
    const { origin, destination } = splitRoute(row.loadDetails, row.states);
    return {
      load_id: row.loadNumber || `LD-${row.sr || i + 1}`,
      sr: row.sr || String(i + 1),
      booked_by: row.bookedBy || "—",
      rc_date: row.rcDate || "—",
      truck_trailer: row.truckTrailer || "—",
      carrier: row.companyName || "—",
      broker: row.broker || "—",
      load_details: row.loadDetails || "—",
      origin,
      destination,
      pickup: row.pickupDateTime || "—",
      delivery: row.deliveryDateTime || "—",
      miles: row.miles,
      load_number: row.loadNumber || "—",
      states: row.states || "—",
      rate: row.rcInvoice,
      dispatch_percent: row.dispatchPercent,
      dispatch_fee: row.dispatchFee,
      invoice_status: row.invoice || "—",
      received: row.received,
      balance: row.balance,
      notes: row.notes || row.extraNotes || "—",
      claim: row.claim || "—",
      status: row.status || deriveLoadStatus(row),
      cpay: row.cpay || "—",
      broker_agent: row.brokerAgentName || "—",
      email: row.email || "—",
      phone: row.phone || "—",
    };
  });

  const invoices: DashboardInvoice[] = rows
    .filter((r) => r.rcInvoice > 0 || r.invoice || r.balance > 0)
    .map((row, i) => ({
      invoice_id: row.invoice || `INV-${row.sr || i + 1}`,
      carrier: row.companyName || "—",
      amount: row.rcInvoice,
      received: row.received,
      balance: row.balance,
      due_date: row.rcDate || row.deliveryDateTime || "—",
      status:
        row.balance > 0 || row.status.toLowerCase() === "unpaid"
          ? "Unpaid"
          : row.received >= row.rcInvoice && row.rcInvoice > 0
            ? "Paid"
            : row.invoice || "Pending",
    }));

  return {
    company: { name: "Alpha Freight Network", logo: "/icon-512.png" },
    summary_cards,
    fleet_overview: fleet,
    revenue_chart: { period: "weekly", data: revenueChart },
    alerts: buildAlerts(rows, opts?.pendingCarriers ?? 0),
    loads,
    carriers: Array.from(carriersMap.values()),
    invoices,
    quick_actions: [
      { name: "Add Carrier", icon: "user-plus", href: "/freight/dispatcher/carriers?action=add" },
      { name: "Book Load", icon: "truck", href: "/freight/dispatcher/loads?action=book" },
      { name: "Generate Invoice", icon: "file", href: "/freight/dispatcher/invoices?action=generate" },
      { name: "Manage Drivers", icon: "upload", href: "/freight/dispatcher/drivers" },
    ],
    top_bookers: buildTopBookers(
      loads.map((l) => ({
        booked_by: l.booked_by,
        rate: l.rate,
        dispatch_fee: l.dispatch_fee,
      })),
    ),
    carrier_roster: [],
    driver_roster: [],
    footer_stats: {
      carriers_managed: carriersMap.size,
      revenue_this_week: revenueThisWeek,
      commission_earned: Math.round(commission),
      unpaid_invoices: Math.round(unpaidTotal),
      total_miles: totalMiles,
    },
    sheet_meta: {
      connected: opts?.sheetConnected ?? false,
      row_count: rows.length,
      last_synced: new Date().toISOString(),
      source: opts?.sheetSource ?? "dispatch-sheet",
      workbook_name: "Alpha Freight Network Website",
      active_tab: opts?.activeTab ?? resolveActiveMonthTab(),
      available_tabs: listMonthTabOptions(),
      carrier_sheet_connected: false,
    },
  };
}

function isDispatchCsv(csv: string): boolean {
  const head = csv.slice(0, 1200).toLowerCase();
  return head.includes("sr#") && head.includes("dispatch");
}

async function fetchCsvUrl(url: string): Promise<string | null> {
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) return null;
  const text = await res.text();
  return isDispatchCsv(text) ? text : null;
}

export async function fetchDispatchSheetCsv(requestedTab?: string | null): Promise<{
  csv: string | null;
  source: string;
  activeTab: string;
}> {
  const activeTab = resolveActiveMonthTab(requestedTab);

  const csvUrl = process.env.GOOGLE_DISPATCH_SHEET_CSV_URL?.trim();
  if (csvUrl) {
    const csv = await fetchCsvUrl(csvUrl);
    if (csv) return { csv, source: csvUrl, activeTab };
    throw new Error(`Sheet fetch failed or invalid CSV at GOOGLE_DISPATCH_SHEET_CSV_URL`);
  }

  const sheetId = process.env.GOOGLE_DISPATCH_SHEET_ID?.trim();
  if (!sheetId) return { csv: null, source: "none", activeTab };

  const attempts: { url: string; label: string }[] = [];

  if (activeTab) {
    const monthGid = resolveGidForMonthTab(activeTab);
    if (monthGid) {
      attempts.push({
        label: `${activeTab}:gid:${monthGid}`,
        url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${monthGid}`,
      });
    }

    const encoded = encodeURIComponent(activeTab);
    attempts.push({
      label: activeTab,
      url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&sheet=${encoded}`,
    });
  }

  const gid = process.env.GOOGLE_DISPATCH_SHEET_GID?.trim();
  if (gid) {
    attempts.push({
      label: `gid:${gid}`,
      url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`,
    });
  }

  attempts.push({
    label: "gid:0",
    url: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=0`,
  });

  for (const attempt of attempts) {
    const csv = await fetchCsvUrl(attempt.url);
    if (csv) {
      return { csv, source: attempt.url, activeTab: activeTab || attempt.label };
    }
  }

  throw new Error(`Google Sheet export failed for workbook ${sheetId}`);
}
