import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE_NAME, absoluteUrl } from "@/data/site";
import { urlForImage } from "@/lib/sanity/image";
import { getAllProjects } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: "Projects | Alpha Solutions Services LLC",
  description:
    "Explore our project portfolio from Sanity Studio, including web development, AI automation, and software delivery work.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: `Projects & Case Studies | ${SITE_NAME}`,
    description:
      "Results-focused projects delivered by Alpha Solutions Services LLC.",
    url: absoluteUrl("/projects"),
    type: "website",
  },
};

type SanityProject = {
  _id: string;
  title?: string | null;
  slug?: { current?: string | null } | null;
  client?: string | null;
  description?: string | null;
  category?: string | null;
  status?: string | null;
  technologies?: string[] | null;
  projectUrl?: string | null;
  featuredImage?: unknown;
};

const TRUSTED_BUSINESSES = [
  { name: "Legacy Inc Global", domain: "legacyincglobal.com" },
  { name: "Prospera Enterprises", domain: "prosperaenterprises.com" },
  { name: "Redmon Resources LLC", domain: "redmonresourcesllc.com" },
] as const;

export default async function ProjectsPage() {
  const projects = await getAllProjects<SanityProject>();

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="text-center">
          <h1
            className="text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Project Portfolio
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-[var(--color-muted)]">
            Live portfolio projects managed from Sanity Studio with detailed
            project descriptions, technologies, and direct website links.
          </p>
        </header>

        <section className="mt-14">
          <h2
            className="text-center text-2xl font-bold text-[var(--color-text)] sm:text-3xl"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Trusted by businesses across 3 continents
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {TRUSTED_BUSINESSES.map((business) => (
              <article
                key={business.name}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/25 p-6 text-center"
              >
                <h3 className="text-base font-semibold text-[var(--color-text)]">
                  {business.name}
                </h3>
                <p className="mt-2 text-xs uppercase tracking-wide text-[var(--color-muted)]">
                  {business.domain}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-14 space-y-6">
          {projects.map((project) => {
            const slug = project.slug?.current ?? "";
            const title =
              (project.client && project.client.trim()) ||
              (project.title && project.title.trim()) ||
              "Project";
            const category = (project.category ?? "Project").trim();
            const status = (project.status ?? "Completed").trim();
            const image = urlForImage(project.featuredImage, 1600);
            const description = (project.description ?? "").trim();
            const technologies = (project.technologies ?? []).filter(Boolean);
            const safeHref =
              project.projectUrl && project.projectUrl !== "#"
                ? project.projectUrl
                : null;
            const detailsHref = slug ? `/projects/${slug}` : "/projects";
            return (
              <article
                key={project._id}
                id={slug || undefined}
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 p-4 sm:p-5"
              >
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h2
                      className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl"
                      style={{ fontFamily: "var(--font-display), sans-serif" }}
                    >
                      {title}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                        {status}
                      </span>
                      <span className="text-xs text-[var(--color-muted)]">{category}</span>
                    </div>
                  </div>
                  {safeHref ? (
                    <a
                      href={safeHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[var(--color-accent)] hover:underline"
                    >
                      Visit Live Website →
                    </a>
                  ) : (
                    <Link
                      href={detailsHref}
                      className="text-xs font-semibold text-[var(--color-accent)] hover:underline"
                    >
                      View Project →
                    </Link>
                  )}
                </div>

                {description ? (
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                    {description}
                  </p>
                ) : (
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                    Project information is managed in Sanity Studio and available on
                    the project detail page.
                  </p>
                )}

                {image ? (
                  <div className="mt-4 overflow-hidden rounded-xl border border-[var(--color-border)]">
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={image}
                        alt={title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 1200px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                ) : null}

                {technologies.length > 0 ? (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                      Technologies
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {technologies.map((tech) => (
                        <span
                          key={`${project._id}-${tech}`}
                          className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-muted)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 flex flex-wrap gap-3">
                  {safeHref ? (
                    <a
                      href={safeHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[#05080F] transition-opacity hover:opacity-90"
                    >
                      Visit Live Website
                    </a>
                  ) : null}
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    Build Something Similar
                  </Link>
                  <Link
                    href={detailsHref}
                    className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                  >
                    View Case Study
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      </section>
    </main>
  );
}
