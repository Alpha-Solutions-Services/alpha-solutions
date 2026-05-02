import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminUser } from "@/lib/admin-auth";
import { getSessionUser } from "@/lib/portal/require-session";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

const postSchema = z.object({
  body: z.string().min(1).max(8000),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const session = await getSessionUser();
  if ("error" in session) return session.error;
  if (!isAdminUser(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getServiceRoleClient();
  if (!db) {
    return NextResponse.json({ messages: [] });
  }

  const { data, error } = await db
    .from("dm_messages")
    .select("id, thread_id, sender_id, is_admin, body, created_at")
    .eq("thread_id", params.threadId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[admin/messages GET]", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  return NextResponse.json({ messages: data ?? [] });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { threadId: string } }
) {
  const session = await getSessionUser();
  if ("error" in session) return session.error;
  if (!isAdminUser(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let parsed: z.infer<typeof postSchema>;
  try {
    parsed = postSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const db = getServiceRoleClient();
  if (!db) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { error: insErr } = await db.from("dm_messages").insert({
    thread_id: params.threadId,
    sender_id: session.user.id,
    is_admin: true,
    body: parsed.body,
  });

  if (insErr) {
    console.error("[admin/messages POST]", insErr);
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  await db
    .from("dm_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", params.threadId);

  return NextResponse.json({ ok: true });
}
