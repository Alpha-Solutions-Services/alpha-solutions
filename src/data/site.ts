/** Canonical site URL (no trailing slash). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.alphasolutions.software";

export const SITE_NAME = "Alpha Solutions Services LLC";

/** Primary Calendly booking (30 min). */
export const CALENDLY_BOOKING_URL =
  "https://calendly.com/alphaassistant-alpha/30min";

/** Default Open Graph / Twitter image (absolute URL). */
export const DEFAULT_OG_IMAGE_PATH = "/alpha-logo.png";

export function absoluteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

export const COMPANY = {
  name: SITE_NAME,
  email: "info@alphasolutions.software",
  phone: "+923494206922",
  phoneDisplay: "+92 349 420 6922",
  whatsappE164: "+923494206922",
  address: {
    streetAddress: "7533 S Center View Ct Ste R",
    addressLocality: "West Jordan",
    addressRegion: "UT",
    postalCode: "84084",
    addressCountry: "US",
  },
  /** Approximate geo for LocalBusiness (West Jordan, UT). */
  geo: {
    latitude: 40.6097,
    longitude: -112.0007,
  },
  logoUrl: absoluteUrl("/alpha-logo.png"),
  /** Clutch company widget id + public profile for sameAs / ratings. */
  clutchCompanyId: "2572379",
  clutchProfileUrl: "https://clutch.co/profile/alpha-solutions-services",
  aggregateRating: {
    ratingValue: 5,
    bestRating: 5,
    worstRating: 1,
    reviewCount: 12,
  },
  openingHours: [
    { dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "17:00" },
  ],
  sameAs: [
    "https://www.linkedin.com/company/alpha-solutions-by-alpha-group/",
    "https://x.com/alphasolution25",
    "https://github.com/Alpha-Solutions-Services-LLC",
    "https://www.instagram.com/alphasolutions.dev/",
    "https://www.facebook.com/profile.php?id=61576991455136",
    "https://www.youtube.com/@AlphaSolutionsServiceLLC",
    "https://clutch.co/profile/alpha-solutions-services",
  ],
} as const;
