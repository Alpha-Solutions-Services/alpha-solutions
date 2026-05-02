import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url";
import { BlogPostBody } from "@/components/blog/BlogPostBody";
import { SITE_NAME, absoluteUrl } from "@/data/site";
import { urlForImage } from "@/lib/sanity/image";
import { getAllProjects, getProjectBySlug } from "@/lib/sanity/queries";

type Params = { slug: string };

type SanityProject = {
  _id: string;
  title?: string | null;
  slug?: { current?: string | null } | null;
  client?: string | null;
  description?: string | null;
  featuredImage?: SanityImageSource | null;
  projectUrl?: string | null;
  technologies?: string[] | null;
  status?: string | null;
  body?: PortableTextBlock[] | null;
};

export async function generateStaticParams() {
  const projects = await getAllProjects<SanityProject>();
  return projects
    .map((item) => item.slug?.current)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const project = await getProjectBySlug<SanityProject>(params.slug);
  if (!project) return { title: "Project Not Found" };
  const title =
    (project.client && project.client.trim()) ||
    (project.title && project.title.trim()) ||
    "Project";
  const description =
    (project.description && project.description.trim()) ||
    "Project details and delivery breakdown from Alpha Solutions Services LLC.";
  return {
    title: `${title} | Project Case Study`,
    description,
    alternates: { canonical: `/projects/${params.slug}` },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url: absoluteUrl(`/projects/${params.slug}`),
      type: "article",
    },
  };
}

export default async function CaseStudyPage({ params }: { params: Params }) {
  const project = await getProjectBySlug<SanityProject>(params.slug);
  if (!project) notFound();
  const title =
    (project.client && project.client.trim()) ||
    (project.title && project.title.trim()) ||
    "Project";
  const image = urlForImage(project.featuredImage, 1800);
  const technologies = (project.technologies ?? []).filter(Boolean);
  const safeHref =
    project.projectUrl && project.projectUrl !== "#" ? project.projectUrl : null;

  return (
    <main className="min-h-screen bg-[var(--color-bg)] px-4 pb-20 pt-28 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-4xl">
        <header className="mb-10 border-b border-[var(--color-border)] pb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
            {project.status ?? "Completed"}
          </p>
          <h1
            className="mt-3 text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            {title}
          </h1>
          <p className="mt-4 text-[var(--color-muted)]">
            {project.description ?? "Project detail from Sanity Studio."}
          </p>
        </header>

        {image ? (
          <section className="mb-8 overflow-hidden rounded-xl border border-[var(--color-border)]">
            <div className="relative aspect-[16/9]">
              <Image
                src={image}
                alt={title}
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className="object-cover"
              />
            </div>
          </section>
        ) : null}

        <section className="mb-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/20 p-6">
          <h2 className="text-lg font-bold text-[var(--color-text)]">Project Details</h2>
          {project.body && project.body.length > 0 ? (
            <div className="mt-3">
              <BlogPostBody value={project.body} />
            </div>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
              Detailed case study content is managed in Sanity Studio for this
              project. Update the project body content in Studio to show a full
              written case study here.
            </p>
          )}
        </section>

        {technologies.length > 0 ? (
          <section className="mb-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/20 p-6">
            <h2 className="text-lg font-bold text-[var(--color-text)]">Technologies</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)]/60 px-3 py-1 text-xs font-semibold text-[var(--color-text)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mb-12 flex flex-wrap gap-3">
          {safeHref ? (
            <a
              href={safeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[#05080F] transition-opacity hover:opacity-90"
            >
              Visit Live Site →
            </a>
          ) : null}
          <Link
            href="/contact"
            className="inline-flex items-center rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Build Something Similar
          </Link>
        </section>

        <Link
          href="/projects"
          className="inline-flex text-sm font-semibold text-[var(--color-accent)] hover:underline"
        >
          ← Back to all projects
        </Link>
      </article>
    </main>
  );
}
