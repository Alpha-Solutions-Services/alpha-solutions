import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DM_Sans, Sora } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PageViewReporter } from "@/components/analytics/PageViewReporter";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SiteThunderBackdrop } from "@/components/layout/SiteThunderBackdrop";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";
import {
  SITE_BRAND_SHORT,
  SITE_URL,
  absoluteUrl,
  DEFAULT_OG_IMAGE_PATH,
} from "@/data/site";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
});

const gaId = process.env.NEXT_PUBLIC_GA_ID;
const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  manifest: "/site.webmanifest",
  title: {
    default: `${SITE_BRAND_SHORT} — Web Design & Digital Services`,
    template: `%s | ${SITE_BRAND_SHORT}`,
  },
  description:
    "Alpha Solutions offers web design, development, digital strategy, and freight dispatching services.",
  keywords: [
    "web design",
    "digital services",
    "freight dispatching",
    "load management",
    "carrier services",
  ],
  authors: [{ name: SITE_BRAND_SHORT }],
  creator: SITE_BRAND_SHORT,
  applicationName: SITE_BRAND_SHORT,
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_BRAND_SHORT,
    title: `${SITE_BRAND_SHORT} — Web Design & Digital Services`,
    description:
      "Web design, development, digital strategy, and freight management.",
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
        width: 1200,
        height: 630,
        alt: SITE_BRAND_SHORT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_BRAND_SHORT,
    description: "Web design, development, and freight management.",
    images: [absoluteUrl(DEFAULT_OG_IMAGE_PATH)],
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    shortcut: "/favicon.ico",
    apple: [{ url: "/icon.png", type: "image/png" }],
  },
  verification: {
    google: "FghTckB5AES0bTVY4EoPL5FS1Fzi9yJI7yJFSG3hteI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable}`}>
      <head>
        <link rel="icon" href="/icon.png" type="image/png" sizes="512x512" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <link rel="preload" as="image" href="/hero.webp" />
        <link rel="preconnect" href="https://lx58x5y4.supabase.co" crossOrigin="" />
      </head>
      {gtmId ? (
        <Script id="gtm-init" strategy="lazyOnload">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${gtmId}');
          `}
        </Script>
      ) : null}
      <body className="antialiased">
        <SchemaMarkup />
        <Navbar />
        <PageViewReporter />
        {children}
        <Footer />
        <SiteThunderBackdrop />
        <Analytics />
        <SpeedInsights />
        {gaId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="lazyOnload"
            />
            <Script id="ga4-init" strategy="lazyOnload">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
        <Script
          src="https://cdn.jotfor.ms/agent/embedjs/0199af64e03b79129c515648cde5ca8cd8a0/embed.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
