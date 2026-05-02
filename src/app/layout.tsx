import type { Metadata } from "next";
import { DM_Sans, Sora } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { PageViewReporter } from "@/components/analytics/PageViewReporter";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { SiteThunderBackdrop } from "@/components/layout/SiteThunderBackdrop";
import { SchemaMarkup } from "@/components/shared/SchemaMarkup";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://alphasolutions.software"),
  title: {
    default: "Alpha Solutions Services LLC",
    template: "%s | Alpha Solutions Services LLC",
  },
  description:
    "Alpha Solutions Services LLC delivers web, SaaS, business setup, and AI automation solutions to help your company grow.",
  applicationName: "Alpha Solutions Services LLC",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://alphasolutions.software",
    siteName: "Alpha Solutions Services LLC",
    title: "Alpha Solutions Services LLC",
    description:
      "Web development, SaaS, business setup, and AI automation from Alpha Solutions Services LLC.",
  },
  icons: {
    icon: [{ url: "/alpha-logo.png" }],
    shortcut: ["/alpha-logo.png"],
    apple: ["/alpha-logo.png"],
  },
  verification: {
    google: "FghTckB5AES0bTVY4EoPL5FS1Fzi9yJI7yJFSG3hteI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${dmSans.variable}`}>
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
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
