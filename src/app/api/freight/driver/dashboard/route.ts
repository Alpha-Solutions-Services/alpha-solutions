import { NextResponse } from "next/server";
import { dbLoadToDashboardLoad, fetchDriverLoadsFromDb } from "@/lib/freight/dispatch-loads-db";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb = await createClient();
  if (!sb) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 });

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await sb
    .from("profiles")
    .select("role, full_name, company_name, carrier_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "driver") {
    return NextResponse.json({ error: "Driver only" }, { status: 403 });
  }

  const rows = await fetchDriverLoadsFromDb(user.id);
  const loads = rows.map((row, i) => {
    const l = dbLoadToDashboardLoad(row, i);
    return {
      id: row.id,
      load_number: l.load_number !== "—" ? l.load_number : l.sr,
      pickup: l.pickup,
      delivery: l.delivery,
      rate: l.rate,
      status: l.status,
      miles: l.miles,
      broker: l.broker,
      carrier: l.carrier,
    };
  });

  return NextResponse.json({
    driver: {
      name: profile.full_name || "Driver",
      company: profile.company_name || "—",
    },
    loads,
    generated_at: new Date().toISOString(),
  });
}
