import { prisma } from "@/lib/db/prisma";

/**
 * Generates a 6-digit numeric OTP and a unique UUID token stored in VerificationToken table.
 * Token expires in 1 hour.
 */
export async function generateVerificationToken(email: string) {
  // Generate a random 6-digit OTP (e.g. 849201)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Generate a random unique token string for 1-click URL verification
  const token = `${crypto.randomUUID()}-${Date.now()}`;
  
  const expires = new Date(Date.now() + 3600 * 1000); // 1 hour expiration

  // Delete existing verification tokens for this email if any
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  // Store token with OTP embedded in identifier or identifier = email, token = token:otp
  // We format token as `${token}:${otp}` so we can verify either 1-click link or 6-digit OTP
  const combinedToken = `${token}:${otp}`;

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
 * Validates an OTP or Token for an email.
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

  // Token is stored as `${token}:${otp}`
  const [storedToken, storedOtp] = tokenRecord.token.split(":");

  const isMatch = codeOrToken === storedOtp || codeOrToken === storedToken;

  if (!isMatch) {
    return { valid: false, error: "Invalid verification code" };
  }

  // Delete token after successful match
  await prisma.verificationToken.delete({ where: { token: tokenRecord.token } });

  return { valid: true };
}
