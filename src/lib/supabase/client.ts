import { createBrowserClient } from "@supabase/ssr";
import { isPortalAuthConfigured } from "@/lib/supabase/env";

/**
 * Client Components — browser Supabase client (auth, realtime, etc.).
 *
 * Never call createBrowserClient during SSR / Next pre-render: `@supabase/ssr`
 * stubs storage with a setAll() that throws if auth tries to persist in that phase.
 */
export function createClient() {
  if (typeof window === "undefined") return null;
  if (!isPortalAuthConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createBrowserClient(url, anon);
}
