import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/freight/api-security";
import { assertDispatcher } from "@/lib/freight/dispatch-roster";
import {
  insertDispatchLoad,
  softDeleteDispatchLoad,
  updateDispatchLoad,
} from "@/lib/freight/dispatch-loads-db";
import {
  sendLoadActionDispatcherEmail,
  sendLoadAddedEmail,
  sendLoadRemovedEmail,
} from "@/lib/freight/emails";
import { resolveActiveMonthTab } from "@/lib/freight/dispatch-sheet-tabs";
import { createClient } from "@/lib/supabase/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { FREIGHT_TEAM_EMAIL } from "@/lib/freight/constants";

const createSchema = z.object({
  monthTab: z.string().min(3).max(40).optional(),
  companyName: z.string().min(1).max(200),
  broker: z.string().max(200).optional(),
  loadDetails: z.string().max(500).optional(),
  pickupDateTime: z.string().max(120).optional(),
  deliveryDateTime: z.string().max(120).optional(),
  miles: z.number().min(0).max(99999).optional(),
  loadNumber: z.string().max(80).optional(),
  rcInvoice: z.number().min(0).max(9999999).optional(),
  dispatchPercent: z.number().min(0).max(100).optional(),
  status: z.string().max(40).optional(),
  carrierProfileId: z.string().uuid().optional(),
  assignedDriverProfileId: z.string().uuid().optional(),
});

const patchSchema = createSchema.partial().extend({
  id: z.string().uuid(),
  received: z.number().min(0).optional(),
  balance: z.number().min(0).optional(),
});

async function requireDispatcher(req: NextRequest) {
  if (!checkRateLimit(req, "dispatcher-loads", 60)) {
    return { error: NextResponse.json({ error: "Too many requests" }, { status: 429 }) };
  }

  const sb = await createClient();
  if (!sb) return { error: NextResponse.json({ error: "Supabase unavailable" }, { status: 500 }) };

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user?.id) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  if (!(await assertDispatcher(user.id))) {
    return { error: NextResponse.json({ error: "Dispatcher only" }, { status: 403 }) };
  }

  return { user };
}

async function resolveCarrierEmail(
  companyName: string,
  carrierProfileId?: string,
): Promise<string | null> {
  const admin = getServiceRoleClient();
  if (!admin) return null;

  if (carrierProfileId) {
    const { data } = await admin
      .from("profiles")
      .select("email")
      .eq("id", carrierProfileId)
      .maybeSingle();
    if (data?.email) return data.email as string;
  }

  const { data: roster } = await admin
    .from("dispatch_carrier_roster")
    .select("email")
    .ilike("company_name", companyName)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  return (roster?.email as string) || null;
}

export async function POST(req: NextRequest) {
  const auth = await requireDispatcher(req);
  if ("error" in auth) return auth.error;

  try {
    const body = createSchema.parse(await req.json());
    const monthTab = body.monthTab?.trim() || resolveActiveMonthTab();

    const result = await insertDispatchLoad(
      {
        monthTab,
        companyName: body.companyName,
        broker: body.broker,
        loadDetails: body.loadDetails,
        pickupDateTime: body.pickupDateTime,
        deliveryDateTime: body.deliveryDateTime,
        miles: body.miles,
        loadNumber: body.loadNumber,
        rcInvoice: body.rcInvoice,
        dispatchPercent: body.dispatchPercent ?? 5,
        status: body.status ?? "Unpaid",
        carrierProfileId: body.carrierProfileId,
        assignedDriverProfileId: body.assignedDriverProfileId,
        bookedBy: auth.user.email ?? "Dispatcher",
      },
      auth.user.id,
    );

    if (!result) {
      return NextResponse.json({ error: "Could not save load" }, { status: 500 });
    }

    const carrierEmail = await resolveCarrierEmail(body.companyName, body.carrierProfileId);
    const loadNo = body.loadNumber || `SR-${result.sr}`;

    if (carrierEmail) {
      await sendLoadAddedEmail({
        to: carrierEmail,
        carrierName: body.companyName,
        loadNumber: loadNo,
        broker: body.broker ?? "",
        pickup: body.pickupDateTime ?? "",
      }).catch(() => {});
    }

    const teamEmail = FREIGHT_TEAM_EMAIL || auth.user.email;
    if (teamEmail) {
      await sendLoadActionDispatcherEmail({
        to: teamEmail,
        action: "added",
        loadNumber: loadNo,
        carrierName: body.companyName,
        actorEmail: auth.user.email ?? "dispatcher",
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true, id: result.id, sr: result.sr });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    console.error("[dispatcher/loads POST]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireDispatcher(req);
  if ("error" in auth) return auth.error;

  try {
    const body = patchSchema.parse(await req.json());
    const ok = await updateDispatchLoad(body.id, body);
    if (!ok) return NextResponse.json({ error: "Update failed" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireDispatcher(req);
  if ("error" in auth) return auth.error;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const admin = getServiceRoleClient();
  if (!admin) {
    return NextResponse.json({ error: "Service role unavailable" }, { status: 500 });
  }

  const { data: row } = await admin
    .from("dispatch_loads")
    .select("company_name, load_number, sr, carrier_profile_id, email")
    .eq("id", id)
    .maybeSingle();

  const ok = await softDeleteDispatchLoad(id);
  if (!ok) return NextResponse.json({ error: "Delete failed" }, { status: 500 });

  if (row) {
    const loadNo = (row.load_number as string) || `SR-${row.sr}`;
    const company = row.company_name as string;
    const email =
      (row.email as string) ||
      (await resolveCarrierEmail(company, row.carrier_profile_id as string | undefined));

    if (email) {
      await sendLoadRemovedEmail({
        to: email,
        carrierName: company,
        loadNumber: loadNo,
      }).catch(() => {});
    }

    const teamEmail = FREIGHT_TEAM_EMAIL || auth.user.email;
    if (teamEmail) {
      await sendLoadActionDispatcherEmail({
        to: teamEmail,
        action: "removed",
        loadNumber: loadNo,
        carrierName: company,
        actorEmail: auth.user.email ?? "dispatcher",
      }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true });
}
