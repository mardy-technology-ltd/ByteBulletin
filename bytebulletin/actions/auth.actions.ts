"use server";

import { signIn, signOut } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/lib/validations/auth.schema";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import {
  generateVerificationToken,
  validateVerificationToken,
  generatePasswordResetToken,
  validatePasswordResetToken,
} from "@/lib/auth/tokens";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email/resend";

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
 * Checks account existence and sends password reset link via Resend API
 */
export async function sendPasswordResetLinkAction(email: string) {
  try {
    if (!email || !email.includes("@")) {
      return { success: false, error: "Please enter a valid email address." };
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return {
        success: false,
        error: "No account found with this email address. Please check your email or sign up.",
      };
    }

    const { token } = await generatePasswordResetToken(normalizedEmail);
    const emailResult = await sendPasswordResetEmail(normalizedEmail, token);

    if (!emailResult.success) {
      console.warn("[Password Reset Link Email Warning]:", emailResult.error);
    }

    return {
      success: true,
      message: "We have sent a password reset link to your email address.",
    };
  } catch (error: any) {
    console.error("[Password Reset Link Exception]:", error?.message || error);
    return { success: false, error: error?.message || "Failed to send password reset email. Please try again." };
  }
}

/**
 * Resets user password after token validation
 */
export async function resetPasswordAction(token: string, newPassword: string) {
  try {
    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long." };
    }

    const validation = await validatePasswordResetToken(token);
    if (!validation.valid || !validation.passwordResetToken) {
      return { success: false, error: validation.error || "Invalid or expired reset token." };
    }

    const { email, id } = validation.passwordResetToken;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password in DB
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete token after successful use (Resilient Raw SQL Fallback)
    try {
      if ((prisma as any).passwordResetToken) {
        await (prisma as any).passwordResetToken.delete({ where: { id } });
      } else {
        await prisma.$executeRawUnsafe(`DELETE FROM "password_reset_tokens" WHERE "id" = $1`, id);
      }
    } catch (e) {
      await prisma.$executeRawUnsafe(`DELETE FROM "password_reset_tokens" WHERE "id" = $1`, id);
    }

    return {
      success: true,
      message: "Your password has been reset successfully! You can now log in.",
    };
  } catch (error: any) {
    console.error("Reset Password Action Error:", error?.message || error);
    return { success: false, error: error?.message || "Failed to reset password. Please try again." };
  }
}

/**
 * Signs the user out
 */
export async function logoutUser() {
  await signOut();
}
