import Link from "next/link";
import {
  breadcrumbListJsonLd,
  PILLAR_LANDING_COPY,
  type PillarPageId,
} from "@/lib/pillar-landing";
import { PILLARS, SERVICES } from "@/data/services";
import { PillarFAQ, PillarServiceGrid } from "./PillarLandingClient";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://alphasolutions.software";

export function PillarLandingPage({ pillarId }: { pillarId: PillarPageId }) {
  const copy = PILLAR_LANDING_COPY[pillarId];
  const pillar = PILLARS[pillarId];
  const services = SERVICES.filter((s) => s.pillar === pillarId);
  const slug = pillar.slug;
  const jsonLd = breadcrumbListJsonLd(pillarId);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="min-h-screen bg-[var(--color-bg)]">
        <header className="border-b border-[var(--color-border)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <nav
              className="mb-8 flex flex-wrap items-center justify-center gap-2 text-xs text-[var(--color-muted)]"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="hover:text-[var(--color-accent)]">
                Home
              </Link>
              <span aria-hidden>/</span>
              <Link href="/services" className="hover:text-[var(--color-accent)]">
                Services
              </Link>
              <span aria-hidden>/</span>
              <span className="text-[var(--color-text)]">{copy.displayName}</span>
            </nav>
            <h1
              className="text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              {copy.displayName}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-muted)]">
              {copy.heroTagline}
            </p>
            <p className="mt-4 text-sm font-medium text-[var(--color-text)]">
              {services.length} service{services.length !== 1 ? "s" : ""} available
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href={`/contact?pillar=${encodeURIComponent(slug)}`}
                className="inline-flex min-w-[200px] items-center justify-center rounded-lg bg-[var(--color-accent)] px-8 py-3.5 text-sm font-semibold text-[var(--color-bg)] transition-opacity hover:opacity-90"
              >
                Get a free quote
              </Link>
              <Link
                href="/projects"
                className="inline-flex min-w-[200px] items-center justify-center rounded-lg border border-[var(--color-border)] px-8 py-3.5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                View our work
              </Link>
            </div>
          </div>
        </header>

        <section
          className="border-b border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8"
          aria-labelledby="pillar-services-heading"
        >
          <div className="mx-auto max-w-7xl">
            <h2
              id="pillar-services-heading"
              className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Services
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">
              Every engagement starts with a written scope. Select a service for
              pricing context and typical deliverables.
            </p>
            <div className="mt-10">
              <PillarServiceGrid services={services} />
            </div>
          </div>
        </section>

        <section
          className="border-b border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8"
          aria-labelledby="case-studies-heading"
        >
          <div className="mx-auto max-w-7xl">
            <h2
              id="case-studies-heading"
              className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Featured case studies
            </h2>
            {/* TODO: Replace placeholders with Sanity project / caseStudy documents */}
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Representative outcomes from client programs (content pending CMS).
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <article
                  key={n}
                  className="flex flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 p-6"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                    Case study · TODO
                  </p>
                  <h3
                    className="mt-3 text-lg font-bold text-[var(--color-text)]"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    Project title TBD
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-[var(--color-muted)]">
                    Pull summary, metrics, and hero image from Sanity when
                    `project` or `caseStudy` schema is wired to this pillar.
                  </p>
                  <span className="mt-4 text-xs text-[var(--color-muted)]">
                    {SITE_URL}/projects
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="border-b border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8"
          aria-labelledby="faq-heading"
        >
          <div className="mx-auto max-w-3xl">
            <h2
              id="faq-heading"
              className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Frequently asked questions
            </h2>
            <div className="mt-8">
              <PillarFAQ faqs={copy.faqs} />
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-xl border border-[var(--color-accent)]/35 bg-[var(--color-accent-dim)] p-10 text-center">
            <h2
              className="text-2xl font-bold text-[var(--color-text)]"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Ready to scope {copy.displayName}?
            </h2>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              Share your timeline, budget band, and constraints—we respond with
              next steps, not a generic brochure.
            </p>
            <Link
              href={`/contact?pillar=${encodeURIComponent(slug)}`}
              className="mt-8 inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-8 py-3.5 text-sm font-semibold text-[var(--color-bg)] transition-opacity hover:opacity-90"
            >
              Talk to our team
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}
