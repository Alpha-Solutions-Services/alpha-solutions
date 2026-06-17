import { NextRequest, NextResponse } from "next/server";
import { buildDispatchDashboard } from "@/lib/freight/build-dispatch-dashboard";
import { verifyCronSecret } from "@/lib/freight/api-security";
import {
  formatInvoiceDate,
  getInvoiceFriday,
  groupLoadsByCarrier,
} from "@/lib/freight/dispatch-invoice";
import { sendFridayInvoiceReminderEmail } from "@/lib/freight/emails";
import { isAllowedDispatcherEmail } from "@/lib/dispatcher-allowlist";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Cron: remind dispatchers to send invoices on Fridays only. */
export async function GET(req: NextRequest) {
  if (!verifyCronSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const day = new Date().getDay();
  if (day !== 5) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Not Friday — invoices are sent on Fridays only",
    });
  }

  const dashboard = await buildDispatchDashboard();
  const grouped = groupLoadsByCarrier(dashboard.loads);
  const invoiceCount = grouped.size;
  const friday = getInvoiceFriday();
  const dueLabel = formatInvoiceDate(friday);

  const admin = getServiceRoleClient();
  if (!admin) {
    return NextResponse.json({ error: "DB unavailable" }, { status: 500 });
  }

  const { data: dispatchers } = await admin
    .from("profiles")
    .select("email,full_name")
    .eq("role", "dispatcher");

  let sent = 0;
  for (const d of dispatchers ?? []) {
    const email = d.email as string | undefined;
    if (!email || !isAllowedDispatcherEmail(email)) continue;
    await sendFridayInvoiceReminderEmail({
      to: email,
      dispatcherName: (d.full_name as string) || "Dispatcher",
      invoiceCount,
      dueDateLabel: dueLabel,
    }).catch(() => {});
    sent += 1;
  }

  return NextResponse.json({ ok: true, sent, invoiceCount, dueDateLabel: dueLabel });
}
