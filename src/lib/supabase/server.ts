import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { isPortalAuthConfigured } from "@/lib/supabase/env";

/**
 * Server Components / Route Handlers — reads Supabase session from cookies.
 */
export function createClient() {
  if (!isPortalAuthConfigured()) return null;
  const cookieStore = cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  return createServerClient(
    url,
    anon,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component; middleware may refresh session.
          }
        },
      },
    }
  );
}
