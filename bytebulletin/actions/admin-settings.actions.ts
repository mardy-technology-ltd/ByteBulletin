"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function getGlobalSettingsAction() {
  try {
    const settings = await prisma.globalSetting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return {
      success: true,
      settings: {
        siteName: settingsMap["site_name"] || "ByteBulletin",
        siteDescription: settingsMap["site_description"] || "AI-powered tech & business news aggregator delivering synthesized summaries.",
        contactEmail: settingsMap["contact_email"] || "support@bytebulletin.com",
        takeawaysCount: settingsMap["takeaways_count"] || "5",
        autoAiSummary: settingsMap["auto_ai_summary"] ?? "true",
        consentModeV2: settingsMap["consent_mode_v2"] ?? "true",
      },
    };
  } catch (error) {
    console.error("[getGlobalSettingsAction Error]:", error);
    return {
      success: false,
      settings: {
        siteName: "ByteBulletin",
        siteDescription: "AI-powered tech & business news aggregator.",
        contactEmail: "support@bytebulletin.com",
        takeawaysCount: "5",
        autoAiSummary: "true",
        consentModeV2: "true",
      },
    };
  }
}

export async function updateGlobalSettingsAction(formData: FormData) {
  try {
    const siteName = formData.get("siteName") as string;
    const siteDescription = formData.get("siteDescription") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const takeawaysCount = formData.get("takeawaysCount") as string;

    const updates = [
      { key: "site_name", value: siteName, description: "Website brand name" },
      { key: "site_description", value: siteDescription, description: "Default SEO site description" },
      { key: "contact_email", value: contactEmail, description: "Support & DPO contact email" },
      { key: "takeaways_count", value: takeawaysCount, description: "Default number of AI Core Takeaways per article" },
    ];

    for (const update of updates) {
      await prisma.globalSetting.upsert({
        where: { key: update.key },
        update: { value: update.value, description: update.description },
        create: { key: update.key, value: update.value, description: update.description },
      });
    }

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true, message: "Global settings updated successfully!" };
  } catch (error) {
    console.error("[updateGlobalSettingsAction Error]:", error);
    return { success: false, error: "Failed to update settings. Please try again." };
  }
}
