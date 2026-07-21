import type { User } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { isAllowedAdminEmail, isSuperAdminEmail } from "@/lib/admin-allowlist";
import { isAllowedDispatcherEmail } from "@/lib/dispatcher-allowlist";
import {
  deliverAuthNotifications,
  isFirstAuthSession,
} from "@/lib/email/auth-notify";
import { resolveExternalProductRedirect } from "@/lib/product-hosts";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/** Prefer product subdomains — marketing site no longer hosts portals. */
function productRedirect(origin: string, pathWithQuery: string): string {
  const raw = pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
  const qIndex = raw.indexOf("?");
  const pathname = qIndex >= 0 ? raw.slice(0, qIndex) : raw;
  const query = qIndex >= 0 ? raw.slice(qIndex + 1) : "";
  const external = resolveExternalProductRedirect(pathname);
  if (external) {
    if (!query) return external;
    const dest = new URL(external);
    new URLSearchParams(query).forEach((value, key) => {
      dest.searchParams.set(key, value);
    });
    return dest.toString();
  }
  return `${origin}${raw}`;
}

function scheduleOAuthAuthNotify(
  request: NextRequest,
  user: User,
  profileRoleHint: string | null,
) {
  if (!user.email) return;
  const kind = isFirstAuthSession(user) ? ("signup" as const) : ("login" as const);
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;
  const ua = request.headers.get("user-agent");
  void (async () => {
    const admin = getServiceRoleClient();
    let profileRole = profileRoleHint;
    if (admin) {
      const { data: prof } = await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (prof?.role) profileRole = prof.role;
    }
    await deliverAuthNotifications({
      kind,
      userId: user.id,
      email: user.email!,
      profileRole,
      clientIp: ip,
      userAgent: ua,
      detail:
        kind === "signup" ? "OAuth / email link — first session." : undefined,
    });
  })().catch(() => {});
}

/**
 * Completes the browser OAuth flow (e.g. Google) and sets the session cookie.
 * Configure this URL in Supabase Auth → URL configuration → Redirect URLs:
 *   https://<your-domain>/auth/callback
 *   http://localhost:3000/auth/callback
 *
 * Portal destinations resolve to product hosts (portal / TMS / learndispatch).
 */
export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  const freightFlag = searchParams.get("freight") === "1";
  const roleRaw = searchParams.get("role")?.trim() ?? "";
  const freightRole =
    roleRaw === "dispatcher" ||
    roleRaw === "carrier" ||
    roleRaw === "driver" ||
    roleRaw === "student" ||
    roleRaw === "instructor"
      ? roleRaw
      : null;
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : freightFlag
        ? "/freight/login"
        : "/portal/dashboard";
  const nextWantsAdmin = next === "/admin" || next.startsWith("/admin/");
  const nextIsFreight = next === "/freight" || next.startsWith("/freight/");

  if (!url || !anon || !code) {
    return NextResponse.redirect(
      productRedirect(
        origin,
        `${nextWantsAdmin ? "/admin/login" : "/portal/login"}?error=auth`,
      ),
    );
  }

  const cookieStore = await cookies();
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

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      productRedirect(
        origin,
        `${nextWantsAdmin ? "/admin/login" : "/portal/login"}?error=auth`,
      ),
    );
  }

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user ?? null;
  if (userErr && !user) {
    return NextResponse.redirect(
      productRedirect(
        origin,
        `${nextWantsAdmin ? "/admin/login" : "/portal/login"}?error=auth`,
      ),
    );
  }

  // Freight OAuth: set role on first login, then route by role/status.
  if (nextIsFreight || freightFlag) {
    if (!user?.id) {
      return NextResponse.redirect(
        productRedirect(origin, "/freight/login?error=auth"),
      );
    }
    if (freightRole === "driver") {
      return NextResponse.redirect(
        productRedirect(origin, "/freight/login?error=invite_only"),
      );
    }

    const admin = getServiceRoleClient();
    if (admin && freightRole) {
      const superAdmin = isSuperAdminEmail(user.email);

      const { data: existing } = await admin
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();

      if (!existing) {
        await admin.from("profiles").insert({
          id: user.id,
          email: (user.email ?? "").toLowerCase() || null,
          role: freightRole,
          enrollment_status: freightRole === "student" ? "unpaid" : null,
          carrier_status: freightRole === "carrier" ? "pending" : null,
        });
      } else {
        const isUnsetOrGeneric = !existing.role || existing.role === "client";
        const mayApplyFreightCard =
          superAdmin || isUnsetOrGeneric || existing.role === freightRole;
        if (mayApplyFreightCard && existing.role !== freightRole) {
          await admin.from("profiles").update({ role: freightRole }).eq("id", user.id);
        }
      }

      await admin.auth.admin
        .updateUserById(user.id, { user_metadata: { role: freightRole } })
        .catch(() => {});
    }

    const profileRes = admin
      ? await admin
          .from("profiles")
          .select("role, enrollment_status, carrier_status, mc_number")
          .eq("id", user.id)
          .maybeSingle()
      : await supabase
          .from("profiles")
          .select("role, enrollment_status, carrier_status, mc_number")
          .eq("id", user.id)
          .maybeSingle();
    const profile = profileRes.data as
      | {
          role: string | null;
          enrollment_status?: string | null;
          carrier_status?: string | null;
          mc_number?: string | null;
        }
      | null;

    const role = (profile?.role ?? freightRole) as
      | "dispatcher"
      | "carrier"
      | "student"
      | "driver"
      | "instructor"
      | null;

    if (!role) {
      return NextResponse.redirect(
        productRedirect(origin, "/freight/login?error=profile"),
      );
    }

    scheduleOAuthAuthNotify(request, user, role);

    if (role === "dispatcher") {
      if (
        !isSuperAdminEmail(user.email) &&
        !isAllowedDispatcherEmail(user.email)
      ) {
        return NextResponse.redirect(
          productRedirect(origin, "/freight/login?error=unauthorized_dispatcher"),
        );
      }
      const dest = rawNext ? next : "/freight/dispatcher/dashboard";
      return NextResponse.redirect(productRedirect(origin, dest));
    }

    if (role === "instructor") {
      const dest = rawNext ? next : "/freight/instructor/dashboard";
      return NextResponse.redirect(productRedirect(origin, dest));
    }

    if (role === "student") {
      if (profile?.enrollment_status === "paid") {
        return NextResponse.redirect(
          productRedirect(origin, "/freight/student/dashboard"),
        );
      }
      if (profile?.enrollment_status === "refunded") {
        return NextResponse.redirect(
          productRedirect(origin, "/freight/student/enrollment-ended"),
        );
      }
      return NextResponse.redirect(
        productRedirect(origin, "/freight/student/enroll"),
      );
    }

    if (role === "carrier") {
      if (!profile?.mc_number) {
        return NextResponse.redirect(
          productRedirect(origin, "/freight/carrier/register"),
        );
      }
      if (profile?.carrier_status === "verified") {
        return NextResponse.redirect(
          productRedirect(origin, "/freight/carrier/dashboard"),
        );
      }
      if (profile?.carrier_status === "rejected") {
        return NextResponse.redirect(
          productRedirect(origin, "/freight/carrier/rejected"),
        );
      }
      if (profile?.carrier_status === "suspended") {
        return NextResponse.redirect(
          productRedirect(origin, "/freight/carrier/suspended"),
        );
      }
      return NextResponse.redirect(
        productRedirect(origin, "/freight/carrier/pending"),
      );
    }

    return NextResponse.redirect(productRedirect(origin, "/freight/login"));
  }

  const isDispatcher = isAllowedDispatcherEmail(user?.email);
  if (isDispatcher) {
    const admin = getServiceRoleClient();
    if (admin && user?.id) {
      const { data: existing } = await admin
        .from("profiles")
        .select("id, role")
        .eq("id", user.id)
        .maybeSingle();
      if (!existing) {
        await admin.from("profiles").insert({
          id: user.id,
          email: (user.email ?? "").toLowerCase(),
          role: "dispatcher",
        });
      } else if (existing.role !== "dispatcher") {
        await admin.from("profiles").update({ role: "dispatcher" }).eq("id", user.id);
      }
      await admin.auth.admin
        .updateUserById(user.id, { user_metadata: { role: "dispatcher" } })
        .catch(() => {});
    }
    if (user) scheduleOAuthAuthNotify(request, user, "dispatcher");
    return NextResponse.redirect(
      productRedirect(origin, "/freight/dispatcher/dashboard"),
    );
  }

  const srNotify = getServiceRoleClient();
  let oauthPortalRole: string | null = null;
  if (srNotify && user?.id) {
    const { data: profNotify } = await srNotify
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    oauthPortalRole = profNotify?.role ?? null;
  }
  if (user) scheduleOAuthAuthNotify(request, user, oauthPortalRole);

  const isAdmin = isAllowedAdminEmail(user?.email);

  if (isAdmin) {
    const adminNext = nextWantsAdmin ? next : "/admin/dashboard";
    return NextResponse.redirect(productRedirect(origin, adminNext));
  }

  const portalNext = nextWantsAdmin ? "/portal/dashboard" : next;
  return NextResponse.redirect(productRedirect(origin, portalNext));
}
