import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { SanityImageSource } from "@sanity/image-url";
import YouTubeEmbed from "@/components/shared/YouTubeEmbed";
import { urlForImage } from "@/lib/sanity/image";
import { getAllProjects } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Portfolio & Projects | Alpha Solutions Services LLC",
  description:
    "See our work — web development, mobile apps, SaaS, e-commerce, and trucking tech. Alpha Solutions Services LLC, West Jordan Utah.",
  openGraph: {
    title: "Our Work | Alpha Solutions Services LLC",
    images: [{ url: "/og/default.png", width: 1200, height: 630 }],
  },
};

export const revalidate = 3600;

type SanityProjectDoc = {
  title?: string | null;
  client?: string | null;
  description?: string | null;
  category?: string | null;
  featuredImage?: SanityImageSource | null;
  projectUrl?: string | null;
  technologies?: string[] | null;
  status?: string | null;
};

type ProjectRow = {
  title: string;
  client: string;
  category: string;
  image: string;
  description: string;
  projectUrl: string;
  technologies: string[];
  status: string;
};

const URL_NAME_NORMALIZATION: Record<string, string> = {
  redmonresourcesllc: "Redmon Resources LLC",
  giftifystore: "Giftify Store",
  prosperaenterprises: "Prospera Enterprises",
  weather: "Alpha Weather",
  legacyincglobal: "Legacy Inc Global",
  mindflow: "MindFlow",
  alphaacademy: "Alpha Academy",
};

const CLIENT_NORMALIZATION: Record<
  string,
  { client: string; projectUrl?: string }
> = {
  // Use company/brand name instead of owner name
  "muaz gill": { client: "Giftify Store", projectUrl: "https://giftifystore.com.pk/" },
  "luke redmon": { client: "Redmon Resources LLC", projectUrl: "https://redmonresourcesllc.com/" },
  hamza: { client: "Prospera Enterprises", projectUrl: "https://www.prosperaenterprises.com/" },
  "jj williams": { client: "Legacy Inc Global", projectUrl: "https://legacyincglobal.com/" },
  "prof imran qamar sandhu": {
    client: "Alpha Academy",
    projectUrl: "https://alphaacademy.alphasolutions.software/",
  },
  "giftify": { client: "Giftify Store", projectUrl: "https://giftifystore.com.pk/" },
  "giftify store": { client: "Giftify Store", projectUrl: "https://giftifystore.com.pk/" },
};

function titleCaseDomainName(value: string): string {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function companyFromUrl(rawUrl: string): string | null {
  try {
    if (!rawUrl || rawUrl === "#") return null;
    const url = new URL(rawUrl);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const first = host.split(".")[0];
    if (!first) return null;
    return URL_NAME_NORMALIZATION[first] ?? titleCaseDomainName(first);
  } catch {
    return null;
  }
}

function normalizeClient(rawClient: string, rawUrl: string) {
  const key = rawClient.trim().toLowerCase();
  const hit = CLIENT_NORMALIZATION[key];
  if (hit) return { client: hit.client, projectUrl: hit.projectUrl ?? rawUrl };

  const fromUrl = companyFromUrl(rawUrl);
  if (fromUrl) return { client: fromUrl, projectUrl: rawUrl };

  if (!rawClient || rawClient.toLowerCase() === "alpha") {
    return { client: "Alpha Solutions", projectUrl: rawUrl };
  }

  return { client: rawClient, projectUrl: rawUrl };
}

const FALLBACK_PROJECTS: ProjectRow[] = [
  {
    title: "AH Logistics",
    client: "AH Logistics",
    category: "Web Development",
    image: "/projects/ah-logistics.png",
    description: "Full logistics management platform with real-time tracking.",
    projectUrl: "#",
    technologies: ["React", "Logistics Dashboard", "Real-time Tracking"],
    status: "Completed",
  },
  {
    title: "Giftify Store",
    client: "Giftify Store",
    category: "E-commerce",
    image: "/projects/giftify-store.png",
    description: "Custom e-commerce store with inventory management.",
    projectUrl: "https://giftifystore.com.pk/",
    technologies: ["Shopify", "Payments", "Inventory"],
    status: "Completed",
  },
  {
    title: "MindFlow App",
    client: "MindFlow App",
    category: "SaaS",
    image: "/projects/mind-flow.png",
    description: "Mental wellness SaaS platform with subscription billing.",
    projectUrl: "#",
    technologies: ["SaaS", "Subscriptions", "User Portal"],
    status: "Completed",
  },
  {
    title: "Prospera Finance",
    client: "Prospera Finance",
    category: "Web App",
    image: "/projects/prospera.png",
    description: "Financial dashboard with live data integrations.",
    projectUrl: "#",
    technologies: ["Dashboards", "API Integrations", "Analytics"],
    status: "Completed",
  },
  {
    title: "Redmon Resources",
    client: "Redmon Resources LLC",
    category: "Web Development",
    image: "/projects/redmon-resources.png",
    description:
      "Alpha Solutions developed a powerful AI-driven web platform for Redmon Resources LLC, combining responsive design, custom integrations, and SEO-focused rendering for a better user experience.",
    projectUrl: "https://redmonresourcesllc.com/",
    technologies: ["React", "AI Agent", "SEO", "Integrations"],
    status: "Completed",
  },
  {
    title: "Williams Transport",
    client: "Williams Transport",
    category: "Trucking",
    image: "/projects/williams-transport.png",
    description: "Trucking company website and dispatch setup.",
    projectUrl: "#",
    technologies: ["Dispatch", "Website", "Operations"],
    status: "Completed",
  },
  {
    title: "Alpha Weather",
    client: "Alpha Weather",
    category: "App",
    image: "/projects/alpha-weather.png",
    description: "Weather app with API integrations and location services.",
    projectUrl: "#",
    technologies: ["Weather API", "Location", "Forecast UI"],
    status: "Completed",
  },
  {
    title: "Alpha Academy",
    client: "Alpha Academy",
    category: "EdTech",
    image: "/projects/alpha-academy.png",
    description: "Online learning platform with course management.",
    projectUrl: "#",
    technologies: ["EdTech", "Courses", "Student Portal"],
    status: "Completed",
  },
];

function mapSanityProject(doc: SanityProjectDoc): ProjectRow | null {
  const title = doc.title?.trim();
  if (!title) return null;

  const rawClient = (doc.client?.trim() || title).slice(0, 80);
  const rawUrl = doc.projectUrl?.trim() || "#";
  const normalized = normalizeClient(rawClient, rawUrl);

  return {
    title,
    client: normalized.client,
    category: (doc.category?.trim() || "Project").slice(0, 80),
    image: urlForImage(doc.featuredImage ?? undefined, 1200) ?? "/og/default.png",
    description:
      (doc.description?.trim() || "Case study from Alpha Solutions.").slice(
        0,
        320
      ),
    projectUrl: normalized.projectUrl,
    technologies: (doc.technologies ?? []).slice(0, 4),
    status: doc.status?.trim() || "Completed",
  };
}

export default async function ProjectsPage() {
  const fromSanity = await getAllProjects<SanityProjectDoc>();
  const mapped = fromSanity
    .map(mapSanityProject)
    .filter((x): x is ProjectRow => x !== null);
  const projects = mapped.length > 0 ? mapped : FALLBACK_PROJECTS;

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
          Our work speaks for itself
        </h1>
        <p
          style={{
            color: "var(--color-muted)",
            fontSize: 18,
            maxWidth: 560,
            margin: "0 auto 40px",
          }}
        >
          {mapped.length > 0
            ? "Highlights from our portfolio — updated from Sanity CMS."
            : "150+ projects delivered across web development, SaaS, e-commerce, AI automation, and trucking tech. Add projects in Sanity to replace these examples."}
        </p>
      </section>

      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 100px" }}>
        <div style={{ display: "grid", gap: 28 }}>
          {projects.map((p) => (
            <article
              key={p.title + p.image}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 18,
                background: "var(--color-surface)",
                padding: 18,
                boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  marginBottom: 18,
                }}
              >
                <div>
                  <h2 style={{ fontSize: 28, marginBottom: 4 }}>{p.client}</h2>
                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: "rgba(34,197,94,0.16)",
                        color: "#7CFFB1",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {p.status}
                    </span>
                    <span style={{ color: "var(--color-muted)", fontSize: 14 }}>
                      {p.category}
                    </span>
                  </div>
                </div>
                {p.projectUrl !== "#" ? (
                  <a
                    href={p.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--color-accent)",
                      fontWeight: 600,
                      fontSize: 14,
                      textDecoration: "none",
                    }}
                  >
                    Visit Live Website →
                  </a>
                ) : null}
              </div>

              <p
                style={{
                  color: "var(--color-muted)",
                  fontSize: 15,
                  lineHeight: 1.7,
                  marginBottom: 18,
                }}
              >
                {p.description}
              </p>

              <div
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: 14,
                  overflow: "hidden",
                  marginBottom: 18,
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderBottom: "1px solid var(--color-border)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <Image
                      src="/alpha-logo.png"
                      alt="Alpha Solutions"
                      width={18}
                      height={18}
                      style={{ borderRadius: 4, objectFit: "cover" }}
                    />
                  </div>
                  <a
                    href={p.projectUrl !== "#" ? p.projectUrl : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.05)",
                      padding: "7px 12px",
                      color: "var(--color-chrome)",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      textDecoration: "none",
                      display: "block",
                    }}
                  >
                    {p.projectUrl !== "#"
                      ? p.projectUrl
                      : `https://${p.client.toLowerCase().replace(/\s+/g, "")}.com/`}
                  </a>
                </div>
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16 / 9",
                    background: "#0B1120",
                  }}
                >
                  <Image
                    src={p.image}
                    alt={`${p.title} — Alpha Solutions project`}
                    fill
                    sizes="(max-width:768px) 100vw, 1100px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 24,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 420px" }}>
                  <div style={{ color: "var(--color-text)", fontWeight: 600, marginBottom: 8 }}>
                    Technologies
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {p.technologies.map((tech) => (
                      <span
                        key={tech}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 999,
                          border: "1px solid var(--color-border)",
                          color: "var(--color-muted)",
                          fontSize: 12,
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {p.projectUrl !== "#" ? (
                    <a
                      href={p.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: "12px 18px",
                        background: "var(--color-accent)",
                        color: "#05080F",
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 14,
                        textDecoration: "none",
                      }}
                    >
                      Visit Live Website
                    </a>
                  ) : null}
                  <Link
                    href="/contact"
                    style={{
                      padding: "12px 18px",
                      border: "1px solid var(--color-border-glow)",
                      color: "var(--color-accent)",
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 14,
                      textDecoration: "none",
                    }}
                  >
                    Build Something Similar
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "0 24px 100px",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: 28, marginBottom: 12 }}>See how we build</h2>
        <p style={{ color: "var(--color-muted)", marginBottom: 32 }}>
          A behind-the-scenes look at how Alpha Solutions delivers projects.
        </p>
        <YouTubeEmbed
          videoId="2ld9Qch0IUs"
          title="How Alpha Solutions builds web projects"
        />
      </section>

      <section style={{ textAlign: "center", padding: "0 24px 100px" }}>
        <h2 style={{ fontSize: 28, marginBottom: 16 }}>
          Ready to build your project?
        </h2>
        <Link
          href="/contact"
          style={{
            padding: "16px 36px",
            background: "var(--color-accent)",
            color: "#05080F",
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 16,
            textDecoration: "none",
            boxShadow: "var(--glow-sm)",
          }}
        >
          Get a free quote
        </Link>
      </section>
    </main>
  );
}
