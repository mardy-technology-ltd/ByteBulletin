"use server";

import { signIn, signOut } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/lib/validations/auth.schema";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

/**
 * Handles user sign in via Credentials provider
 */
export async function loginUser(data: LoginInput) {
  try {
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid credentials format" };
    }

    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { role: true }
    });

    return { success: true, role: user?.role || "USER" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" };
        default:
          return { success: false, error: "An error occurred during sign in" };
      }
    }
    throw error; // Rethrow Next.js redirects
  }
}

/**
 * Registers a new user and hashes their password
 */
export async function registerUser(data: RegisterInput) {
  try {
    const parsed = registerSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid registration data" };
    }

    const { email, password, name } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "Email is already registered" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        preferences: {
          create: {}, // Create default preferences
        }
      },
    });

    return { success: true, userId: user.id };
  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, error: "Failed to create account" };
  }
}

/**
 * Signs the user out
 */
export async function logoutUser() {
  await signOut();
}
