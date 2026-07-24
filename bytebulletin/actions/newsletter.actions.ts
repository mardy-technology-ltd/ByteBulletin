"use server";

import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { getResendClient, safeSendResendEmail, sendWelcomeNewsletterEmail } from "@/lib/email/resend";

const emailSchema = z.string().email("Invalid email address");

export async function subscribeToNewsletter(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    return await subscribeEmailDirectly(email);
  } catch (error) {
    console.error("Newsletter Subscription Error:", error);
    return { success: false, error: "Failed to subscribe. Please try again." };
  }
}

export async function subscribeEmailDirectly(email: string) {
  try {
    const parsed = emailSchema.safeParse(email);

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues?.[0]?.message || "Invalid email address" };
    }

    // Prisma upsert prevents duplicate registration errors
    await prisma.newsletterSubscriber.upsert({
      where: { email: parsed.data },
      update: { status: "ACTIVE" }, // Re-subscribe if they had unsubscribed
      create: { email: parsed.data, status: "ACTIVE" },
    });

    // Send instant Welcome/Thank You Email asynchronously
    sendWelcomeNewsletterEmail(parsed.data).catch((err) => {
      console.warn("[Newsletter Welcome Email Warning]:", err);
    });

    return { success: true, message: "Successfully subscribed!" };
  } catch (error) {
    console.error("Newsletter Direct Subscription Error:", error);
    return { success: false, error: "Failed to subscribe. Please try again." };
  }
}

export async function getNewsletterSubscribersAction() {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, subscribers };
  } catch (error) {
    console.error("Get Newsletter Subscribers Error:", error);
    return { success: false, subscribers: [] };
  }
}

export async function sendNewsletterBroadcastAction(subject: string, bodyContent: string) {
  try {
    if (!subject.trim() || !bodyContent.trim()) {
      return { success: false, error: "Subject and broadcast message body are required." };
    }

    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: "ACTIVE" },
      select: { email: true },
    });

    if (subscribers.length === 0) {
      return { success: false, error: "No active subscribers found in database." };
    }

    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: "Resend API client is missing." };
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f0b1e; color: #f3f4f6; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #18142a; border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 16px; padding: 36px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
            
            <div style="text-align: center; margin-bottom: 28px;">
              <h1 style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 26px; font-weight: 800; margin: 0;">
                ByteBulletin Executive Digest
              </h1>
              <p style="color: #9ca3af; font-size: 13px; margin-top: 4px;">AI-Powered Tech & Business Intelligence</p>
            </div>

            <div style="color: #e5e7eb; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">
              ${bodyContent}
            </div>

            <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 30px 0;">

            <p style="color: #6b7280; font-size: 11px; line-height: 1.5; text-align: center;">
              You received this email because you subscribed to ByteBulletin updates.<br>
              Published on <a href="https://thebytebulletin.com" style="color: #8b5cf6; text-decoration: underline;">thebytebulletin.com</a>
            </p>
          </div>
        </body>
      </html>
    `;

    let sentCount = 0;
    for (const sub of subscribers) {
      await safeSendResendEmail(resend, {
        to: [sub.email],
        subject: subject.trim(),
        html: htmlContent,
      });
      sentCount++;
    }

    return {
      success: true,
      count: sentCount,
      message: `Successfully sent broadcast to ${sentCount} subscriber(s)!`,
    };
  } catch (error: any) {
    console.error("Send Newsletter Broadcast Error:", error);
    return { success: false, error: error?.message || "Failed to send newsletter broadcast." };
  }
}
