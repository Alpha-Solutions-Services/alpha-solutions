import Link from "next/link";
import type { Metadata } from "next";
import { PILLARS, SERVICES } from "@/data/services";

export const metadata: Metadata = {
  title: "Services | Alpha Solutions Services LLC",
  description:
    "Explore all service categories from Alpha Solutions Services LLC including web development, business setup, SaaS, AI automation, and freight programs.",
};

const ORDERED_PILLARS = [1, 2, 3, 4, 5] as const;

export default function ServicesIndexPage() {
  return (
    <main
      style={{
        paddingTop: 100,
        minHeight: "100vh",
        background: "var(--color-bg)",
      }}
    >
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", marginBottom: 16 }}>
          Services
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: 18, maxWidth: 740 }}>
          Pick a category to see detailed services, pricing direction, and next
          steps. Every service page includes a direct quote CTA.
        </p>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: 18,
          }}
        >
          {ORDERED_PILLARS.map((id) => {
            const pillar = PILLARS[id];
            const count = SERVICES.filter((s) => s.pillar === id).length;
            const href = id === 5 ? "/freight" : `/services/${pillar.slug}`;
            return (
              <article
                key={pillar.slug}
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 14,
                  background: "var(--color-surface)",
                  padding: 22,
                }}
              >
                <h2 style={{ fontSize: 20, marginBottom: 8 }}>{pillar.name}</h2>
                <p style={{ color: "var(--color-muted)", fontSize: 14, marginBottom: 16 }}>
                  {count} services available
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Link
                    href={href}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: "var(--color-accent)",
                      color: "#05080F",
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    View category
                  </Link>
                  <Link
                    href="/contact"
                    style={{
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: "1px solid var(--color-border-glow)",
                      color: "var(--color-accent)",
                      textDecoration: "none",
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    Get quote
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

