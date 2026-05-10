import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/site";

export default function robots(): MetadataRoute.Robots {
  const base = SITE_URL.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/portal",
        "/freight/dispatcher",
        "/freight/carrier/dashboard",
        "/freight/carrier/pending",
        "/freight/driver/dashboard",
        "/freight/student/dashboard",
        "/auth/callback",
        // Note: `/freight/carrier/register`, `/freight/driver/accept-invite` stay crawlable (public onboarding).
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
