import Link from "next/link";
import type { Metadata } from "next";
import { SERVICES } from "@/data/services";

export const metadata: Metadata = {
  title: "Sitemap | Alpha Solutions Services LLC",
  description:
    "Browse all important Alpha Solutions website pages, service pages, and the XML sitemap for search engines.",
  alternates: { canonical: "/sitemap" },
};

const staticPages = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/apps", label: "Apps" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/freight", label: "Alpha Freight" },
];

export default function SitemapPage() {
  return (
    <main style={{ paddingTop: 100, minHeight: "100vh", background: "var(--color-bg)" }}>
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 90px" }}>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", marginBottom: 12 }}>Sitemap</h1>
        <p style={{ color: "var(--color-muted)", marginBottom: 28 }}>
          Browse all major pages. XML sitemap is also available for search engines.
        </p>

        <div style={{ marginBottom: 24 }}>
          <a
            href="/sitemap.xml"
            style={{ color: "var(--color-accent)", fontWeight: 700, textDecoration: "none" }}
          >
            Open XML sitemap (/sitemap.xml)
          </a>
        </div>

        <h2 style={{ fontSize: 22, marginBottom: 10 }}>Main Pages</h2>
        <ul style={{ marginBottom: 28, paddingLeft: 18 }}>
          {staticPages.map((page) => (
            <li key={page.href} style={{ marginBottom: 8 }}>
              <Link href={page.href} style={{ color: "var(--color-accent)", textDecoration: "none" }}>
                {page.label}
              </Link>
            </li>
          ))}
        </ul>

        <h2 style={{ fontSize: 22, marginBottom: 10 }}>Service Detail Pages</h2>
        <ul style={{ paddingLeft: 18 }}>
          {SERVICES.map((service) => (
            <li key={service.slug} style={{ marginBottom: 8 }}>
              <Link
                href={service.primaryHref ?? `/services/${service.slug}`}
                style={{ color: "var(--color-accent)", textDecoration: "none" }}
              >
                {service.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
