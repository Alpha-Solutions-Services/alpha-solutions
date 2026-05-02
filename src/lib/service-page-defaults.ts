import { PILLARS, type Service } from "@/data/services";

const TRUST_POINTS = [
  "US-registered LLC (West Jordan, Utah) with a senior engineering pod in Gujranwala—clear contracts, SLAs, and timezone overlap.",
  "Transparent delivery: milestones, source access where agreed, and client portal visibility so you are never guessing at status.",
  "Security-minded practices, documented handoffs, and post-launch options so production systems stay maintainable.",
] as const;

const PRICING_INCLUDED_FALLBACK = [
  "Scoping call and written statement of work",
  "Implementation aligned to agreed milestones",
  "QA pass before release and deployment support",
  "Knowledge transfer or runbook for handoff",
] as const;

const PRICING_EXTRA_FALLBACK = [
  "Third-party licenses, domains, or paid APIs billed at cost unless bundled in your SOW",
  "Out-of-scope change requests (quoted separately)",
  "Ongoing retainers or 24/7 support unless purchased as an add-on",
] as const;

function titleCaseWords(s: string) {
  return s
    .split(/\s+/)
    .map((w) =>
      w.length ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w
    )
    .join(" ");
}

/** e.g. "Custom Web Development Services | Alpha Solutions" */
export function formatMetaTitle(
  serviceName: string,
  sanityOverride?: string | null
) {
  if (sanityOverride?.trim()) {
    return `${sanityOverride.trim()} | Alpha Solutions`;
  }
  const words = titleCaseWords(serviceName.trim());
  if (/\bservices?\b/i.test(serviceName)) {
    return `${words} | Alpha Solutions`;
  }
  return `${words} Services | Alpha Solutions`;
}

export function buildMetaDescription(
  service: Service,
  sanityDescription?: string | null,
  techHint?: string | null
) {
  const fromCms = sanityDescription?.trim();
  if (fromCms && fromCms.length >= 80) return fromCms;
  const pillar = PILLARS[service.pillar].name;
  const tech = techHint?.trim();
  const techBit = tech
    ? ` ${tech.includes(",") ? tech : `Stack includes ${tech}.`}`
    : "";
  return `Professional ${service.name.toLowerCase()} (${service.price}). ${pillar}.${techBit} West Jordan, Utah + Pakistan delivery team. Get a free quote.`.replace(
    /\s+/g,
    " "
  );
}

export function shortDescriptionForPage(
  service: Service,
  sanityDescription?: string | null
) {
  const d = sanityDescription?.trim();
  if (d) return d;
  if (service.description?.trim()) return service.description.trim();
  return `End-to-end delivery with clear milestones and ownership. ${PILLARS[service.pillar].name} — priced at ${service.price}.`;
}

export function defaultWhatsIncluded(service: Service): string[] {
  const p = service.pillar;
  if (p === 1) {
    return [
      "Technical discovery: stack, integrations, hosting, and analytics",
      "UI/UX alignment with your brand and conversion goals",
      "Implementation with code reviews and staged releases",
      "Performance, accessibility, and SEO baselines addressed in scope",
      "Launch checklist, monitoring hooks, and rollback plan",
      "Optional maintenance window quoted separately",
    ];
  }
  if (p === 2) {
    return [
      "Document checklist tailored to your state and entity type",
      "Prepared filings and submission tracking",
      "Registered agent / compliance notes where applicable",
      "Status updates at each government or carrier step",
      "Digital copies of completed filings for your records",
      "Guidance on common next steps (EIN, banking, insurance)",
    ];
  }
  if (p === 3) {
    return [
      "Product requirements captured as user stories or specs",
      "Architecture suited to scale, tenancy, and billing if needed",
      "Core workflows built, tested, and demoed on staging",
      "Admin tooling or dashboards agreed in scope",
      "Deployment pipeline and environment strategy",
      "Handoff for operations or a phased roadmap for v2",
    ];
  }
  if (p === 4) {
    return [
      "Use-case mapping: channels, triggers, escalation, and KPIs",
      "Prompt / flow design with guardrails and logging",
      "Integration with your site, CRM, or messaging platforms",
      "Test scenarios covering edge cases and fallbacks",
      "Launch playbook and tuning window",
      "Documentation for non-technical admins",
    ];
  }
  return [
    "Freight-market context applied to workflows and integrations",
    "Configuration aligned to carriers, dispatch, or lead workflows",
    "Training notes for your operators",
    "Go-live support during the cutover window",
    "Roadmap hooks for scaling volume or adding modules",
    "Dedicated point of contact for post-launch questions (window per SOW)",
  ];
}

export function mergeWhatsIncluded(
  service: Service,
  sanityBullets: string[]
): string[] {
  if (sanityBullets.length >= 4) {
    return sanityBullets.slice(0, 6);
  }
  const merged = [...sanityBullets];
  const defaults = defaultWhatsIncluded(service);
  for (const line of defaults) {
    if (merged.length >= 6) break;
    if (line && !merged.includes(line)) merged.push(line);
  }
  return merged.slice(0, 6);
}

export function getTrustPoints() {
  return [...TRUST_POINTS];
}

export function getPricingIncludedFallback() {
  return [...PRICING_INCLUDED_FALLBACK];
}

export function getPricingExtraFallback() {
  return [...PRICING_EXTRA_FALLBACK];
}
