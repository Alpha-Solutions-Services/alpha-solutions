import type { Metadata } from "next";
import { absoluteUrl, SITE_NAME } from "@/data/site";

const title = "Contact";
const description =
  "Contact Alpha Solutions Services LLC for web development, SaaS, AI automation, and business setup. Serving West Jordan Utah, the United States, and global clients. WhatsApp and email available.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "contact Alpha Solutions",
    "web development quote Utah",
    "hire software developer",
    "Alpha Solutions Services LLC contact",
    "West Jordan Utah software company",
    "AI automation agency USA",
    "SaaS development company Utah",
    "business setup services USA",
  ],
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `${title} | ${SITE_NAME}`,
    description,
    url: absoluteUrl("/contact"),
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: absoluteUrl("/og/default.png"), width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${SITE_NAME}`,
    description,
    images: [absoluteUrl("/og/default.png")],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
