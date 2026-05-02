import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

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
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : "/portal/dashboard";

  if (!url || !anon || !code) {
    return NextResponse.redirect(`${origin}/portal/login?error=auth`);
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
    return NextResponse.redirect(`${origin}/portal/login?error=auth`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
