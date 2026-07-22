"use server";

import { signIn, signOut } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/lib/validations/auth.schema";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { generateVerificationToken, validateVerificationToken } from "@/lib/auth/tokens";
import { sendVerificationEmail } from "@/lib/email/resend";

/**
 * Handles user sign in via Credentials provider
 */
export async function loginUser(data: LoginInput) {
  try {
    const parsed = loginSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid credentials format" };
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: { id: true, role: true, emailVerified: true, name: true }
    });

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    // Check if user email is verified
    if (!user.emailVerified) {
      // Re-generate OTP and resend
      const { token, otp } = await generateVerificationToken(parsed.data.email);
      await sendVerificationEmail(parsed.data.email, user.name, token, otp);

      return {
        success: false,
        requiresVerification: true,
        email: parsed.data.email,
        error: "Your email is not verified yet. We have sent a new OTP to your email."
      };
    }

    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    return { success: true, role: user.role || "USER" };
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
 * Registers a new user and sends an OTP verification email via Resend
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
      if (existingUser.emailVerified) {
        return { success: false, error: "Email is already registered. Please sign in." };
      }
      
      // If user registered before but hasn't verified yet, update password/name and resend OTP
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { email },
        data: {
          name: name || existingUser.name,
          password: hashedPassword,
        },
      });

      const { token, otp } = await generateVerificationToken(email);
      await sendVerificationEmail(email, name, token, otp);

      return {
        success: true,
        requiresVerification: true,
        email: existingUser.email,
        userId: existingUser.id,
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: null, // Requires OTP verification
        preferences: {
          create: {}, // Create default preferences
        }
      },
    });

    // Generate token & 6-digit OTP
    const { token, otp } = await generateVerificationToken(email);

    // Send email via Resend
    await sendVerificationEmail(email, name, token, otp);

    return {
      success: true,
      requiresVerification: true,
      email: user.email,
      userId: user.id
    };
  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, error: "Failed to create account" };
  }
}

/**
 * Verifies user email with 6-digit OTP or token
 */
export async function verifyEmailAction(email: string, codeOrToken: string) {
  try {
    const validation = await validateVerificationToken(email, codeOrToken);

    if (!validation.valid) {
      return { success: false, error: validation.error || "Verification failed" };
    }

    // Update user record emailVerified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    return { success: true, message: "Email verified successfully! You can now log in." };
  } catch (error) {
    console.error("Email Verification Error:", error);
    return { success: false, error: "Failed to verify email" };
  }
}

/**
 * Resends a new OTP to the specified email
 */
export async function resendVerificationOtpAction(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, error: "No user found with this email" };
    }

    if (user.emailVerified) {
      return { success: false, error: "This email is already verified. You can log in." };
    }

    const { token, otp } = await generateVerificationToken(email);
    await sendVerificationEmail(email, user.name, token, otp);

    return { success: true, message: "A new OTP code has been sent to your email." };
  } catch (error) {
    console.error("Resend OTP Error:", error);
    return { success: false, error: "Failed to resend verification code" };
  }
}

/**
 * Signs the user out
 */
export async function logoutUser() {
  await signOut();
}
