/**
 * Auth.js helper functions for server components and server actions.
 */
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import type { SessionUser } from "@/types/user";

/**
 * Returns the current session user or null.
 * Safe to call from Server Components and Server Actions.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as SessionUser;
}

/**
 * Requires authentication — redirects to /login if not authenticated.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Requires admin role — redirects to home if not admin.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}
