import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/site";

/** Public marketing routes only — portals live on product subdomains. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL.replace(/\/$/, "");
  const now = new Date();
  const paths = [
    "/",
    "/freight",
    "/services",
    "/pricing",
    "/about",
    "/contact",
    "/projects",
    "/blog",
    "/apps",
    "/terms-of-service",
    "/privacy-policy",
    "/sitemap",
  ];

  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "/" ? ("weekly" as const) : ("monthly" as const),
    priority: path === "/" ? 1 : path.startsWith("/freight") ? 0.85 : 0.7,
  }));
}
