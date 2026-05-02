import imageUrlBuilder, { type SanityImageSource } from "@sanity/image-url";
import { createClient } from "./client";

/**
 * Builds a CDN URL for a Sanity image field. Returns null if misconfigured.
 */
export function urlForImage(
  source: SanityImageSource | null | undefined,
  width?: number
): string | null {
  if (!source) return null;
  const client = createClient();
  if (!client) return null;
  let b = imageUrlBuilder(client).image(source).auto("format");
  if (width) b = b.width(width);
  return b.url();
}
