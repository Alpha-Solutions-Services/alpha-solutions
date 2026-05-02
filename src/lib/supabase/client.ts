import { createBrowserClient } from "@supabase/ssr";
import { isPortalAuthConfigured } from "@/lib/supabase/env";

/**
 * Client Components — browser Supabase client (auth, realtime, etc.).
 */
export function createClient() {
  if (!isPortalAuthConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  return createBrowserClient(
    url,
    anon
  );
}
