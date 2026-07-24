"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function getSponsorSettingAction() {
  try {
    let sponsor: any = null;

    try {
      if ((prisma as any).sponsorSetting) {
        sponsor = await (prisma as any).sponsorSetting.findUnique({
          where: { id: "active_sponsor" },
        });
      }
    } catch (e) {
      console.warn("[Prisma Model Fallback to Raw SQL for getSponsorSettingAction]");
    }

    if (!sponsor) {
      const records: any[] = await prisma.$queryRawUnsafe(
        `SELECT "id", "brandName", "logoUrl", "sponsorText", "sponsorLink", "isEnabled" FROM "sponsor_settings" WHERE "id" = $1 LIMIT 1`,
        "active_sponsor"
      );
      sponsor = records[0] || null;
    }

    if (!sponsor) {
      const defaultSponsor = {
        id: "active_sponsor",
        brandName: "Notion AI",
        sponsorText: "Get 20% off Notion AI for Enterprise workflows. Supercharge your productivity today!",
        sponsorLink: "https://thebytebulletin.com",
        isEnabled: false,
      };

      try {
        await prisma.$executeRawUnsafe(
          `INSERT INTO "sponsor_settings" ("id", "brandName", "sponsorText", "sponsorLink", "isEnabled", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW()) ON CONFLICT ("id") DO NOTHING`,
          defaultSponsor.id,
          defaultSponsor.brandName,
          defaultSponsor.sponsorText,
          defaultSponsor.sponsorLink,
          defaultSponsor.isEnabled
        );
      } catch (e) {
        console.warn("[Sponsor Default Insert Warning]:", e);
      }

      sponsor = defaultSponsor;
    }

    return { success: true, sponsor };
  } catch (error: any) {
    console.error("Get Sponsor Setting Exception:", error);
    return {
      success: true,
      sponsor: {
        id: "active_sponsor",
        brandName: "Notion AI",
        sponsorText: "Get 20% off Notion AI for Enterprise workflows. Supercharge your productivity today!",
        sponsorLink: "https://thebytebulletin.com",
        isEnabled: false,
      },
    };
  }
}

export async function updateSponsorSettingAction(data: {
  brandName: string;
  sponsorText: string;
  sponsorLink: string;
  isEnabled: boolean;
}) {
  try {
    const brandName = data.brandName.trim();
    const sponsorText = data.sponsorText.trim();
    const sponsorLink = data.sponsorLink.trim();
    const isEnabled = data.isEnabled;

    let updated: any = null;

    try {
      if ((prisma as any).sponsorSetting) {
        updated = await (prisma as any).sponsorSetting.upsert({
          where: { id: "active_sponsor" },
          update: { brandName, sponsorText, sponsorLink, isEnabled },
          create: { id: "active_sponsor", brandName, sponsorText, sponsorLink, isEnabled },
        });
      }
    } catch (e) {
      console.warn("[Prisma Model Fallback to Raw SQL for updateSponsorSettingAction]");
    }

    if (!updated) {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "sponsor_settings" ("id", "brandName", "sponsorText", "sponsorLink", "isEnabled", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW()) ON CONFLICT ("id") DO UPDATE SET "brandName" = $2, "sponsorText" = $3, "sponsorLink" = $4, "isEnabled" = $5, "updatedAt" = NOW()`,
        "active_sponsor",
        brandName,
        sponsorText,
        sponsorLink,
        isEnabled
      );
      updated = { id: "active_sponsor", brandName, sponsorText, sponsorLink, isEnabled };
    }

    revalidatePath("/admin/newsletter");
    return { success: true, sponsor: updated, message: "Sponsor banner settings saved!" };
  } catch (error: any) {
    console.error("Update Sponsor Setting Error:", error);
    return { success: false, error: error?.message || "Failed to update sponsor settings." };
  }
}
