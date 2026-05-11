import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/** Dedupe auth lookup within a single RSC request (layout + page). */
export const getPortalUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export function portalDisplayName(user: User): string {
  const meta = user.user_metadata as Record<string, string> | undefined;
  return (
    meta?.full_name ||
    meta?.name ||
    user.email?.split("@")[0] ||
    "Client"
  );
}
