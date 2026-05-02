import { getSanityReadClient } from "./client";

const SERVICE_BY_SLUG = `*[_type == "service" && slug.current == $slug][0]{
  title,
  "slug": slug.current,
  description,
  features,
  keyFeatures[]{ feature, description },
  pricing,
  technologies,
  metaTitle,
  metaDescription
}`;

export type SanityServiceRecord = {
  title: string | null;
  slug: string | null;
  description: string | null;
  features: string[] | null;
  keyFeatures: { feature: string | null; description: string | null }[] | null;
  pricing: string | null;
  technologies: string[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

/**
 * Extended copy from Sanity when a `service` document slug matches SERVICES[].slug.
 * Returns null if CMS is not configured, query fails, or no document exists.
 */
export async function fetchSanityServiceBySlug(
  slug: string
): Promise<SanityServiceRecord | null> {
  const client = getSanityReadClient();
  if (!client) return null;
  try {
    const doc = await client.fetch<SanityServiceRecord | null>(
      SERVICE_BY_SLUG,
      { slug }
    );
    return doc ?? null;
  } catch {
    return null;
  }
}

export function bulletsFromSanity(doc: SanityServiceRecord | null): string[] {
  if (!doc) return [];
  if (doc.features?.length) return doc.features.filter(Boolean);
  if (doc.keyFeatures?.length) {
    return doc.keyFeatures
      .map((k) => {
        const f = k.feature?.trim();
        if (!f) return "";
        const d = k.description?.trim();
        return d ? `${f}: ${d}` : f;
      })
      .filter(Boolean);
  }
  return [];
}
