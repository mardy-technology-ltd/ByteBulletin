
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
    // Embed role and image into JWT
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.picture = user.image;
      }
      if (trigger === "update" && session?.image) {
        token.picture = session.image;
      }
      return token;
    },
    // Expose role & image in session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        if (token.picture) {
          session.user.image = token.picture as string;
        }
      }
      return session;
    },
  },
};
