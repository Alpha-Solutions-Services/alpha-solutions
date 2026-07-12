"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { CALENDLY_BOOKING_URL } from "@/data/site";
import { PILLARS, SERVICES, type Service } from "@/data/services";
import type { HomeFeaturedProject } from "@/lib/sanity/featured-home";

/**
 * Site chrome: `Navbar` and `Footer` from `@/components/layout` are rendered
 * in `app/layout.tsx` so every route stays consistent. This file is the main
 * column only.
 */

const PILLAR_IDS = [1, 2, 3, 4, 5] as const;
type PillarId = (typeof PILLAR_IDS)[number];

const PILLAR_HEADLINE: Record<PillarId, string> = {
  1: "Web & Brand",
  2: "Business Setup",
  3: "SaaS Products",
  4: "AI & Automation",
  5: "Alpha Freight",
};

const PILLAR_COPY: Record<PillarId, string> = {
  1: "Websites, mobile apps, and digital marketing engineered for measurable growth—not vanity metrics.",
  2: "US entity formation, trucking authority, and compliance handled with the rigor your regulators expect.",
  3: "Purpose-built software and subscription products that scale with your operations and margins.",
  4: "Chatbots, voice agents, and workflow automation that cut response time and operating cost.",
  5: "Programs and tools built for carriers, dispatchers, and freight operators who live in the lane.",
};

const pillarExploreHref = (id: PillarId) =>
  id === 5 ? "/freight" : `/services/${PILLARS[id].slug}`;

const whyChooseCards = [
  {
    icon: "US",
    title: "US-Registered, Pakistan-Powered",
    text: "US LLC accountability with a dedicated Pakistan delivery team - you get Western standards at competitive rates.",
  },
  {
    icon: "FR",
    title: "Founder Reviews Every Project",
    text: "Muhammad Mikran personally oversees all deliveries. No handoffs to junior staff without oversight.",
  },
  {
    icon: "LP",
    title: "Live Client Portal",
    text: "Track your project milestones in real time. No surprise delays, no chasing updates.",
  },
  {
    icon: "CR",
    title: "5.0 Rated on Clutch",
    text: "3 verified reviews from US and international clients. 100% satisfaction rate across all engagements.",
  },
] as const;

const trustedBusinesses = [
  { name: "Legacy Inc Global", domain: "legacyincglobal.com" },
  { name: "Prospera Enterprises", domain: "prosperaenterprises.com" },
  { name: "Redmon Resources LLC", domain: "redmonresourcesllc.com" },
] as const;

const testimonials = [
  {
    quote:
      "The project was delivered with a strong focus on efficiency, scalability, and ease of use. Alpha Solutions delivered outstanding results, and their support throughout the project was excellent.",
    name: "Jacquries Williams",
    title: "Owner, Legacy Inc Global",
    location: "Dallas, Texas",
    tag: "AI Automation Project",
  },
  {
    quote:
      "Alpha Solutions designed and developed a modern, high-performance corporate website that established a strong digital presence and improved our brand credibility immediately.",
    name: "Hamza",
    title: "Owner, Prospera Enterprises",
    location: "United States",
    tag: "Web Development + Branding",
  },
] as const;

/** Pill badges on “Most popular services” cards. */
const pillarAccent: Record<
  (typeof PILLARS)[PillarId]["color"],
  string
> = {
  blue: "border-blue-500/35 bg-blue-500/[0.06] text-blue-400/90",
  amber: "border-amber-500/35 bg-amber-500/[0.06] text-amber-200/90",
  purple: "border-violet-500/35 bg-violet-500/[0.06] text-violet-200/90",
  green: "border-emerald-500/35 bg-emerald-500/[0.06] text-emerald-300/90",
};

/** Thin left accent on homepage pillar cards (blue premium background). */
const pillarLeftAccent: Record<
  (typeof PILLARS)[PillarId]["color"],
  string
> = {
  blue: "border-l-sky-400",
  amber: "border-l-amber-400",
  purple: "border-l-violet-400",
  green: "border-l-emerald-400",
};

function FadeSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-72px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function countByPillar(id: PillarId) {
  return SERVICES.filter((s) => s.pillar === id).length;
}

function topFeaturedForPillar(id: PillarId): Service[] {
  return SERVICES.filter((s) => s.pillar === id && s.featured).slice(0, 3);
}

const featuredServices = SERVICES.filter((s) => s.featured);

const recentProjects = [
  {
    client: "Redmon Resources LLC",
    category: "Web Development",
    image: "/projects/redmon-resources.png",
    description:
      "AI-driven business website with responsive UX, content rendering, and custom integrations.",
    url: "https://redmonresourcesllc.com/",
  },
  {
    client: "Giftify Store",
    category: "E-commerce",
    image: "/projects/giftify-store.png",
    description:
      "Online storefront with product flows, inventory handling, and conversion-focused design.",
    url: "https://giftifystore.com.pk/",
  },
  {
    client: "AH Logistics",
    category: "Web Platform",
    image: "/projects/ah-logistics.png",
    description:
      "Operations-focused logistics platform with real-time workflow visibility and dispatch support.",
    url: "#",
  },
] as const;

const processSteps = [
  {
    n: "01",
    title: "Discovery",
    body: "We align on goals, constraints, and success metrics—so scope and timeline reflect reality.",
  },
  {
    n: "02",
    title: "Design",
    body: "Architecture, UX, and technical specs are documented before a single line of production code.",
  },
  {
    n: "03",
    title: "Build",
    body: "Iterative delivery with transparent milestones. You see progress in our client portal, not surprises.",
  },
  {
    n: "04",
    title: "Launch",
    body: "Hardened releases, handoff, and optional ongoing support—optimized for uptime and ROI.",
  },
];

type ShowcaseCard = {
  key: string;
  headline: string;
  subline: string;
  category: string;
  image: string;
  description: string;
  url: string;
};

export default function HomePageClient({
  featuredProjects = [],
}: {
  featuredProjects?: HomeFeaturedProject[];
}) {
  const heroRef = useRef<HTMLElement | null>(null);
  const [videoMounted, setVideoMounted] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const showcaseProjects: ShowcaseCard[] = useMemo(() => {
    if (featuredProjects.length > 0) {
      return featuredProjects.map((p) => ({
        key: p._id,
        headline: p.client,
        subline: p.title,
        category: p.category,
        image: p.image ?? "/alpha-logo.png",
        description: p.description,
        url: p.href,
      }));
    }
    return recentProjects.map((p, i) => ({
      key: `fallback-${i}`,
      headline: p.client,
      subline: "",
      category: p.category,
      image: p.image,
      description: p.description,
      url: p.url,
    }));
  }, [featuredProjects]);

  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) return;

    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection;
    if (conn?.saveData) return;

    setVideoMounted(true);

    const el = heroRef.current;
    let observer: IntersectionObserver | null = null;
    if (el && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setVideoMounted(true);
            observer?.disconnect();
          }
        },
        { rootMargin: "120px" }
      );
      observer.observe(el);
    }

    return () => {
      observer?.disconnect();
    };
  }, []);

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* —— Hero —— */}
      <section
        ref={heroRef}
        className="relative overflow-hidden border-b border-[var(--color-border)] px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8"
      >
        {videoMounted ? (
          <video
            className={clsx(
              "pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
              videoReady ? "opacity-30" : "opacity-0"
            )}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onCanPlay={() => setVideoReady(true)}
            aria-hidden
          >
            <source src="/videos/hero-1-video.mp4" type="video/mp4" />
          </video>
        ) : null}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, var(--color-accent), transparent)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-6 flex justify-center">
              <Image
                src="/alpha-logo.png"
                alt="Alpha Solutions Services LLC"
                width={72}
                height={72}
                className="h-[72px] w-[72px] rounded-2xl object-cover shadow-[0_0_40px_rgba(56,163,255,0.15)] ring-1 ring-[var(--color-border)]"
                priority
              />
            </div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Alpha Solutions Services LLC · West Jordan, Utah
            </p>
            <h1
              className="text-balance text-4xl font-bold leading-[1.1] tracking-tight text-[var(--color-text)] sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              We Build the Digital Infrastructure Behind Growing Businesses
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-[var(--color-muted)] sm:text-xl">
              Custom software, AI automation, and business setup — from Utah to
              the world.
            </p>
            <p className="mx-auto mt-3 max-w-3xl text-xs font-medium uppercase tracking-wide text-[var(--color-muted)] sm:text-sm">
              US-managed operations in West Jordan, Utah with a dedicated
              development center in Gujranwala, Pakistan. You get US
              accountability at agency-competitive rates.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex min-w-[200px] items-center justify-center rounded-lg bg-[var(--color-accent)] px-8 py-3.5 text-sm font-semibold text-[var(--color-bg)] transition-opacity hover:opacity-90"
              >
                Get a free quote
              </Link>
              <Link
                href="/projects"
                className="inline-flex min-w-[200px] items-center justify-center rounded-lg border border-[var(--color-border)] bg-transparent px-8 py-3.5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                View our work
              </Link>
            </div>
            <p className="mt-8 text-sm text-[var(--color-muted)]">
              <Link
                href="/about#our-story"
                className="inline-flex items-center gap-1.5 text-[var(--color-text)] underline-offset-4 transition-colors hover:text-[var(--color-accent)] hover:underline"
              >
                <span aria-hidden className="text-[var(--color-accent)]">
                  ▶
                </span>
                Watch: A day at Alpha Solutions
              </Link>
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 flex flex-wrap items-center justify-center gap-6 border-t border-[var(--color-border)] pt-10 sm:gap-0"
          >
            {[
              ["50+", "Projects Delivered"],
              ["5.0", "Clutch Rating"],
              ["3", "Continents Served"],
            ].map(([a, b], idx) => (
              <Fragment key={b}>
                {idx > 0 ? (
                  <span
                    className="hidden text-[var(--color-muted)] sm:inline"
                    aria-hidden
                  >
                    |
                  </span>
                ) : null}
                <div className="min-w-[140px] text-center">
                  <div
                    className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    {a}
                  </div>
                  <div className="mt-1 text-xs font-medium text-[var(--color-muted)] sm:text-sm">
                    {b}
                  </div>
                </div>
              </Fragment>
            ))}
          </motion.div>
        </div>
      </section>

      {/* —— Pillars —— */}
      <section className="border-b border-[var(--color-border)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeSection className="mb-12 text-center">
            <h2
              className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Everything your business needs to grow
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[var(--color-muted)]">
              Five practice areas. One accountable partner. Headquartered in
              Utah with a dedicated delivery center in Gujranwala, Pakistan.
            </p>
          </FadeSection>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {PILLAR_IDS.map((id, i) => {
              const meta = PILLARS[id];
              const count = countByPillar(id);
              const top = topFeaturedForPillar(id);
              const leftAccent = pillarLeftAccent[meta.color];
              return (
                <FadeSection key={id} delay={i * 0.06}>
                  <article
                    className={`relative flex h-full flex-col overflow-hidden rounded-xl border border-sky-500/25 bg-gradient-to-br from-[#0b1628] via-[#0f2748] to-[#081222] p-6 pl-7 shadow-[0_16px_40px_rgba(15,39,72,0.45)] ring-1 ring-sky-400/10 transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(56,163,255,0.12)] ${leftAccent} border-l-4`}
                  >
                    <div
                      className="pointer-events-none absolute -right-10 top-6 z-10 w-[9.5rem] rotate-45 bg-gradient-to-r from-amber-500 via-yellow-200 to-amber-400 py-1.5 text-center shadow-md"
                      aria-hidden
                    >
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900">
                        Premium
                      </span>
                    </div>
                    <h3
                      className="pr-16 text-xl font-bold text-white"
                      style={{ fontFamily: "var(--font-display), sans-serif" }}
                    >
                      {PILLAR_HEADLINE[id]}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-sky-100/80">
                      {PILLAR_COPY[id]}
                    </p>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-sky-200/90">
                      {count} service{count !== 1 ? "s" : ""}
                    </p>
                    <ul className="mt-3 space-y-2 border-t border-white/10 pt-4">
                      {top.length > 0 ? (
                        top.map((s) => (
                          <li
                            key={s.slug}
                            className="flex items-center gap-2.5 text-sm text-sky-50/95"
                          >
                            {s.image ? (
                              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md ring-1 ring-white/20">
                                <Image
                                  src={s.image}
                                  alt=""
                                  fill
                                  sizes="36px"
                                  className="object-cover"
                                />
                              </span>
                            ) : (
                              <span
                                className="text-[var(--color-accent)]"
                                aria-hidden
                              >
                                ·
                              </span>
                            )}
                            <span>{s.name}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-sky-200/70">
                          Explore programs and integrations on the Alpha Freight
                          hub.
                        </li>
                      )}
                    </ul>
                    <Link
                      href={pillarExploreHref(id)}
                      className="mt-6 inline-flex w-fit items-center justify-center rounded-lg bg-sky-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_4px_14px_rgba(56,189,248,0.35)] transition-opacity hover:opacity-90"
                    >
                      View services
                    </Link>
                    <Link
                      href="/contact"
                      className="mt-3 inline-flex w-fit items-center gap-1 text-sm font-semibold text-sky-300 hover:text-white hover:underline"
                    >
                      Get a quote →
                    </Link>
                  </article>
                </FadeSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* —— Featured services —— */}
      <section className="border-b border-[var(--color-border)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeSection className="mb-12 text-center">
            <h2
              className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Most popular services
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[var(--color-muted)]">
              Fixed-scope options and retainer programs clients engage first—
              each tied to measurable outcomes.
            </p>
          </FadeSection>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((s, i) => {
              const p = PILLARS[s.pillar];
              const ring = pillarAccent[p.color];
              return (
                <FadeSection key={s.slug} delay={(i % 6) * 0.05}>
                  <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/40">
                    {s.image ? (
                      <div className="relative aspect-[16/9] w-full shrink-0 border-b border-[var(--color-border)]">
                        <Image
                          src={s.image}
                          alt={s.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--color-bg)]/90 via-transparent to-transparent" />
                      </div>
                    ) : null}
                    <div className="flex flex-1 flex-col p-5">
                    <span
                      className={`inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium ${ring}`}
                    >
                      {PILLAR_HEADLINE[s.pillar]}
                    </span>
                    <h3
                      className="mt-4 text-lg font-bold text-[var(--color-text)]"
                      style={{ fontFamily: "var(--font-display), sans-serif" }}
                    >
                      {s.name}
                    </h3>
                    <p className="mt-2 text-sm font-medium text-[var(--color-accent)]">
                      {s.price}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-3 pt-6">
                      <Link
                        href={s.primaryHref ?? `/services/${s.slug}`}
                        className="inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[#05080F] transition-opacity hover:opacity-90"
                      >
                        View details
                      </Link>
                      <Link
                        href={`/contact?service=${s.slug}`}
                        className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                      >
                        Get quote
                      </Link>
                    </div>
                    </div>
                  </article>
                </FadeSection>
              );
            })}
          </div>
          <FadeSection className="mt-10 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-[#05080F] transition-opacity hover:opacity-90"
            >
              Compare pricing
            </Link>
          </FadeSection>
        </div>
      </section>

      {/* —— Why Choose Alpha Solutions —— */}
      <section className="border-b border-[var(--color-border)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeSection className="mb-12 text-center">
            <h2
              className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Why Choose Alpha Solutions
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-[var(--color-muted)]">
              A founder-led, SEO-focused delivery model for businesses that need
              measurable digital outcomes and accountable execution.
            </p>
          </FadeSection>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {whyChooseCards.map((card, index) => (
              <FadeSection key={card.title} delay={index * 0.06}>
                <article className="h-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/35 p-6">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-accent)]/35 bg-[var(--color-accent-dim)] text-xs font-bold tracking-wide text-[var(--color-accent)]">
                    {card.icon}
                  </div>
                  <h3
                    className="mt-4 text-lg font-bold text-[var(--color-text)]"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    {card.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                    {card.text}
                  </p>
                </article>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* —— Recent projects —— */}
      <section className="border-b border-[var(--color-border)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeSection className="mb-12 text-center">
            <h2
              className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              {featuredProjects.length > 0 ? "Featured projects" : "Recent projects"}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[var(--color-muted)]">
              {featuredProjects.length > 0
                ? "Highlights from our portfolio — curated in Sanity Studio."
                : "Real work, real screenshots, real delivery. See the kind of builds clients hire us for most often."}
            </p>
          </FadeSection>
          <div className="grid gap-8 lg:grid-cols-3">
            {showcaseProjects.map((project, i) => (
              <FadeSection key={project.key} delay={i * 0.06}>
                <article className="flex h-full flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/35 p-4 shadow-[0_12px_34px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:-translate-y-1">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3
                        className="text-lg font-bold text-[var(--color-text)]"
                        style={{ fontFamily: "var(--font-display), sans-serif" }}
                      >
                        {project.headline}
                      </h3>
                      {project.subline &&
                      project.subline.trim() &&
                      project.subline !== project.headline ? (
                        <p className="text-xs text-[var(--color-muted)]">
                          {project.subline}
                        </p>
                      ) : null}
                      <p className="text-sm text-[var(--color-muted)]">
                        {project.category}
                      </p>
                    </div>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      Completed
                    </span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]/40">
                    <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="relative aspect-[16/10]">
                      <Image
                        src={project.image}
                        alt={project.headline}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-[var(--color-muted)]">
                    {project.description}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    {project.url !== "#" ? (
                      project.url.startsWith("/") ? (
                        <Link
                          href={project.url}
                          className="inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[#05080F] transition-opacity hover:opacity-90"
                        >
                          View project
                        </Link>
                      ) : (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[#05080F] transition-opacity hover:opacity-90"
                        >
                          Visit site
                        </a>
                      )
                    ) : null}
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    >
                      Build something similar
                    </Link>
                  </div>
                </article>
              </FadeSection>
            ))}
          </div>
          <FadeSection className="mt-10 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-[#05080F] transition-opacity hover:opacity-90"
            >
              View all projects
            </Link>
          </FadeSection>
        </div>
      </section>

      {/* —— Trusted by and testimonials —— */}
      <section className="border-b border-[var(--color-border)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeSection className="text-center">
            <h2
              className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Trusted by businesses across 3 continents
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[var(--color-muted)]">
              SEO-focused digital execution for growth-stage teams in multiple
              regions.
            </p>
          </FadeSection>
          <FadeSection className="mt-10">
            <div className="grid gap-4 sm:grid-cols-3">
              {trustedBusinesses.map((business) => (
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
          </FadeSection>

          <FadeSection className="mt-14 text-center">
            <h3
              className="text-2xl font-bold tracking-tight text-[var(--color-text)] sm:text-3xl"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              What Our Clients Say
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-[var(--color-muted)]">
              Verified Clutch testimonials from web development and AI
              automation engagements.
            </p>
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {testimonials.map((item) => (
                <article
                  key={item.name}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/25 p-6 text-left"
                >
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                    &quot;{item.quote}&quot;
                  </p>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[var(--color-accent)]">
                    {item.tag}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[var(--color-text)]">
                    {item.name}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {item.title} · {item.location}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-[var(--color-accent)]">
                    5/5 stars
                  </p>
                </article>
              ))}
            </div>
            <div className="mt-6">
              <a
                href="https://clutch.co/profile/alpha-solutions-services#reviews"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex text-sm font-semibold text-[var(--color-accent)] hover:underline"
              >
                View all reviews on Clutch →
              </a>
            </div>
          </FadeSection>

          <FadeSection className="mt-8">
            <p className="text-center text-sm text-[var(--color-muted)]">
              Payments accepted via Payoneer, Wise, Zelle & more - in USD, PKR,
              EUR, and GBP.
            </p>
          </FadeSection>
        </div>
      </section>

      {/* —— Trust & leadership —— */}
      <section className="border-b border-[var(--color-border)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <FadeSection className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-accent)]">
              Founder-led delivery
            </p>
            <h2
              className="mt-3 text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Built by operators, not a faceless agency
            </h2>
            <p className="mt-4 max-w-3xl text-[var(--color-muted)]">
              Founded by Muhammad Mikran Sandhu, Dispatch Manager and Tech
              Operator. We ship practical systems for logistics, operations, and
              growth teams with transparent milestones and accountable ownership.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[#05080F] transition-opacity hover:opacity-90"
              >
                Meet the founder
              </Link>
              <a
                href="https://www.linkedin.com/company/alpha-solutions-by-alpha-group/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                LinkedIn profile
              </a>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* —— Process —— */}
      <section className="border-b border-[var(--color-border)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <FadeSection className="mb-12 text-center">
            <h2
              className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              How we work
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-[var(--color-muted)]">
              A disciplined delivery model you can explain to your board—or
              your bank.
            </p>
          </FadeSection>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, i) => (
              <FadeSection key={step.title} delay={i * 0.07}>
                <div className="h-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/25 p-6">
                  <span
                    className="text-3xl font-bold text-[var(--color-accent)]"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    {step.n}
                  </span>
                  <h3
                    className="mt-2 text-lg font-bold text-[var(--color-text)]"
                    style={{ fontFamily: "var(--font-display), sans-serif" }}
                  >
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                    {step.body}
                  </p>
                </div>
              </FadeSection>
            ))}
          </div>
          <FadeSection className="mt-10 text-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-6 py-3 text-sm font-semibold text-[#05080F] transition-opacity hover:opacity-90"
            >
              Start your project
            </Link>
          </FadeSection>
        </div>
      </section>

      {/* —— CTA —— */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <FadeSection className="mx-auto max-w-3xl text-center">
          <h2
            className="text-3xl font-bold tracking-tight text-[var(--color-text)] sm:text-4xl"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Ready to build something great?
          </h2>
          <p className="mt-4 text-[var(--color-muted)]">
            Speak with our team in Utah or reach us on WhatsApp. Calendly
            scheduling is available for qualified projects.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://wa.me/923494206922"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-[220px] items-center justify-center rounded-lg bg-[#25D366] px-8 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              WhatsApp us now
            </a>
            <a
              href={CALENDLY_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-[220px] items-center justify-center rounded-lg border border-[var(--color-border)] px-8 py-3.5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Schedule a call
            </a>
          </div>
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            Book a 30-minute intro on{" "}
            <a
              href={CALENDLY_BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-accent)] underline-offset-2 hover:underline"
            >
              Calendly
            </a>
            .
          </p>
        </FadeSection>
      </section>
    </main>
  );
}
