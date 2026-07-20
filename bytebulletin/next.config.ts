import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // ── Images ──────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Google avatars (OAuth)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // Common news image CDNs
      { protocol: "https", hostname: "**" },
    ],
    minimumCacheTTL: 3600, // 1 hour
  },

  // ── Security Headers ─────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      // No-index for admin routes
      {
        source: "/admin(.*)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },

  // ── Redirects ────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/dashboard",
        permanent: false,
      },
    ];
  },

  // ── Experimental ─────────────────────────────────────────────
  experimental: {
    // Server Actions are stable in Next.js 15
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // ── TypeScript / ESLint ───────────────────────────────────────
  typescript: {
    ignoreBuildErrors: false,
  },


  // ── Logging ───────────────────────────────────────────────────
  logging: {
    fetches: {
      fullUrl: process.env.NODE_ENV === "development",
    },
  },
};

export default withBundleAnalyzer(nextConfig);
