import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ─────────────────────────────────────────────────────────────
// Pure Native Next.js Middleware (Zero External Dependencies)
// Prevents Vercel MIDDLEWARE_INVOCATION_FAILED errors
// ─────────────────────────────────────────────────────────────

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Check for presence of NextAuth / Auth.js session cookie
  const hasSessionCookie = 
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token") ||
    req.cookies.has("next-auth.session-token") ||
    req.cookies.has("__Secure-next-auth.session-token");

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    if (!hasSessionCookie) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // Protect user routes
  if (pathname.startsWith("/bookmarks") || pathname.startsWith("/profile")) {
    if (!hasSessionCookie) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, req.url)
      );
    }
  }

  // Redirect authenticated users away from auth pages
  if (hasSessionCookie && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
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
