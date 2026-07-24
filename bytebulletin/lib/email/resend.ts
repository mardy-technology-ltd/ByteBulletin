import { Resend } from "resend";

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

export async function safeSendResendEmail(
  resend: Resend, 
  emailPayload: { to: string[]; subject: string; html: string }
) {
  // Primary attempt using custom official domain email
  let data = await resend.emails.send({
    from: "ByteBulletin <auth@mail.thebytebulletin.com>",
    ...emailPayload,
  });

  // Automatic fallback if custom domain verification is still pending on Resend
  if (data.error && (data.error.message?.includes("not verified") || data.error.name === "validation_error")) {
    console.warn("[Resend Domain Verification Pending]: Retrying delivery via fallback sender...");
    data = await resend.emails.send({
      from: "ByteBulletin <onboarding@resend.dev>",
      ...emailPayload,
    });
  }

  return data;
}

export async function sendVerificationEmail(
  email: string,
  name: string | null | undefined,
  token: string,
  otp: string
) {
  const domain = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${domain}/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
  const userName = name || "Tech Reader";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your ByteBulletin Account</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f0b1e; color: #f3f4f6; margin: 0; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #18142a; border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; font-weight: 800; margin: 0; tracking-tight: -0.05em;">
              ByteBulletin
            </h1>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 6px;">AI-Powered Tech News Platform</p>
          </div>

          <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-bottom: 16px;">
            Welcome, ${userName}! 👋
          </h2>

          <p style="color: #d1d5db; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Thank you for registering at ByteBulletin. Please verify your email address to activate your account and start saving articles.
          </p>

          <!-- OTP Code Box -->
          <div style="background: rgba(124, 58, 237, 0.12); border: 1px dashed rgba(124, 58, 237, 0.5); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 28px;">
            <span style="color: #a78bfa; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-bottom: 8px;">Your 6-Digit OTP Code</span>
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 0.25em; color: #ffffff; font-family: monospace;">${otp}</span>
            <span style="color: #9ca3af; font-size: 11px; display: block; margin-top: 8px;">Expires in 60 minutes</span>
          </div>

          <!-- 1-Click Button -->
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${verifyUrl}" style="background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 600; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
              Verify Account with 1-Click
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 30px 0;">

          <p style="color: #6b7280; font-size: 12px; line-height: 1.5; text-align: center;">
            If you didn't create a ByteBulletin account, you can safely ignore this email.<br>
            Direct verification link: <a href="${verifyUrl}" style="color: #8b5cf6; text-decoration: underline;">${verifyUrl}</a>
          </p>
        </div>
      </body>
    </html>
  `;

  try {
    console.log(`\n=========================================\n[VERIFICATION OTP GENERATED]\nTO: ${email}\nOTP CODE: ${otp}\nVERIFY LINK: ${verifyUrl}\n=========================================\n`);

    const resend = getResendClient();
    if (!resend) {
      console.warn("[Resend Warning]: Skipping email delivery because RESEND_API_KEY is missing.");
      return { success: true, data: { id: "mock-id-no-resend-key" } };
    }

    const data = await safeSendResendEmail(resend, {
      to: [email],
      subject: `Verify your ByteBulletin Account - OTP: ${otp}`,
      html: htmlContent,
    });

    if (data.error) {
      console.warn("[Resend API Error]:", data.error.message || data.error);
    } else {
      console.log("[Resend Email Sent Successfully]:", data.data?.id);
    }

    return { success: !data.error, data };
  } catch (error) {
    console.error("[Resend Email Exception]:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const domain = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetUrl = `${domain}/reset-password?token=${encodeURIComponent(token)}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your ByteBulletin Password</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f0b1e; color: #f3f4f6; margin: 0; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #18142a; border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; font-weight: 800; margin: 0; tracking-tight: -0.05em;">
              ByteBulletin
            </h1>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 6px;">Password Reset Request</p>
          </div>

          <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-bottom: 16px;">
            Reset your password 🔐
          </h2>

          <p style="color: #d1d5db; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            We received a request to reset your password for your ByteBulletin account. Click the button below to set a new password. This link is valid for <strong>60 minutes</strong>.
          </p>

          <!-- Reset Button -->
          <div style="text-align: center; margin-bottom: 28px;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 600; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
              Reset Password
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 30px 0;">

          <p style="color: #6b7280; font-size: 12px; line-height: 1.5; text-align: center;">
            If you did not request a password reset, you can safely ignore this email.<br>
            Direct link: <a href="${resetUrl}" style="color: #8b5cf6; text-decoration: underline;">${resetUrl}</a>
          </p>
        </div>
      </body>
    </html>
  `;

  try {
    console.log(`\n=========================================\n[PASSWORD RESET LINK GENERATED]\nTO: ${email}\nRESET LINK: ${resetUrl}\n=========================================\n`);

    const resend = getResendClient();
    if (!resend) {
      console.warn("[Resend Warning]: Skipping email delivery because RESEND_API_KEY is missing.");
      return { success: true, data: { id: "mock-id-no-resend-key" } };
    }

    const data = await safeSendResendEmail(resend, {
      to: [email],
      subject: "Reset your ByteBulletin Password",
      html: htmlContent,
    });

    if (data.error) {
      console.warn("[Resend Password Reset Error]:", data.error.message || data.error);
    } else {
      console.log("[Password Reset Email Sent Successfully]:", data.data?.id);
    }

    return { success: !data.error, data };
  } catch (error) {
    console.error("[Resend Password Reset Email Exception]:", error);
    return { success: false, error };
  }
}

export async function sendWelcomeNewsletterEmail(email: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ByteBulletin Executive Digest</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f0b1e; color: #f3f4f6; margin: 0; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background-color: #18142a; border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; font-weight: 800; margin: 0; tracking-tight: -0.05em;">
              ByteBulletin
            </h1>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 6px;">AI-Powered Tech & Business Intelligence</p>
          </div>

          <h2 style="color: #ffffff; font-size: 20px; font-weight: 700; margin-bottom: 16px;">
            Welcome to ByteBulletin! 🎉
          </h2>

          <p style="color: #d1d5db; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
            Thank you for subscribing to ByteBulletin Executive Digest. You will now receive curated AI-synthesized summaries of top technology, startup, and business news directly in your inbox.
          </p>

          <div style="background: rgba(124, 58, 237, 0.1); border-left: 4px solid #7c3aed; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="color: #a78bfa; font-size: 13px; margin: 0; font-weight: 600;">⚡ What to expect:</p>
            <ul style="color: #d1d5db; font-size: 13px; margin: 8px 0 0 18px; padding: 0; line-height: 1.6;">
              <li>Concise, zero-fluff AI summaries of breakthrough tech.</li>
              <li>Daily briefings on AI tools, startups & market trends.</li>
              <li>Curated insights for executives, founders & developers.</li>
            </ul>
          </div>

          <div style="text-align: center; margin-bottom: 24px;">
            <a href="https://thebytebulletin.com" style="background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 15px; font-weight: 600; border-radius: 9999px; display: inline-block; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
              Explore Latest AI News
            </a>
          </div>

          <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 30px 0;">

          <p style="color: #6b7280; font-size: 12px; line-height: 1.5; text-align: center;">
            You received this email because you subscribed to updates on <a href="https://thebytebulletin.com" style="color: #8b5cf6; text-decoration: underline;">thebytebulletin.com</a>.
          </p>
        </div>
      </body>
    </html>
  `;

  try {
    console.log(`\n=========================================\n[WELCOME NEWSLETTER EMAIL]\nTO: ${email}\n=========================================\n`);

    const resend = getResendClient();
    if (!resend) {
      console.warn("[Resend Warning]: Skipping welcome email delivery because RESEND_API_KEY is missing.");
      return { success: true };
    }

    const data = await safeSendResendEmail(resend, {
      to: [email],
      subject: "Welcome to ByteBulletin Executive Digest 🎉",
      html: htmlContent,
    });

    if (data.error) {
      console.warn("[Resend Welcome Newsletter Email Error]:", data.error.message || data.error);
    } else {
      console.log("[Welcome Newsletter Email Sent Successfully]:", data.data?.id);
    }

    return { success: !data.error, data };
  } catch (error) {
    console.error("[Resend Welcome Newsletter Email Exception]:", error);
    return { success: false, error };
  }
}
