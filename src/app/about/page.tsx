import type { Metadata } from "next";
import Image from "next/image";
import YouTubeEmbed from "@/components/shared/YouTubeEmbed";
import { absoluteUrl, SITE_NAME } from "@/data/site";

export const metadata: Metadata = {
  title: "About Us | Alpha Solutions Services LLC — Web Development Company",
  description:
    "Alpha Solutions is a US-registered software company based in West Jordan, Utah with a development office in Gujranwala, Pakistan.",
  openGraph: {
    title: `About Us | ${SITE_NAME}`,
    description:
      "Meet the team behind Alpha Solutions — full-stack development, SaaS, and AI from Utah and Pakistan.",
    images: [{ url: "/Team/Founder.png", width: 800, height: 800 }],
    url: absoluteUrl("/about"),
  },
  twitter: {
    card: "summary_large_image",
    title: `About Us | ${SITE_NAME}`,
    images: [absoluteUrl("/Team/Founder.png")],
  },
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Alpha Solutions Services LLC",
    url: "https://alphasolutions.software",
    email: "info@alphasolutions.software",
    telephone: "+923494206922",
    address: [
      {
        "@type": "PostalAddress",
        streetAddress: "7533 S Center View Ct Ste R",
        addressLocality: "West Jordan",
        addressRegion: "UT",
        postalCode: "84084",
        addressCountry: "US",
      },
      {
        "@type": "PostalAddress",
        streetAddress: "6664+5MM, Professors Colony",
        addressLocality: "Gujranwala",
        addressCountry: "PK",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main
        style={{
          paddingTop: 100,
          minHeight: "100vh",
          background: "var(--color-bg)",
        }}
      >
        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", marginBottom: 16 }}>
            Alpha Solutions Services LLC
          </h1>
          <p
            style={{
              color: "var(--color-muted)",
              fontSize: 18,
              maxWidth: 640,
              marginBottom: 32,
            }}
          >
            A US-registered digital solutions company with operations in West
            Jordan, Utah and a development office in Gujranwala, Pakistan. We
            build web platforms, AI automation, SaaS products, and help
            businesses get legally set up.
          </p>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            {[
              ["US LLC", "West Jordan, Utah"],
              ["Dev Office", "Gujranwala, Pakistan"],
              ["50+", "Projects delivered"],
              ["5.0", "Clutch rating"],
              ["3", "Continents served"],
            ].map(([val, label]) => (
              <div key={label}>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: "var(--color-accent)",
                  }}
                >
                  {val}
                </div>
                <div style={{ color: "var(--color-muted)", fontSize: 13 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="our-story"
          style={{
            maxWidth: 800,
            margin: "0 auto",
            padding: "0 24px 100px",
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: 28, marginBottom: 12 }}>A day at Alpha Solutions</h2>
          <p style={{ color: "var(--color-muted)", marginBottom: 32 }}>
            See how we work, how we build, and what drives us.
          </p>
          <YouTubeEmbed
            videoId="2ld9Qch0IUs"
            title="A day at Alpha Solutions Services LLC"
          />
        </section>

        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px" }}>
          <h2 style={{ fontSize: 28, marginBottom: 40 }}>The team</h2>
          <div
            style={{
              display: "flex",
              gap: 32,
              alignItems: "flex-start",
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              padding: "32px",
              maxWidth: 520,
            }}
          >
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                overflow: "hidden",
                flexShrink: 0,
                border: "2px solid var(--color-border-glow)",
                background: "var(--color-accent-dim)",
                position: "relative",
              }}
            >
              <Image
                src="/Team/Founder.png"
                alt="Muhammad Mikran Sandhu, Founder of Alpha Solutions Services LLC"
                width={96}
                height={96}
                className="rounded-full object-cover"
                sizes="96px"
                priority
              />
            </div>
            <div>
              <h3 style={{ fontSize: 20, marginBottom: 4 }}>
                Muhammad Mikran Sandhu
              </h3>
              <div
                style={{
                  color: "var(--color-accent)",
                  fontSize: 13,
                  marginBottom: 12,
                }}
              >
                Founder & Full Stack Developer
              </div>
              <p
                style={{
                  color: "var(--color-muted)",
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              >
                Full-stack developer and founder of Alpha Solutions Services LLC.
                Specializing in React, Next.js, Node.js, Python, and AI
                integrations. Building multiple income streams through software,
                SaaS, and logistics tech.
              </p>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px" }}>
          <h2 style={{ fontSize: 28, marginBottom: 32 }}>Our offices</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: 20,
            }}
          >
            {[
              {
                label: "United States",
                addr: "7533 S Center View Ct Ste R\nWest Jordan, UT 84084",
                phone: "+92 349 420 6922",
              },
              {
                label: "Pakistan",
                addr: "6664+5MM, Professors Colony\nGujranwala, Punjab",
                phone: "+92 349 4206922",
              },
            ].map((o) => (
              <div
                key={o.label}
                style={{
                  padding: "24px",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    color: "var(--color-accent)",
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  {o.label}
                </div>
                <div
                  style={{
                    color: "var(--color-muted)",
                    fontSize: 14,
                    whiteSpace: "pre-line",
                    lineHeight: 1.7,
                  }}
                >
                  {o.addr}
                </div>
                <div
                  style={{
                    color: "var(--color-text)",
                    fontSize: 14,
                    marginTop: 8,
                  }}
                >
                  {o.phone}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
