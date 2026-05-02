"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/** Records SPA navigations for admin stats (best-effort; requires Supabase page_views + service role for reads). */
export function PageViewReporter() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === last.current) return;
    last.current = pathname;
    void fetch("/api/analytics/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
    });
  }, [pathname]);

  return null;
}
