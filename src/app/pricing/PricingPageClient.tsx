"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import clsx from "clsx";
import { CALENDLY_BOOKING_URL } from "@/data/site";
import { PILLARS, SERVICES, type Service, type ServiceStatus } from "@/data/services";
import { FreeResourcesSection } from "@/components/pricing/FreeResourcesSection";
import { PaymentMethodsSection } from "@/components/shared/PaymentMethodsSection";

type TabKey = "all" | 1 | 2 | 3 | 4 | 5;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: 1, label: "Web & Brand" },
  { key: 2, label: "Business Setup" },
  { key: 3, label: "SaaS" },
  { key: 4, label: "AI & Automation" },
  { key: 5, label: "Alpha Freight" },
];

const PRICING_TIERS = [
  {
    name: "Starter",
    price: "$499",
    period: "one-time",
    description: "Perfect for small business websites and landing pages",
    features: [
      "Basic website development",
      "Up to 5 pages",
      "Responsive design",
      "Basic SEO setup",
      "1 month support",
      "Email support",
      "Source code included",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "$1,499",
    period: "one-time",
    description: "Custom websites with advanced features and functionality",
    features: [
      "Custom web development",
      "Unlimited pages",
      "Advanced SEO optimization",
      "Performance optimization",
      "3 months support",
      "Priority email & chat support",
      "Monthly analytics report",
      "CMS integration",
      "Contact forms",
      "Google Analytics setup",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "quote required",
    description: "Complex projects requiring custom solutions",
    features: [
      "Full custom development",
      "E-commerce integration",
      "Advanced CMS",
      "Mobile app development",
      "AI / chatbot integration",
      "Dedicated project manager",
      "24/7 support",
      "Monthly strategy sessions",
      "Performance monitoring",
      "Security implementation",
      "API development",
      "Database design",
    ],
    popular: false,
  },
] as const;

const FAQ_ITEMS = [
  {
    q: "Are there hidden fees beyond what’s listed?",
    a: "No. Every line item on this page is designed to be explicit. If your scope changes mid-project, we’ll document additions before any extra work begins so you always know what you’re approving.",
  },
  {
    q: "What’s the difference between one-time and monthly pricing?",
    a: "One-time fees cover defined deliverables—like a site build, a flat filing package, or an automation setup. Monthly retainers cover ongoing work such as SEO, hosting-level support, SaaS subscriptions, or managed marketing. Your proposal will spell out which model applies to each line item.",
  },
  {
    q: "How do deposits and milestones work?",
    a: "Most projects use a deposit to secure calendar time, with remaining payments tied to agreed milestones. Larger engagements can be split across multiple phases. We’ll align payment timing with delivery so cash flow stays predictable on both sides.",
  },
  {
    q: "Can I get a fixed quote instead of “get quote” services?",
    a: "Yes. Anything marked “get quote” or “scope-based” needs a short discovery call so we can bound requirements. After that, you’ll receive a written estimate with timeline, assumptions, and optional add-ons—no obligation.",
  },
  {
    q: "What currencies and payment methods do you accept?",
    a: "List prices are in USD. We routinely work with international clients and support major card payments (via Stripe) plus options such as Payoneer, Wise, Zelle, and others—your invoice will list what applies to your region.",
  },
];

function displayStatus(
  status: ServiceStatus | undefined
): "NEW" | "SOON" | "LIVE" {
  if (status === "new") return "NEW";
  if (status === "soon") return "SOON";
  return "LIVE";
}

function timelineForService(service: Service): string {
  const p = service.price.toLowerCase();
  if (service.status === "soon") return "Coming soon";
  if (p.includes("/mo") || p.endsWith("mo") || p.includes("per month"))
    return "Ongoing (monthly)";
  if (p.includes("session")) return "Per session";
  if (p.includes("revenue share")) return "Partnership (rev share)";
  if (p.includes("bundled")) return "Bundled with related SKU";
  if (p.includes("get quote")) return "Scope-based timeline";
  if (service.pillar === 2) return "Typically 1–4 weeks";
  if (service.pillar === 3) return "Typically 2–12 weeks";
  if (service.pillar === 4) return "Typically 2–6 weeks";
  if (service.pillar === 1) return "Typically 2–8 weeks";
  return "Typically 2–6 weeks";
}

function StatusBadge({ status }: { status: "NEW" | "SOON" | "LIVE" }) {
  const styles =
    status === "NEW"
      ? "border-blue-500/50 bg-blue-500/15 text-blue-400"
      : status === "SOON"
        ? "border-amber-500/50 bg-amber-500/15 text-amber-200"
        : "border-blue-500/50 bg-blue-500/15 text-blue-400";

  return (
    <span
      className={clsx(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        styles
      )}
    >
      {status}
    </span>
  );
}

function FaqItem({
  item,
  open,
  onToggle,
}: {
  item: (typeof FAQ_ITEMS)[number];
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-[var(--color-border)] last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-[var(--color-text)]">
          {item.q}
        </span>
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-[var(--color-muted)]" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-[var(--color-muted)]" />
        )}
      </button>
      {open ? (
        <p className="pb-5 text-sm leading-relaxed text-[var(--color-muted)]">
          {item.a}
        </p>
      ) : null}
    </div>
  );
}

export function PricingPageClient() {
  const [tab, setTab] = useState<TabKey>("all");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const rows = useMemo(() => {
    if (tab === "all") return SERVICES;
    return SERVICES.filter((s) => s.pillar === tab);
  }, [tab]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="border-b border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-accent)]">
            Pricing
          </p>
          <h1
            className="text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Transparent pricing. No hidden fees.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-muted)]">
            One-time projects, monthly retainers, and everything in between. All
            prices in USD.
          </p>
        </div>
      </header>

      {/* Website packages — first */}
      <section className="border-b border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2
              className="text-3xl font-bold text-[var(--color-text)] sm:text-4xl"
              style={{ fontFamily: "var(--font-display), sans-serif" }}
            >
              Website packages
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[var(--color-muted)]">
              Fixed-scope options for sites and landing experiences. Need
              something larger? Enterprise covers SaaS, apps, and integrations.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 lg:items-stretch">
            {PRICING_TIERS.map((tier) => (
              <div
                key={tier.name}
                className={clsx(
                  "relative flex flex-col rounded-2xl border bg-[var(--color-surface)]/30 p-8",
                  tier.popular
                    ? "border-[var(--color-accent)] shadow-lg shadow-[var(--color-accent)]/10 lg:scale-[1.02]"
                    : "border-[var(--color-border)]"
                )}
              >
                {tier.popular ? (
                  <span className="absolute right-4 top-4 rounded-full bg-[var(--color-accent)] px-3 py-1 text-xs font-bold text-[#05080F]">
                    Most popular
                  </span>
                ) : null}
                <h3
                  className="text-xl font-bold text-[var(--color-text)]"
                  style={{ fontFamily: "var(--font-display), sans-serif" }}
                >
                  {tier.name}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {tier.description}
                </p>
                <div className="mt-6">
                  <span className="text-4xl font-bold text-[var(--color-text)]">
                    {tier.price === "Custom" ? "Custom" : tier.price}
                  </span>
                  {tier.price !== "Custom" ? (
                    <span className="text-[var(--color-muted)]">
                      {" "}
                      / {tier.period}
                    </span>
                  ) : (
                    <span className="mt-1 block text-sm text-[var(--color-muted)]">
                      {tier.period}
                    </span>
                  )}
                </div>
                <ul className="mt-8 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm text-[var(--color-muted)]">
                      <CheckCircle
                        className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]"
                        aria-hidden
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={
                    tier.price === "Custom" ? "/contact" : CALENDLY_BOOKING_URL
                  }
                  target={tier.price === "Custom" ? undefined : "_blank"}
                  rel={tier.price === "Custom" ? undefined : "noopener noreferrer"}
                  className={clsx(
                    "mt-8 inline-flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-opacity hover:opacity-90",
                    tier.popular
                      ? "bg-[var(--color-accent)] text-[#05080F]"
                      : "border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)]"
                  )}
                >
                  {tier.price === "Custom" ? "Contact sales" : "Get started"}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FreeResourcesSection />

      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <PaymentMethodsSection />
        </div>
      </section>

      {/* Pillar tabs + table */}
      <section className="px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div
            className="mb-8 flex flex-wrap gap-2"
            role="tablist"
            aria-label="Filter by service pillar"
          >
            {TABS.map((t) => (
              <button
                key={t.key === "all" ? "all" : String(t.key)}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={clsx(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  tab === t.key
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]"
                    : "border-[var(--color-border)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-text)]"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 5 && rows.length === 0 ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/30 p-10 text-center">
              <p className="text-[var(--color-text)]">
                Alpha Freight programs and training are listed on our dedicated
                freight hub.
              </p>
              <Link
                href="/freight"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)] hover:underline"
              >
                View Alpha Freight
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
              <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/40">
                    <th className="px-4 py-3 font-semibold text-[var(--color-text)] sm:px-6">
                      Service
                    </th>
                    <th className="px-4 py-3 font-semibold text-[var(--color-text)] sm:px-6">
                      Starting price
                    </th>
                    <th className="px-4 py-3 font-semibold text-[var(--color-text)] sm:px-6">
                      Timeline
                    </th>
                    <th className="px-4 py-3 font-semibold text-[var(--color-text)] sm:px-6">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => {
                    const st = displayStatus(s.status);
                    return (
                      <tr
                        key={s.slug}
                        className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface)]/20"
                      >
                        <td className="px-4 py-4 sm:px-6">
                          <Link
                            href={`/services/${s.slug}`}
                            className="font-medium text-[var(--color-text)] hover:text-[var(--color-accent)] hover:underline"
                          >
                            {s.name}
                          </Link>
                          <p className="mt-1 text-xs text-[var(--color-muted)]">
                            {PILLARS[s.pillar].name}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 font-medium text-[var(--color-accent)] sm:px-6">
                          {s.price}
                        </td>
                        <td className="px-4 py-4 text-[var(--color-muted)] sm:px-6">
                          {timelineForService(s)}
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <StatusBadge status={st} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-6 text-center text-xs text-[var(--color-muted)]">
            Timelines are typical ranges; your statement of work may vary.
            Retainers renew until cancelled per agreement.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-[var(--color-border)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2
            className="text-center text-3xl font-bold text-[var(--color-text)]"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Pricing FAQs
          </h2>
          <p className="mt-3 text-center text-sm text-[var(--color-muted)]">
            Straight answers before you book a call.
          </p>
          <div className="mt-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/20 px-6">
            {FAQ_ITEMS.map((item, i) => (
              <FaqItem
                key={item.q}
                item={item}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-[var(--color-border)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--color-accent)]/40 bg-[var(--color-accent-dim)] p-10 text-center">
          <h2
            className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl"
            style={{ fontFamily: "var(--font-display), sans-serif" }}
          >
            Not sure which service you need? Get a free consultation
          </h2>
          <p className="mt-4 text-sm text-[var(--color-muted)]">
            Tell us about your goals—we’ll map the right pillar, timeline, and
            budget before you commit.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent)] px-8 py-3.5 text-sm font-semibold text-[#05080F] transition-opacity hover:opacity-90"
          >
            Book a free consultation
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
