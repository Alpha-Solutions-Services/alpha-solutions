import type { Metadata } from "next";
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
    images: [
      {
        url: absoluteUrl("/og/default.png"),
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${title}`,
    description,
    images: [absoluteUrl("/og/default.png")],
  },
  robots: { index: true, follow: true },
  authors: [{ name: COMPANY.name, url: absoluteUrl("/about") }],
};

export default async function HomePage() {
  const featuredRaw = await getFeaturedProjects<FeaturedSanityDoc>();
  const featuredProjects = mapFeaturedProjectsForHome(featuredRaw);

  return <HomePageClient featuredProjects={featuredProjects} />;
}
