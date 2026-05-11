import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import {
  deliverAuthNotifications,
  type AuthNotifyKind,
} from "@/lib/email/auth-notify";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

const bodySchema = z.object({
  kind: z.enum(["login", "signup"]).optional(),
  detail: z.string().max(500).optional(),
});

const throttleBucket = new Map<string, number>();
const LOGIN_THROTTLE_MS = 60_000;

function throttleLogin(userId: string): boolean {
  const now = Date.now();
  const prev = throttleBucket.get(userId) ?? 0;
  if (now - prev < LOGIN_THROTTLE_MS) return true;
  throttleBucket.set(userId, now);
  return false;
}

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    return NextResponse.json({ ok: false, error: "Misconfigured" }, { status: 503 });
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await req.json().catch(() => ({})));
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  const cookieStore = cookies();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id || !user.email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let kind: AuthNotifyKind = parsed.kind === "signup" ? "signup" : "login";

  if (kind === "signup") {
    const admin = getServiceRoleClient();
    if (admin) {
      const { data: full } = await admin.auth.admin.getUserById(user.id);
      const created = full.user?.created_at
        ? new Date(full.user.created_at).getTime()
        : NaN;
      if (!Number.isFinite(created) || Date.now() - created > 15 * 60 * 1000) {
        kind = "login";
      }
    } else {
      kind = "login";
    }
  }

  if (kind === "login" && throttleLogin(user.id)) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const admin = getServiceRoleClient();
  let profileRole: string | null = null;
  if (admin) {
    const { data: prof } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    profileRole = prof?.role ?? null;
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null;
  const ua = req.headers.get("user-agent");

  await deliverAuthNotifications({
    kind,
    userId: user.id,
    email: user.email,
    profileRole,
    detail: parsed.detail ?? null,
    clientIp: ip,
    userAgent: ua,
  }).catch((e) => console.error("[auth-notify]", e));

  return NextResponse.json({ ok: true });
}
