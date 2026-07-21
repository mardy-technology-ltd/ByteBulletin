import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ─────────────────────────────────────────────────────────────
// Middleware — Auth Guard + Route Protection (Fault-Tolerant Edge)
// ─────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  let token = null;

  try {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (secret) {
      token = await getToken({ 
        req, 
        secret,
        // Support both NextAuth v4 and Auth.js v5 cookie names
        cookieName: req.cookies.has("__Secure-authjs.session-token")
          ? "__Secure-authjs.session-token"
          : req.cookies.has("authjs.session-token")
          ? "authjs.session-token"
          : req.cookies.has("__Secure-next-auth.session-token")
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      });
    }
  } catch (error) {
    console.error("[Middleware Error]:", error);
  }
  
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
