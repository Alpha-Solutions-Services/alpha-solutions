import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

const bodySchema = z.object({
  path: z.string().min(1).max(512),
});

/** Fire-and-forget page view for admin dashboard stats (optional). */
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const { path } = bodySchema.parse(json);
    const admin = getServiceRoleClient();
    if (!admin) {
      return NextResponse.json({ ok: false, skipped: true });
    }
    await admin.from("page_views").insert({ path });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
