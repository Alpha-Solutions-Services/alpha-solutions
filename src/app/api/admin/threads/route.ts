import { NextResponse } from "next/server";
import { isAdminUser } from "@/lib/admin-auth";
import { getSessionUser } from "@/lib/portal/require-session";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET() {
  const session = await getSessionUser();
  if ("error" in session) return session.error;
  if (!isAdminUser(session.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getServiceRoleClient();
  if (!db) {
    return NextResponse.json({ threads: [] });
  }

  const { data: threads, error } = await db
    .from("dm_threads")
    .select("id, client_user_id, client_email, created_at, updated_at")
    .order("updated_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("[admin/threads]", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  const enriched = await Promise.all(
    (threads ?? []).map(async (t) => {
      const { data: last } = await db
        .from("dm_messages")
        .select("body, created_at, is_admin")
        .eq("thread_id", t.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      const { count } = await db
        .from("dm_messages")
        .select("*", { count: "exact", head: true })
        .eq("thread_id", t.id);
      return {
        ...t,
        messageCount: count ?? 0,
        lastMessage: last ?? null,
      };
    })
  );

  return NextResponse.json({ threads: enriched });
}
