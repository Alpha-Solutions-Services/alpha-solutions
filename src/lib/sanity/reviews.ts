import type { SanityImageSource } from "@sanity/image-url";
import { urlForImage } from "@/lib/sanity/image";

export type HomeTestimonial = {
  _id: string;
  quote: string;
  name: string;
  title: string;
  location: string;
  tag: string;
  rating: number;
  image: string | null;
};

export type SanityReviewDoc = {
  _id?: string;
  clientName?: string | null;
  companyName?: string | null;
  rating?: number | null;
  reviewText?: string | null;
  clientImage?: SanityImageSource | null;
  featured?: boolean | null;
  project?: { title?: string | null } | null;
  app?: { name?: string | null } | null;
};

/** Homepage can grow with CMS content; keep the section readable. */
export const HOME_REVIEW_LIMIT = 6;

export function mapReviewsForHome(raw: SanityReviewDoc[]): HomeTestimonial[] {
  return raw
    .filter((r) => r._id && (r.reviewText ?? "").trim())
    .slice(0, HOME_REVIEW_LIMIT)
    .map((r) => {
      const quote = String(r.reviewText).trim();
      const company = (r.companyName ?? "").trim();
      const projectTag = (r.project?.title ?? r.app?.name ?? "").trim();
      const isFeatured = r.featured === true;
      return {
        _id: String(r._id),
        quote: quote.length > 360 ? `${quote.slice(0, 357).trimEnd()}…` : quote,
        name: (r.clientName ?? "Client").trim() || "Client",
        title: company || "Client",
        location: "",
        tag: projectTag || (isFeatured ? "Featured review" : "Client review"),
        rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
        image: urlForImage(r.clientImage, 96),
      };
    });
}
