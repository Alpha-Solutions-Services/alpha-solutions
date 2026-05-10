import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { isAllowedAdminEmail, isSuperAdminEmail } from "@/lib/admin-allowlist";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Completes the browser OAuth flow (e.g. Google) and sets the session cookie.
 * Configure this URL in Supabase Auth → URL configuration → Redirect URLs:
 *   https://<your-domain>/auth/callback
 *   http://localhost:3000/auth/callback
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
    roleRaw === "student"
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
      `${origin}${nextWantsAdmin ? "/admin/login" : "/portal/login"}?error=auth`
    );
  }

  const cookieStore = cookies();
  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}${nextWantsAdmin ? "/admin/login" : "/portal/login"}?error=auth`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Freight OAuth: set role on first login, then route by role/status.
  if (nextIsFreight || freightFlag) {
    if (!user?.id) {
      return NextResponse.redirect(`${origin}/freight/login?error=auth`);
    }
    if (freightRole === "driver") {
      // Drivers are invite-only (account is created via invite flow).
      return NextResponse.redirect(`${origin}/freight/login?error=invite_only`);
    }

    const admin = getServiceRoleClient();
    if (admin && freightRole) {
      const superAdmin = isSuperAdminEmail(user.email);

      // Create or update the profile role if missing (or if super admin wants to switch roles).
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
      } else if (!existing.role || superAdmin) {
        await admin.from("profiles").update({ role: freightRole }).eq("id", user.id);
      }

      // Keep auth metadata aligned (non-blocking).
      await admin.auth.admin
        .updateUserById(user.id, { user_metadata: { role: freightRole } })
        .catch(() => {});
    }

    // Determine where to send the user next based on their stored profile.
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
      | null;

    if (!role) return NextResponse.redirect(`${origin}/freight/login?error=profile`);

    if (role === "dispatcher") {
      const dest = rawNext ? next : "/freight/dispatcher/dashboard";
      return NextResponse.redirect(`${origin}${dest}`);
    }

    if (role === "student") {
      if (profile?.enrollment_status === "paid") {
        return NextResponse.redirect(`${origin}/freight/student/dashboard`);
      }
      if (profile?.enrollment_status === "refunded") {
        return NextResponse.redirect(`${origin}/freight/student/enrollment-ended`);
      }
      return NextResponse.redirect(`${origin}/freight/student/enroll`);
    }

    if (role === "carrier") {
      // If carrier signed in via Google without completing registration, force registration.
      if (!profile?.mc_number) {
        return NextResponse.redirect(`${origin}/freight/carrier/register`);
      }
      if (profile?.carrier_status === "verified") {
        return NextResponse.redirect(`${origin}/freight/carrier/dashboard`);
      }
      if (profile?.carrier_status === "rejected") {
        return NextResponse.redirect(`${origin}/freight/carrier/rejected`);
      }
      if (profile?.carrier_status === "suspended") {
        return NextResponse.redirect(`${origin}/freight/carrier/suspended`);
      }
      return NextResponse.redirect(`${origin}/freight/carrier/pending`);
    }

    return NextResponse.redirect(`${origin}/freight/login`);
  }

  const isAdmin = isAllowedAdminEmail(user?.email);

  // Enforce portal vs admin destinations so users land in the correct UI.
  if (isAdmin) {
    const adminNext = nextWantsAdmin ? next : "/admin/dashboard";
    return NextResponse.redirect(`${origin}${adminNext}`);
  }

  const portalNext = nextWantsAdmin ? "/portal/dashboard" : next;
  return NextResponse.redirect(`${origin}${portalNext}`);
}
