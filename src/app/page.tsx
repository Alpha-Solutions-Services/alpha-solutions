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

  return <HomePageClient featuredProjects={featuredProjects} />;
}
