import {
  createClient as sanityCreateClient,
  type SanityClient,
} from "@sanity/client";

const DEFAULT_PROJECT_ID = "lx58x5y4";
const DATASET = "production";
const API_VERSION = "2024-01-01";

export type SanityClientOptions = {
  /** When true, disables CDN for fresher reads (e.g. draft/preview). */
  preview?: boolean;
};

/**
 * Sanity client for server-side fetches.
 * - Public pages: `useCdn: true` (default)
 * - Preview/draft: pass `{ preview: true }` → `useCdn: false`
 */
export function createClient(
  options?: SanityClientOptions
): SanityClient | null {
  const projectId =
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || DEFAULT_PROJECT_ID;
  if (!projectId) return null;

  return sanityCreateClient({
    projectId,
    dataset: DATASET,
    apiVersion: API_VERSION,
    useCdn: options?.preview ? false : true,
  });
}

/**
 * Read-only client for ISR / static generation (CDN on).
 * @deprecated Prefer `createClient()`; kept for existing call sites.
 */
export function getSanityReadClient(): SanityClient | null {
  return createClient({ preview: false });
}
