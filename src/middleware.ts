import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSuperAdminEmail } from "@/lib/admin-allowlist";
import { isAllowedDispatcherEmail } from "@/lib/dispatcher-allowlist";

const CARRIER_STATUS_PREFIXES = [
  "/freight/carrier/register",
  "/freight/carrier/pending",
  "/freight/carrier/rejected",
  "/freight/carrier/suspended",
] as const;

function isCarrierPortalRoute(pathname: string): boolean {
  if (!pathname.startsWith("/freight/carrier/")) return false;
  return !CARRIER_STATUS_PREFIXES.some((p) => pathname.startsWith(p));
}

export async function middleware(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const { pathname } = request.nextUrl;
  const isFreightRoute = pathname === "/freight" || pathname.startsWith("/freight/");
  let response = NextResponse.next({ request });

  if (!url || !anon) {
    return response;
  }

  let supabase: ReturnType<typeof createServerClient>;
  let user: { id: string; email?: string | null } | null = null;
  try {
    supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    });
    const { data, error } = await supabase.auth.getUser();
    if (!error && data?.user?.id) {
      user = data.user;
    }
  } catch (e) {
    console.error("[middleware] Supabase session read failed:", e);
    return NextResponse.next({ request });
  }

  /** Public freight marketing / onboarding (no enrollment wall). */
  if (isFreightRoute) {
    const publicFreight =
      pathname === "/freight" ||
      pathname === "/freight/student" ||
      pathname === "/freight/dispatch-training" ||
      pathname.startsWith("/freight/login") ||
      pathname.startsWith("/freight/student/enroll") ||
      pathname.startsWith("/freight/carrier/register") ||
      pathname.startsWith("/freight/driver/accept-invite");

    if (
      pathname.startsWith("/freight/student/enroll") &&
      user?.id &&
      pathname === "/freight/student/enroll"
    ) {
      const { data: sp } = await supabase
        .from("profiles")
        .select("role,enrollment_status")
        .eq("id", user.id)
        .maybeSingle();
      if (sp?.role === "student" && sp.enrollment_status === "paid") {
        const n = request.nextUrl.clone();
        n.pathname = "/freight/student/dashboard";
        n.search = "";
        return NextResponse.redirect(n);
      }
    }

    if (!publicFreight && !user?.id) {
      const n = request.nextUrl.clone();
      n.pathname = "/freight/login";
      n.searchParams.set("next", pathname);
      return NextResponse.redirect(n);
    }

    if (!publicFreight && user?.id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, enrollment_status, carrier_status")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile?.role) {
        const n = request.nextUrl.clone();
        n.pathname = "/freight/login";
        n.searchParams.set("error", "profile");
        return NextResponse.redirect(n);
      }

      if (pathname.startsWith("/freight/dispatcher")) {
        if (profile.role !== "dispatcher") {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/login";
          n.searchParams.set("next", pathname);
          return NextResponse.redirect(n);
        }
        if (
          !isSuperAdminEmail(user?.email) &&
          !isAllowedDispatcherEmail(user?.email)
        ) {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/login";
          n.searchParams.set("error", "unauthorized_dispatcher");
          return NextResponse.redirect(n);
        }
      }

      if (pathname.startsWith("/freight/instructor")) {
        if (profile.role !== "instructor" && profile.role !== "dispatcher") {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/login";
          n.searchParams.set("error", "unauthorized_instructor");
          return NextResponse.redirect(n);
        }
      }

      if (pathname.startsWith("/freight/student/dashboard")) {
        if (profile.role !== "student") {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/login";
          return NextResponse.redirect(n);
        }
        if (profile.enrollment_status === "refunded") {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/student/enrollment-ended";
          return NextResponse.redirect(n);
        }
        if (profile.enrollment_status !== "paid") {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/student/enroll";
          n.searchParams.set("reason", "payment");
          return NextResponse.redirect(n);
        }
      }

      if (pathname.startsWith("/freight/student/enrollment-ended")) {
        if (profile.role !== "student") {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/login";
          return NextResponse.redirect(n);
        }
        if (profile.enrollment_status !== "refunded") {
          const n = request.nextUrl.clone();
          n.pathname =
            profile.enrollment_status === "paid"
              ? "/freight/student/dashboard"
              : "/freight/student/enroll";
          return NextResponse.redirect(n);
        }
      }

      if (isCarrierPortalRoute(pathname)) {
        if (profile.role !== "carrier") {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/login";
          return NextResponse.redirect(n);
        }
        if (profile.carrier_status === "pending") {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/carrier/pending";
          return NextResponse.redirect(n);
        }
        if (profile.carrier_status === "rejected") {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/carrier/rejected";
          return NextResponse.redirect(n);
        }
        if (profile.carrier_status === "suspended") {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/carrier/suspended";
          return NextResponse.redirect(n);
        }
        if (profile.carrier_status !== "verified") {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/carrier/pending";
          return NextResponse.redirect(n);
        }

        const billingExempt =
          pathname.startsWith("/freight/carrier/payments") ||
          pathname.startsWith("/freight/carrier/settings");

        if (!billingExempt) {
          const { data: billing } = await supabase
            .from("profiles")
            .select(
              "carrier_subscription_status,carrier_trial_ends_at,carrier_stripe_subscription_id,carrier_billing_mode",
            )
            .eq("id", user.id)
            .maybeSingle();

          const billingFree =
            (billing?.carrier_billing_mode as string | undefined)?.toLowerCase() === "free";

          const status = billing?.carrier_subscription_status?.toLowerCase();
          const trialEnd = billing?.carrier_trial_ends_at
            ? new Date(billing.carrier_trial_ends_at as string)
            : null;
          const trialActive =
            trialEnd && !Number.isNaN(trialEnd.getTime()) && trialEnd.getTime() > Date.now();
          const subActive =
            billingFree || status === "active" || status === "trialing" || trialActive;

          if (!subActive) {
            const n = request.nextUrl.clone();
            n.pathname = "/freight/carrier/payments";
            n.searchParams.set("reason", "subscription");
            return NextResponse.redirect(n);
          }
        }
      }

      if (pathname.startsWith("/freight/carrier/pending")) {
        if (profile.role !== "carrier") {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/login";
          return NextResponse.redirect(n);
        }
        if (profile.carrier_status === "verified") {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/carrier/dashboard";
          return NextResponse.redirect(n);
        }
        if (profile.carrier_status === "rejected") {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/carrier/rejected";
          return NextResponse.redirect(n);
        }
        if (profile.carrier_status === "suspended") {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/carrier/suspended";
          return NextResponse.redirect(n);
        }
      }

      if (pathname.startsWith("/freight/carrier/rejected")) {
        if (
          profile.role !== "carrier" ||
          profile.carrier_status !== "rejected"
        ) {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/carrier/pending";
          return NextResponse.redirect(n);
        }
      }

      if (pathname.startsWith("/freight/carrier/suspended")) {
        if (
          profile.role !== "carrier" ||
          profile.carrier_status !== "suspended"
        ) {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/carrier/dashboard";
          return NextResponse.redirect(n);
        }
      }

      if (pathname.startsWith("/freight/driver/dashboard")) {
        if (profile.role !== "driver") {
          const n = request.nextUrl.clone();
          n.pathname = "/freight/login";
          return NextResponse.redirect(n);
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/portal",
    "/portal/:path*",
    "/admin",
    "/admin/:path*",
    "/auth/callback",
    "/freight",
    "/freight/:path*",
  ],
};
