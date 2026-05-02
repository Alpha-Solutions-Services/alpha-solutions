import type { Metadata } from "next";
import Image from "next/image";
import type { SanityImageSource } from "@sanity/image-url";
import { urlForImage } from "@/lib/sanity/image";
import { getApps } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Our Apps & Tools | Alpha Solutions Services LLC",
  description:
    "Apps and tools built by Alpha Solutions — Zakat Calculator, CodeScope AI Code Reviewer, and more. Built in public.",
};

export const revalidate = 3600;

type SanityAppDoc = {
  name?: string | null;
  description?: string | null;
  downloadLink?: string | null;
  githubUrl?: string | null;
  screenshots?: SanityImageSource[] | null;
  listingStatus?: string | null;
};

type AppRow = {
  name: string;
  description: string;
  url: string;
  github: string;
  image: string;
  status: "live" | "soon";
};

const FALLBACK_APPS: AppRow[] = [
  {
    name: "Zakat Calculator",
    description:
      "Islamic finance zakat calculator. Free tool for Muslims to calculate annual zakat obligations.",
    url: "https://zakat.alphasolutions.software",
    github: "https://github.com/M-Mikran-Sandhu/zakat-calculator",
    image: "/apps/zakat-calculator.png",
    status: "live",
  },
  {
    name: "CodeScope",
    description:
      "AI-powered code reviewer. Paste your code, get instant feedback on quality, bugs, and improvements.",
    url: "#",
    github: "#",
    image: "/apps/codescope.png",
    status: "live",
  },
  {
    name: "Alpha Weather",
    description:
      "Clean weather app with location detection and 7-day forecast using live weather APIs.",
    url: "#",
    github: "#",
    image: "/apps/alpha-weather.png",
    status: "live",
  },
  {
    name: "Dispatch Manager",
    description:
      "SaaS platform for trucking dispatch operations. Load management, carrier tracking, invoicing.",
    url: "#",
    github: "#",
    image: "/apps/dispatch-manager.png",
    status: "soon",
  },
];

function mapSanityApp(doc: SanityAppDoc): AppRow | null {
  const name = doc.name?.trim();
  if (!name) return null;
  const firstShot = doc.screenshots?.[0];
  const img = firstShot ? urlForImage(firstShot, 640) : null;
  const url = doc.downloadLink?.trim() || "#";
  const github = doc.githubUrl?.trim() || "#";
  const status =
    doc.listingStatus === "soon" ? ("soon" as const) : ("live" as const);
  return {
    name,
    description:
      (doc.description?.trim() || "").slice(0, 320) ||
      "Product built by Alpha Solutions.",
    url,
    github,
    image: img ?? "/og/default.png",
    status,
  };
}

export default async function AppsPage() {
  const fromSanity = await getApps<SanityAppDoc>();
  const mapped = fromSanity
    .map(mapSanityApp)
    .filter((x): x is AppRow => x !== null);
  const apps = mapped.length > 0 ? mapped : FALLBACK_APPS;

  return (
    <main
      style={{
        paddingTop: 100,
        minHeight: "100vh",
        background: "var(--color-bg)",
      }}
    >
      <section
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 24px 80px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", marginBottom: 16 }}>
          Tools we&apos;ve built
        </h1>
        <p
          style={{
            color: "var(--color-muted)",
            fontSize: 18,
            maxWidth: 560,
            margin: "0 auto",
          }}
        >
          {mapped.length > 0
            ? "Products and tools managed in Sanity — ship updates without redeploying the site."
            : "Real products shipped as part of our 30-day build challenge and ongoing development. Built in public on GitHub and LinkedIn. Create App documents in Sanity to replace this list."}
        </p>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: 24,
          }}
        >
          {apps.map((app, i) => (
            <div
              key={`${app.name}-${i}`}
              style={{
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "relative",
                  height: 180,
                  background: "#0B1120",
                }}
              >
                <Image
                  src={app.image}
                  alt={app.name}
                  fill
                  sizes="300px"
                  style={{ objectFit: "cover" }}
                />
                {app.status === "soon" && (
                  <div
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      padding: "4px 10px",
                      borderRadius: 20,
                      background: "rgba(56,163,255,0.15)",
                      color: "#38A3FF",
                      fontSize: 11,
                    }}
                  >
                    Coming Soon
                  </div>
                )}
              </div>
              <div style={{ padding: "20px 24px" }}>
                <h3 style={{ fontSize: 18, marginBottom: 8 }}>{app.name}</h3>
                <p
                  style={{
                    color: "var(--color-muted)",
                    fontSize: 14,
                    marginBottom: 16,
                  }}
                >
                  {app.description}
                </p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {app.status === "live" && app.url !== "#" && (
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "8px 16px",
                        background: "var(--color-accent)",
                        color: "#05080F",
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Live app
                    </a>
                  )}
                  {app.github !== "#" && (
                    <a
                      href={app.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "8px 16px",
                        border: "1px solid var(--color-border-glow)",
                        color: "var(--color-accent)",
                        borderRadius: 6,
                        fontSize: 13,
                        textDecoration: "none",
                      }}
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
