import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Proxy — Auth Foundation (Next.js 16)
 *
 * /app requires any authenticated session.
 * /support/agent requires an authenticated session AND a staff role (non-staff -> /portal).
 * /admin requires an authenticated session AND the ADMINISTRATOR role (anyone else -> /unauthorized).
 * /portal (customer portal) requires any authenticated session; staff -> /support/agent.
 * /support (legacy customer route) bounces everyone to their real home (/support/agent or /portal).
 * Public pages (/, /login, /unauthorized) remain accessible without a session.
 */
const STAFF_ROLES = new Set([
  "ADMINISTRATOR",
  "SUPPORT_AGENT",
  "TECHNICIAN",
  "TEAM_LEADER",
  "CLOUD_ENGINEER",
]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const isStaff = STAFF_ROLES.has(token.role as string);

  if (pathname.startsWith("/admin")) {
    if (token.role !== "ADMINISTRATOR") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  } else if (pathname.startsWith("/support/agent")) {
    if (!isStaff) {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  } else if (pathname.startsWith("/portal")) {
    if (isStaff) {
      return NextResponse.redirect(new URL("/support/agent", request.url));
    }
  } else if (pathname.startsWith("/support")) {
    return NextResponse.redirect(new URL(isStaff ? "/support/agent" : "/portal", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/support/:path*", "/portal/:path*", "/admin/:path*"],
};
