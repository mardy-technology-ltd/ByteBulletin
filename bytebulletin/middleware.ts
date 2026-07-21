import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ─────────────────────────────────────────────────────────────
// Middleware — Auth Guard + Route Protection (Edge Compatible)
// ─────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.AUTH_SECRET 
  });
  
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!token;
  const isAdmin = token?.role === "ADMIN";

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Authenticated user routes
  if (pathname.startsWith("/bookmarks") || pathname.startsWith("/profile")) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
      );
    }
  }

  // Redirect already-authenticated users away from auth pages
  if (
    isAuthenticated &&
    (pathname.startsWith("/login") || pathname.startsWith("/register"))
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
