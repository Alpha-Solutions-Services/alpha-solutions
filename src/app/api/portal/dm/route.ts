import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/portal/require-session";
import { createClient } from "@/lib/supabase/server";

const postSchema = z.object({
  body: z.string().min(1).max(8000),
});

async function ensureThread(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  email: string | undefined
) {
  if (!supabase) return null;
  const { data: existing } = await supabase
    .from("dm_threads")
    .select("id")
    .eq("client_user_id", userId)
    .maybeSingle();

  if (existing?.id) return existing.id as string;

  const { data: created, error } = await supabase
    .from("dm_threads")
    .insert({
      client_user_id: userId,
      client_email: email ?? null,
    })
    .select("id")
    .single();

  if (error || !created?.id) {
    console.error("[portal/dm] ensureThread", error);
    return null;
  }
  return created.id as string;
}

export async function GET() {
  const session = await getSessionUser();
  if ("error" in session) return session.error;

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json({ threadId: null, messages: [] });
  }
  const threadId = await ensureThread(
    supabase,
    session.user.id,
    session.user.email ?? undefined
  );
  if (!threadId) {
    return NextResponse.json({ threadId: null, messages: [] });
  }

  const { data: messages, error } = await supabase
    .from("dm_messages")
    .select("id, is_admin, body, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[portal/dm GET]", error);
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }

  return NextResponse.json({ threadId, messages: messages ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if ("error" in session) return session.error;

  let parsed: z.infer<typeof postSchema>;
  try {
    parsed = postSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const supabase = createClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Messaging is not configured in this environment" },
      { status: 503 }
    );
  }
  const threadId = await ensureThread(
    supabase,
    session.user.id,
    session.user.email ?? undefined
  );
  if (!threadId) {
    return NextResponse.json({ error: "Could not open thread" }, { status: 500 });
  }

  const { error: insErr } = await supabase.from("dm_messages").insert({
    thread_id: threadId,
    sender_id: session.user.id,
    is_admin: false,
    body: parsed.body,
  });

  if (insErr) {
    console.error("[portal/dm POST]", insErr);
    return NextResponse.json({ error: "Send failed" }, { status: 500 });
  }

  await supabase
    .from("dm_threads")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", threadId);

  return NextResponse.json({ ok: true });
}
