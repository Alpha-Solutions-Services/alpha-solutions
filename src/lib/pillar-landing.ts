import type { Metadata } from "next";
import { PILLARS } from "@/data/services";

export type PillarPageId = 1 | 2 | 3 | 4;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.alphasolutions.software";

export type PillarFaq = { question: string; answer: string };

export const PILLAR_LANDING_COPY: Record<
  PillarPageId,
  {
    displayName: string;
    heroTagline: string;
    metaTitle: string;
    metaDescription: string;
    faqs: PillarFaq[];
  }
> = {
  1: {
    displayName: "Web, Brand & Digital",
    heroTagline:
      "Websites, apps, and growth channels that convert—built with modern stacks, clear milestones, and US-led delivery.",
    metaTitle: "Web, Brand & Digital Services | Alpha Solutions",
    metaDescription:
      "Custom web development, mobile apps, e-commerce, SEO, and digital marketing. From $349. West Jordan, Utah. Transparent scopes and client portal tracking.",
    faqs: [
      {
        question: "Do you work with existing sites and codebases?",
        answer:
          "Yes. We audit what you have, document risks, and either extend, refactor, or replatform depending on your goals and budget. You get a written recommendation before we write a contract.",
      },
      {
        question: "What stacks do you typically use?",
        answer:
          "We frequently ship with React, Next.js, and Node-backed APIs, but we match the stack to your hosting, compliance, and team preferences. Mobile work spans native and cross-platform where it makes sense.",
      },
      {
        question: "How do you price web and marketing retainers?",
        answer:
          "Fixed-scope builds are quoted as milestones. Ongoing SEO, ads, or content programs are scoped as monthly retainers with KPIs and a clear change-request path for out-of-scope work.",
      },
      {
        question: "How will I track progress?",
        answer:
          "You get milestone dates, demo environments, and access to our client portal for tasks and approvals—so stakeholders are not chasing status over email.",
      },
      {
        question: "Who owns the code and accounts when we launch?",
        answer:
          "By default, you own deliverables defined in the SOW, including repositories and production credentials we provision for you. Licensing for third-party themes or plugins follows vendor terms.",
      },
    ],
  },
  2: {
    displayName: "Business Setup & Legal",
    heroTagline:
      "US entity formation, motor carrier filings, and founder paperwork—organized, filed, and tracked with clear status updates.",
    metaTitle: "Business Setup & Legal Services | Alpha Solutions",
    metaDescription:
      "LLC registration, trucking company setup, DOT/MC applications, EIN, and business credit support. Fixed fees where possible. West Jordan, Utah.",
    faqs: [
      {
        question: "Which states do you support for LLC formation?",
        answer:
          "We routinely file in all 50 states and help you choose a formation state aligned with your operating footprint, banking, and tax discussions with your CPA.",
      },
      {
        question: "What is included in a trucking company setup package?",
        answer:
          "Packages typically bundle entity formation, EIN guidance, DOT/MC application preparation, and a checklist for insurance and BOC-3—exact steps depend on your operating mode and state rules.",
      },
      {
        question: "Can you guarantee FMCSA approval timelines?",
        answer:
          "Government processing times vary. We control submission quality and follow-ups; we do not control agency queues. You receive filing receipts and status notes as they change.",
      },
      {
        question: "Do you provide legal advice?",
        answer:
          "We prepare filings and operational checklists. Legal interpretation and tax positions should be confirmed with your attorney and CPA—we coordinate with them when you authorize it.",
      },
      {
        question: "How are fees structured?",
        answer:
          "Many filings are flat-fee where scope is predictable. Multi-step programs are quoted as a package with explicit inclusions and government fees passed through at cost unless bundled.",
      },
    ],
  },
  3: {
    displayName: "SaaS & Software Products",
    heroTagline:
      "Subscription products, internal tools, and vertical SaaS—designed for reliability, billing reality, and a roadmap you can defend to investors or ops.",
    metaTitle: "SaaS & Software Products | Alpha Solutions",
    metaDescription:
      "Custom SaaS development, POS, dispatch tools, and trucking lead products. Milestone delivery, staging environments, and handoff documentation. Get a scoped quote.",
    faqs: [
      {
        question: "Can you integrate payments and subscriptions?",
        answer:
          "Yes—Payoneer, Wise, Zelle, and similar providers are common. We map plans, trials, webhooks, and admin tooling so finance and support are not fighting spreadsheets.",
      },
      {
        question: "Do you build multi-tenant SaaS?",
        answer:
          "We design tenancy, roles, and data isolation up front. The exact model (shared schema vs. siloed) depends on compliance, scale, and your roadmap.",
      },
      {
        question: "What does a typical MVP timeline look like?",
        answer:
          "After discovery, many MVPs land between several weeks and a few months depending on integrations, auth model, and billing complexity. You receive a milestone plan before kickoff.",
      },
      {
        question: "Who maintains production after launch?",
        answer:
          "We offer maintenance windows or can hand off to your team with runbooks. SLAs and on-call coverage are optional add-ons scoped to your risk profile.",
      },
      {
        question: "Can you white-label for partners?",
        answer:
          "Yes. Branding, tenant provisioning, and reseller economics can be part of the architecture when you need a partner program—not just a single customer instance.",
      },
    ],
  },
  4: {
    displayName: "AI & Automation",
    heroTagline:
      "Chatbots, voice agents, and workflow automation that reduce handle time—without hiding humans where judgment matters.",
    metaTitle: "AI & Automation Services | Alpha Solutions",
    metaDescription:
      "AI chatbots, WhatsApp automation, voice agents, and Zapier/Make workflows. Guardrails, logging, and handoff to humans. Utah-based delivery with 24/7-friendly coverage options.",
    faqs: [
      {
        question: "Will an AI bot replace my staff?",
        answer:
          "Effective automation handles repetitive intake and routing so your team focuses on exceptions. We design escalation paths so revenue-critical conversations still reach people.",
      },
      {
        question: "How do you handle data privacy?",
        answer:
          "We map what data flows to models and third parties, minimize retention, and align prompts and logging with your policies. Formal DPAs follow your legal requirements.",
      },
      {
        question: "Which channels can you automate?",
        answer:
          "Common channels include web chat, WhatsApp, email sequences, and social DMs. Voice agents are available where telephony and compliance requirements are clear.",
      },
      {
        question: "What does tuning after launch involve?",
        answer:
          "We review transcripts or logs (within policy), adjust prompts and tools, and add guardrails as real users surface edge cases—typically as a short post-launch window.",
      },
      {
        question: "Can this connect to my CRM or dispatch tools?",
        answer:
          "Yes. Integrations are scoped during discovery—APIs, webhooks, or middleware like Zapier/Make depending on reliability needs and your existing stack.",
      },
    ],
  },
};

export function buildPillarMetadata(id: PillarPageId): Metadata {
  const copy = PILLAR_LANDING_COPY[id];
  const slug = PILLARS[id].slug;
  const canonical = `${SITE_URL}/services/${slug}`;
  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      url: canonical,
      type: "website",
    },
  };
}

export function breadcrumbListJsonLd(
  id: PillarPageId
): Record<string, unknown> {
  const slug = PILLARS[id].slug;
  const name = PILLAR_LANDING_COPY[id].displayName;
  const pageUrl = `${SITE_URL}/services/${slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${SITE_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: `${SITE_URL}/services`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name,
        item: pageUrl,
      },
    ],
  };
}
