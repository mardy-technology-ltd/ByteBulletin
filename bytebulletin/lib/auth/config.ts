import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import { loginSchema } from "@/lib/validations/auth.schema";

import bcrypt from "bcryptjs";

// ─────────────────────────────────────────────────────────────
// Auth.js v5 Configuration
// Supports: Google OAuth + Email/Password (Credentials)
// ─────────────────────────────────────────────────────────────

import { edgeAuthConfig } from "./middleware-config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...edgeAuthConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate input shape
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // Lookup user
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, image: true, role: true, password: true },
        });

        if (!user || !user.password) return null;

        // Verify password
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  events: {
    // Create default preferences when a new user signs up via OAuth
    async createUser({ user }) {
      await prisma.userPreference.create({
        data: { userId: user.id! },
      });
    },
  },
});
