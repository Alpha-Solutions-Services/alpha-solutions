"use client";

import { usePathname } from "next/navigation";
import { ThunderstormBackdrop } from "@/components/home/ThunderstormBackdrop";

/**
 * Lightning / electricity ambience for the whole site, starting below the
 * first “hero” band (navbar + ~upper viewport) so the home hero video stays clean.
 * Rendered after page content with mix-blend so it reads over solid section backgrounds.
 * Disabled on `/blog` so long-form typography and images are not washed out.
 */
export function SiteThunderBackdrop() {
  const pathname = usePathname();
  if (!pathname) return null;
  if (pathname.startsWith("/blog")) return null;
  // Heavy canvas backdrop — disable on authenticated app shells to avoid rare GPU/tab crashes.
  if (
    pathname.startsWith("/portal") ||
    pathname.startsWith("/admin") ||
    (pathname.startsWith("/freight/") && pathname !== "/freight")
  ) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[8] mix-blend-screen opacity-[0.26]"
      style={{
        /* Below sticky nav + roughly below the home hero; consistent on all routes */
        top: "max(4.5rem, min(52dvh, 38rem))",
      }}
      aria-hidden
    >
      <div className="relative h-full min-h-[12rem] w-full">
        <ThunderstormBackdrop />
      </div>
    </div>
  );
}
