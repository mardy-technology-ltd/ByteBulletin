
import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/types/user";

// ─────────────────────────────────────────────────────────────
// Edge-compatible Auth Config
// Used by middleware to decode JWT without loading Node.js APIs (like pg/Prisma)
// ─────────────────────────────────────────────────────────────

export const edgeAuthConfig: NextAuthConfig = {
  providers: [], // Providers are loaded in the Node environment (config.ts)
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // Embed role into JWT
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    // Expose role in session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
};
