import type { MetadataRoute } from "next";
import { SERVICES } from "@/data/services";
import { SITE_URL } from "@/data/site";
import { getAllPosts } from "@/lib/sanity/queries";

const base = SITE_URL.replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts<{ slug?: { current?: string | null } | null }>();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/projects`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/apps`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    {
      url: `${base}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${base}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${base}/services/web-brand`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/services/business-setup`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/services/saas-products`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${base}/services/ai-automation`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    { url: `${base}/freight`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    {
      url: `${base}/freight/dispatch-training`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.75,
    },
    { url: `${base}/portal`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/portal/login`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.25 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = SERVICES.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  const blogRoutes: MetadataRoute.Sitemap = posts
    .map((p) => p.slug?.current)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({
      url: `${base}/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    }));

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes];
}
