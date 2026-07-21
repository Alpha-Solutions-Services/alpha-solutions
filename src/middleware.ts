import { NextResponse, type NextRequest } from "next/server";
import { resolveExternalProductRedirect } from "@/lib/product-hosts";

/**
 * Marketing site middleware.
 * Client Portal → portal.alphasolutions.software
 * Freight Portal → tms.alphasolutions.software
 * Dispatch Learning → learndispatch.alphasolutions.software
 * Apex / www stays marketing-only.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const external = resolveExternalProductRedirect(pathname);
  if (external) {
    const dest = new URL(external);
    request.nextUrl.searchParams.forEach((value, key) => {
      if (!dest.searchParams.has(key)) dest.searchParams.set(key, value);
    });
    return NextResponse.redirect(dest, 308);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/portal",
    "/portal/:path*",
    "/admin",
    "/admin/:path*",
    "/freight/login",
    "/freight/login/:path*",
    "/freight/dispatcher",
    "/freight/dispatcher/:path*",
    "/freight/carrier",
    "/freight/carrier/:path*",
    "/freight/driver",
    "/freight/driver/:path*",
    "/freight/student",
    "/freight/student/:path*",
    "/freight/instructor",
    "/freight/instructor/:path*",
    "/freight/dispatch-training",
    "/freight/dispatch-training/:path*",
  ],
};
