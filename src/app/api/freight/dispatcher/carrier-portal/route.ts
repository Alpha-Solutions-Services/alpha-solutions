import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertDispatcher } from "@/lib/freight/dispatch-roster";
import {
  type CarrierPortalConfig,
  upsertCarrierPortalConfig,
} from "@/lib/freight/carrier-portal-db";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  companyName: z.string().min(1).max(200),
  carrierProfileId: z.string().uuid().optional(),
  portalConfig: z.record(z.string(), z.unknown()),
});

export async function POST(req: NextRequest) {
  const sb = await createClient();
  if (!sb) return NextResponse.json({ error: "Supabase unavailable" }, { status: 500 });

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!(await assertDispatcher(user.id))) {
    return NextResponse.json({ error: "Dispatcher only" }, { status: 403 });
  }

  try {
    const body = schema.parse(await req.json());
    const ok = await upsertCarrierPortalConfig({
      companyName: body.companyName,
      carrierProfileId: body.carrierProfileId,
      portalConfig: body.portalConfig as CarrierPortalConfig,
      updatedBy: user.id,
    });

    if (!ok) {
      return NextResponse.json({ error: "Could not save portal config" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
