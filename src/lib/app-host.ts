/**
 * Host helpers for the future app.alphasolutions.software subdomain.
 * Marketing stays on www / apex; portals can live on app.* with the same theme.
 */

export function isAppSubdomainHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const h = host.toLowerCase().split(":")[0];
  return (
    h === "app.alphasolutions.software" ||
    h === "app.localhost" ||
    h.startsWith("app.")
  );
}

/** Path prefixes that belong on the app subdomain when migrated. */
export const APP_PORTAL_PREFIXES = [
  "/portal",
  "/admin",
  "/freight/login",
  "/freight/dispatcher",
  "/freight/carrier",
  "/freight/driver",
  "/freight/student",
  "/freight/instructor",
] as const;

export function isAppPortalPath(pathname: string): boolean {
  return APP_PORTAL_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}
