const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** Tab name format used in the workbook, e.g. "June 2026". */
export function formatMonthTab(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function parseMonthTab(tab: string): Date | null {
  const match = tab.trim().match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!match) return null;
  const monthIndex = MONTHS.findIndex(
    (m) => m.toLowerCase() === match[1].toLowerCase(),
  );
  if (monthIndex < 0) return null;
  return new Date(Number(match[2]), monthIndex, 1);
}

/** Recent + upcoming monthly tabs for the month picker. */
export function listMonthTabOptions(anchor = new Date(), past = 12, future = 3): string[] {
  const tabs: string[] = [];
  for (let i = past; i >= 1; i--) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1);
    tabs.push(formatMonthTab(d));
  }
  tabs.push(formatMonthTab(anchor));
  for (let i = 1; i <= future; i++) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() + i, 1);
    tabs.push(formatMonthTab(d));
  }
  return tabs;
}

export function resolveActiveMonthTab(requested?: string | null): string {
  const explicit =
    requested?.trim() ||
    process.env.GOOGLE_DISPATCH_SHEET_TAB?.trim() ||
    "";
  if (explicit) return explicit;

  const useMonth =
    process.env.GOOGLE_DISPATCH_SHEET_USE_MONTH_TAB?.trim().toLowerCase() !==
    "false";
  if (useMonth) return formatMonthTab(new Date());

  return "";
}
