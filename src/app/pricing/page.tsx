import type { Metadata } from "next";
import { absoluteUrl, DEFAULT_OG_IMAGE_PATH, SITE_URL } from "@/data/site";
import { PricingPageClient } from "./PricingPageClient";

const title = "Pricing";
const description =
  "Transparent USD pricing for web, business setup, SaaS, AI automation, and freight services. Browse every service with starting prices, timelines, and status—or choose Starter, Professional, or Enterprise website packages. No hidden fees.";

const keywords = [
  "Alpha Solutions pricing",
  "web development pricing",
  "transparent agency pricing",
  "SaaS development cost",
  "LLC registration price",
  "AI automation pricing",
  "monthly retainer vs one-time",
  "custom software quote",
  "Utah web development rates",
  "freight software pricing",
  "website packages",
  "Starter Professional Enterprise pricing",
];

export async function generateMetadata(): Promise<Metadata> {
  const canonical = `${SITE_URL}/pricing`;
  const ogImage = absoluteUrl(DEFAULT_OG_IMAGE_PATH);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: "/pricing" },
    openGraph: {
      title: `${title} | Alpha Solutions Services LLC`,
      description,
      url: canonical,
      siteName: "Alpha Solutions Services LLC",
      locale: "en_US",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "Alpha Solutions — pricing",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Alpha Solutions Services LLC`,
      description,
      images: [ogImage],
    },
  };
}

export default function PricingPage() {
  return <PricingPageClient />;
}
