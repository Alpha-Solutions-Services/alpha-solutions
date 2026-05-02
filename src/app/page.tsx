import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { absoluteUrl, COMPANY, SITE_NAME } from "@/data/site";
import {
  mapFeaturedProjectsForHome,
  type FeaturedSanityDoc,
} from "@/lib/sanity/featured-home";
import { getFeaturedProjects } from "@/lib/sanity/queries";
import HomePageClient from "./HomePageClient";

const title = "Web Development, SaaS & AI Automation | Utah & Global";
const description =
  "Alpha Solutions Services LLC builds custom websites, mobile apps, SaaS, and AI automation. US-registered company in West Jordan, Utah with transparent delivery and client portal access.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "web development Utah",
    "custom software development",
    "SaaS development company",
    "AI automation agency",
    "Next.js development",
    "West Jordan web developer",
    "Alpha Solutions Services LLC",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} — ${title}`,
    description,
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [{ url: absoluteUrl("/alpha-logo.png") }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${title}`,
    description,
    images: [absoluteUrl("/alpha-logo.png")],
  },
  robots: { index: true, follow: true },
  authors: [{ name: COMPANY.name, url: absoluteUrl("/about") }],
};

type HomePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const oauthCode = searchParams?.code;
  const code =
    typeof oauthCode === "string" ? oauthCode : oauthCode?.[0] ?? null;
  if (code) {
    const qp = new URLSearchParams();
    qp.set("code", code);

    const nextParam = searchParams?.next;
    const next =
      typeof nextParam === "string"
        ? nextParam
        : nextParam?.[0] ?? "/portal/dashboard";
    if (next.startsWith("/") && !next.startsWith("//")) {
      qp.set("next", next);
    }

    const stateParam = searchParams?.state;
    const state = typeof stateParam === "string" ? stateParam : stateParam?.[0];
    if (state) qp.set("state", state);

    redirect(`/auth/callback?${qp.toString()}`);
  }

  const featuredRaw = await getFeaturedProjects<FeaturedSanityDoc>();
  const featuredProjects = mapFeaturedProjectsForHome(featuredRaw);

  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Alpha Solutions Services LLC",
    url: "https://www.alphasolutions.software",
    logo: "https://www.alphasolutions.software/alpha-logo.png",
    foundingDate: "2025",
    founder: {
      "@type": "Person",
      name: "Muhammad Mikran Sandhu",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "7533 S Center View Ct Ste R",
      addressLocality: "West Jordan",
      addressRegion: "UT",
      postalCode: "84084",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+923494206922",
      contactType: "customer service",
      availableLanguage: ["English", "Urdu"],
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "3",
      bestRating: "5",
    },
    sameAs: [
      "https://clutch.co/profile/alpha-solutions-services",
      "https://www.linkedin.com/company/alpha-solutions-by-alpha-group/",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchema) }}
      />
      <HomePageClient featuredProjects={featuredProjects} />
    </>
  );
}
