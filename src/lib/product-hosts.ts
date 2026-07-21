/**
 * External product hosts — marketing site (alphasolutions.software) links out;
 * portals no longer run on the apex / www marketing app.
 */
export const PORTAL_URL = "https://portal.alphasolutions.software";
export const TMS_URL = "https://tms.alphasolutions.software";
export const LEARN_DISPATCH_URL = "https://learndispatch.alphasolutions.software";

export function portalHref(path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${PORTAL_URL}${p === "/" ? "/" : p}`;
}

export function tmsHref(path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${TMS_URL}${p === "/" ? "/" : p}`;
}

export function learnDispatchHref(path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${LEARN_DISPATCH_URL}${p === "/" ? "/" : p}`;
}

/** Legacy in-app portal path prefixes (now redirected off the marketing site). */
export const APP_PORTAL_PREFIXES = [
  "/portal",
  "/admin",
  "/freight/login",
  "/freight/dispatcher",
  "/freight/carrier",
  "/freight/driver",
  "/freight/student",
  "/freight/instructor",
  "/freight/dispatch-training",
] as const;

export function isAppPortalPath(pathname: string): boolean {
  return APP_PORTAL_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Map legacy marketing-site portal paths to the correct product host.
 * Returns null for paths that stay on the marketing site (e.g. /freight landing).
 */
export function resolveExternalProductRedirect(pathname: string): string | null {
  const path = pathname.split("?")[0] || "/";

  if (path === "/portal" || path === "/portal/") {
    return `${PORTAL_URL}/login`;
  }
  if (path.startsWith("/portal/")) {
    return `${PORTAL_URL}${path.slice("/portal".length)}`;
  }

  if (path === "/admin" || path === "/admin/") {
    return `${PORTAL_URL}/admin`;
  }
  if (path === "/admin/login" || path.startsWith("/admin/login/")) {
    return `${PORTAL_URL}/login?role=admin`;
  }
  if (path.startsWith("/admin/")) {
    return `${PORTAL_URL}/admin`;
  }

  // Dispatch learning / academy
  if (
    path === "/freight/dispatch-training" ||
    path.startsWith("/freight/dispatch-training/") ||
    path === "/freight/student" ||
    path.startsWith("/freight/student/") ||
    path === "/freight/instructor" ||
    path.startsWith("/freight/instructor/")
  ) {
    const rest =
      path.startsWith("/freight/student")
        ? path.slice("/freight/student".length) || "/"
        : path.startsWith("/freight/instructor")
          ? path.slice("/freight/instructor".length) || "/"
          : path.startsWith("/freight/dispatch-training")
            ? path.slice("/freight/dispatch-training".length) || "/"
            : "/";
    return `${LEARN_DISPATCH_URL}${rest === "/" ? "/" : rest}`;
  }

  // Freight ops portals (TMS)
  if (
    path === "/freight/login" ||
    path.startsWith("/freight/login/") ||
    path === "/freight/dispatcher" ||
    path.startsWith("/freight/dispatcher/") ||
    path === "/freight/carrier" ||
    path.startsWith("/freight/carrier/") ||
    path === "/freight/driver" ||
    path.startsWith("/freight/driver/")
  ) {
    if (path === "/freight/login" || path.startsWith("/freight/login/")) {
      return `${TMS_URL}/`;
    }
    const rest = path.slice("/freight".length) || "/";
    return `${TMS_URL}${rest}`;
  }

  return null;
}
