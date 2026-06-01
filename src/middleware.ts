import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { roleGroups } from "./lib/permissions";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const role = token?.role as string;

    // CUSTOMER should be blocked from ALL internal routes, map to correct portal pages
    if (role === "CUSTOMER") {
      if (path.startsWith("/tickets")) {
        return NextResponse.redirect(new URL("/portal/tickets", req.url));
      }
      if (path.startsWith("/settings")) {
        return NextResponse.redirect(new URL("/portal/settings", req.url));
      }
      if (path.startsWith("/knowledge-base")) {
        return NextResponse.redirect(new URL("/portal/knowledge-base", req.url));
      }
      
      const blockedRoutes = [
        "/dashboard",
        "/alerts",
        "/remote-support",
        "/security",
        "/ai-assistant",
        "/admin",
        "/users",
        "/audit",
        "/monitoring",
        "/live-support",
        "/technician"
      ];

      if (blockedRoutes.some(route => path.startsWith(route))) {
        return NextResponse.redirect(new URL("/portal", req.url));
      }
    }

    // Role-based access control for internal users
    if (path.startsWith("/monitoring") && !(roleGroups.technical as string[]).includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/users") && !(roleGroups.admin as string[]).includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/security") && !(roleGroups.admin as string[]).includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    if (path.startsWith("/admin") && !(roleGroups.admin as string[]).includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    // Protect technician specific routes
    if ((path.startsWith("/technician") || path.startsWith("/remote-support")) && !(roleGroups.technical as string[]).includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/ai-assistant/:path*",
    "/tickets/:path*",
    "/knowledge-base/:path*",
    "/monitoring/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/live-support/:path*",
    "/technician/:path*",
    "/alerts/:path*",
    "/remote-support/:path*",
    "/security/:path*",
    "/admin/:path*",
    "/audit/:path*",
  ],
};
