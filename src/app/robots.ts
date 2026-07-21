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
        "/freight/login",
        "/freight/dispatcher",
        "/freight/carrier",
        "/freight/driver",
        "/freight/student",
        "/freight/instructor",
        "/freight/dispatch-training",
        "/auth/callback",
        "/api/",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
