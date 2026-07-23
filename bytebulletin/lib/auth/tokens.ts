import { prisma } from "@/lib/db/prisma";

/**
 * Generates a 6-digit numeric OTP and a unique UUID token stored in VerificationToken table.
 * Embeds pending user registration details (name & hashedPassword) so user table is only populated upon verification.
 */
export async function generateVerificationToken(
  email: string,
  name?: string | null,
  hashedPassword?: string | null
) {
  // Generate a random 6-digit OTP (e.g. 849201)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Generate a random unique token string for 1-click URL verification
  const token = `${crypto.randomUUID()}-${Date.now()}`;
  
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour expiration

  // Delete existing verification tokens for this email if any
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Format token as `${token}:${otp}:${encodedName}:${hashedPassword}`
  const encodedName = name ? encodeURIComponent(name) : "";
  const pwd = hashedPassword || "";
  const combinedToken = `${token}:${otp}:${encodedName}:${pwd}`;

  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: combinedToken,
      expires,
    },
  });

  return {
    email,
    token,
    otp,
    expires: verificationToken.expires,
  };
}

/**
 * Validates an OTP or Token for an email and returns embedded pending user data if valid.
 */
export async function validateVerificationToken(email: string, codeOrToken: string) {
  const existingTokens = await prisma.verificationToken.findMany({
    where: { identifier: email },
  });

  if (!existingTokens || existingTokens.length === 0) {
    return { valid: false, error: "No verification request found for this email" };
  }

  const tokenRecord = existingTokens[0];

  // Check expiration
  if (new Date() > new Date(tokenRecord.expires)) {
    await prisma.verificationToken.delete({ where: { token: tokenRecord.token } });
    return { valid: false, error: "Verification code has expired. Please request a new one." };
  }

  // Token format: `${token}:${otp}:${encodedName}:${hashedPassword}`
  const [storedToken, storedOtp, encodedName, storedHashedPassword] = tokenRecord.token.split(":");

  const isMatch = codeOrToken === storedOtp || codeOrToken === storedToken;

  if (!isMatch) {
    return { valid: false, error: "Invalid verification code" };
  }

  const name = encodedName ? decodeURIComponent(encodedName) : null;
  const hashedPassword = storedHashedPassword || null;

  // Delete token after successful match
  await prisma.verificationToken.delete({ where: { token: tokenRecord.token } });

  return {
    valid: true,
    email,
    name,
    hashedPassword,
  };
}

/**
 * Generates a unique 64-character password reset token stored in PasswordResetToken table.
 * Uses Raw SQL fallback to be 100% resilient during dev server HMR cache states.
 */
export async function generatePasswordResetToken(email: string) {
  const token = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

  try {
    if ((prisma as any).passwordResetToken) {
      await (prisma as any).passwordResetToken.deleteMany({ where: { email } });
      return await (prisma as any).passwordResetToken.create({
        data: { email, token, expires },
      });
    }
  } catch (e) {
    console.warn("[Prisma Model Fallback to Raw SQL for generatePasswordResetToken]");
  }

  // Direct Raw SQL Fallback (100% resilient across Webpack/Node memory cache)
  const id = `token_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  await prisma.$executeRawUnsafe(
    `DELETE FROM "password_reset_tokens" WHERE "email" = $1`,
    email
  );
  await prisma.$executeRawUnsafe(
    `INSERT INTO "password_reset_tokens" ("id", "email", "token", "expires", "createdAt") VALUES ($1, $2, $3, $4, $5)`,
    id,
    email,
    token,
    expires,
    new Date()
  );

  return { id, email, token, expires };
}

/**
 * Validates a password reset token and returns the token record if valid.
 */
export async function validatePasswordResetToken(token: string) {
  let passwordResetToken: any = null;

  try {
    if ((prisma as any).passwordResetToken) {
      passwordResetToken = await (prisma as any).passwordResetToken.findUnique({
        where: { token },
      });
    }
  } catch (e) {
    console.warn("[Prisma Model Fallback to Raw SQL for validatePasswordResetToken]");
  }

  if (!passwordResetToken) {
    const records: any[] = await prisma.$queryRawUnsafe(
      `SELECT "id", "email", "token", "expires" FROM "password_reset_tokens" WHERE "token" = $1 LIMIT 1`,
      token
    );
    passwordResetToken = records[0] || null;
  }

  if (!passwordResetToken) {
    return { valid: false, error: "Invalid or expired reset link" };
  }

  if (new Date() > new Date(passwordResetToken.expires)) {
    try {
      if ((prisma as any).passwordResetToken) {
        await (prisma as any).passwordResetToken.delete({ where: { id: passwordResetToken.id } });
      } else {
        await prisma.$executeRawUnsafe(`DELETE FROM "password_reset_tokens" WHERE "id" = $1`, passwordResetToken.id);
      }
    } catch (e) {
      await prisma.$executeRawUnsafe(`DELETE FROM "password_reset_tokens" WHERE "id" = $1`, passwordResetToken.id);
    }
    return { valid: false, error: "Reset link has expired. Please request a new one." };
  }

  return { valid: true, passwordResetToken };
}
