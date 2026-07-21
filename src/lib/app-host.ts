/**
 * Product hosts (portals no longer run on the marketing apex / www).
 * Prefer `@/lib/product-hosts` for URLs.
 */
export {
  PORTAL_URL,
  TMS_URL,
  LEARN_DISPATCH_URL,
  portalHref,
  tmsHref,
  learnDispatchHref,
  resolveExternalProductRedirect,
  isAppPortalPath,
} from "@/lib/product-hosts";

export function isAppSubdomainHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const h = host.toLowerCase().split(":")[0];
  return (
    h === "portal.alphasolutions.software" ||
    h === "tms.alphasolutions.software" ||
    h === "learndispatch.alphasolutions.software" ||
    h === "app.alphasolutions.software" ||
    h === "app.localhost" ||
    h.startsWith("app.") ||
    h.startsWith("portal.") ||
    h.startsWith("tms.") ||
    h.startsWith("learndispatch.")
  );
}
