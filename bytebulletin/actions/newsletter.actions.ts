"use server";

import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

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
