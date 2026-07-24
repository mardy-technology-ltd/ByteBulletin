import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getResendClient, safeSendResendEmail } from "@/lib/email/resend";

export async function GET(request: Request) {
  try {
    // 1. Fetch active newsletter subscribers
    let subscribers: any[] = [];
    try {
      subscribers = await prisma.newsletterSubscriber.findMany({
        where: { status: "ACTIVE" },
        select: { email: true },
      });
    } catch (e) {
      console.warn("[Cron Subscribers Query Fallback]:", e);
      const records: any[] = await prisma.$queryRawUnsafe(
        `SELECT "email" FROM "newsletter_subscribers" WHERE "status" = 'ACTIVE'`
      );
      subscribers = records;
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active subscribers to send weekly newsletter.",
        count: 0,
      });
    }

    // 2. Fetch top 5 articles from the last 7 days (or latest 5)
    let topArticles: any[] = [];
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      topArticles = await prisma.article.findMany({
        where: { publishedAt: { gte: sevenDaysAgo } },
        orderBy: { viewCount: "desc" },
        take: 5,
        include: { source: true, category: true },
      });

      if (topArticles.length < 3) {
        topArticles = await prisma.article.findMany({
          orderBy: { publishedAt: "desc" },
          take: 5,
          include: { source: true, category: true },
        });
      }
    } catch (e) {
      console.warn("[Cron Articles Query Fallback]:", e);
    }

    // 3. Fetch active Sponsor Banner settings safely
    let sponsor: any = null;
    try {
      if ((prisma as any).sponsorSetting) {
        sponsor = await (prisma as any).sponsorSetting.findUnique({
          where: { id: "active_sponsor" },
        });
      }
    } catch (e) {
      console.warn("[Cron SponsorSetting Query Warning]:", e);
    }

    if (!sponsor) {
      try {
        const records: any[] = await prisma.$queryRawUnsafe(
          `SELECT "id", "brandName", "logoUrl", "sponsorText", "sponsorLink", "isEnabled" FROM "sponsor_settings" WHERE "id" = $1 LIMIT 1`,
          "active_sponsor"
        );
        sponsor = records[0] || null;
      } catch (e) {
        console.warn("[Cron Raw SQL Sponsor Query Warning]:", e);
      }
    }

    // 4. Build Email HTML Content
    const domain = process.env.NEXTAUTH_URL || "https://www.thebytebulletin.com";
    const sponsorBannerHtml =
      sponsor && sponsor.isEnabled && sponsor.brandName
        ? `
        <div style="background: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.4); border-radius: 12px; padding: 18px; margin-bottom: 28px;">
          <span style="color: #a78bfa; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; display: block; margin-bottom: 6px;">
            ⚡ SPONSORED BY ${sponsor.brandName.toUpperCase()}
          </span>
          <p style="color: #f3f4f6; font-size: 13px; line-height: 1.5; margin: 0 0 12px 0;">
            ${sponsor.sponsorText || ""}
          </p>
          ${
            sponsor.sponsorLink
              ? `<a href="${sponsor.sponsorLink}" style="color: #60a5fa; font-size: 12px; font-weight: 700; text-decoration: underline;">
                  Learn More & Claim Offer ➔
                </a>`
              : ""
          }
        </div>
      `
        : "";

    const articlesHtml = topArticles.length > 0
      ? topArticles
          .map(
            (article, idx) => `
            <div style="margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <div style="margin-bottom: 6px;">
                <span style="color: #a78bfa; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">
                  ${article.category?.name || "Technology"}
                </span>
                <span style="color: #6b7280; font-size: 11px;"> • ${article.source?.name || "ByteBulletin AI"}</span>
              </div>
              <h3 style="margin: 0 0 8px 0; font-size: 17px; font-weight: 700; line-height: 1.4;">
                <a href="${domain}/news/${article.slug}" style="color: #ffffff; text-decoration: none;">
                  ${idx + 1}. ${article.title}
                </a>
              </h3>
              <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0 0 10px 0;">
                ${article.excerpt || ""}
              </p>
              <a href="${domain}/news/${article.slug}" style="color: #8b5cf6; font-size: 12px; font-weight: 600; text-decoration: none;">
                Read Full AI Summary ➔
              </a>
            </div>
          `
          )
          .join("")
      : `<p style="color: #9ca3af; font-size: 14px;">Check out our website for the latest AI & tech stories!</p>`;

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>ByteBulletin Weekly Digest</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f0b1e; color: #f3f4f6; margin: 0; padding: 40px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #18142a; border: 1px solid rgba(124, 58, 237, 0.3); border-radius: 16px; padding: 36px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
            
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="background: linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 28px; font-weight: 800; margin: 0;">
                ByteBulletin Digest
              </h1>
              <p style="color: #9ca3af; font-size: 13px; margin-top: 4px;">Top Breakthroughs in AI & Technology This Week</p>
            </div>

            ${sponsorBannerHtml}

            <h2 style="color: #ffffff; font-size: 18px; font-weight: 700; margin-bottom: 20px;">
              🔥 Top Stories This Week
            </h2>

            ${articlesHtml}

            <div style="text-align: center; margin-top: 32px; margin-bottom: 24px;">
              <a href="${domain}" style="background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 14px; font-weight: 600; border-radius: 9999px; display: inline-block;">
                Explore All Stories on ByteBulletin
              </a>
            </div>

            <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 30px 0;">

            <p style="color: #6b7280; font-size: 11px; line-height: 1.5; text-align: center;">
              You received this email because you subscribed to ByteBulletin updates.<br>
              Published on <a href="${domain}" style="color: #8b5cf6;">thebytebulletin.com</a>
            </p>
          </div>
        </body>
      </html>
    `;

    // 5. Send via Resend
    const resend = getResendClient();
    if (!resend) {
      return NextResponse.json({ success: false, message: "Resend API key missing." });
    }

    let sentCount = 0;
    for (const sub of subscribers) {
      await safeSendResendEmail(resend, {
        to: [sub.email],
        subject: `🚀 ByteBulletin Weekly Digest: Top AI & Tech Breakthroughs`,
        html: fullHtml,
      });
      sentCount++;
    }

    return NextResponse.json({
      success: true,
      count: sentCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Weekly Newsletter Cron Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Cron Handler Error" },
      { status: 200 } // Return 200 so cron monitoring tools process clean JSON response
    );
  }
}
