import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  try {
    // 1. Fetch previously pushed article IDs from GlobalSettings to prevent duplicates
    const pushedSetting = await prisma.globalSetting.findUnique({
      where: { key: "pushed_article_ids" }
    });
    
    let pushedIds: string[] = [];
    if (pushedSetting?.value) {
      try {
        pushedIds = JSON.parse(pushedSetting.value);
      } catch (e) {
        console.error("Failed to parse pushed_article_ids", e);
      }
    }

    // 2. Find the most recent trending tech/AI article from the last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const article = await prisma.article.findFirst({
      where: {
        publishedAt: { gte: yesterday },
        imageUrl: { not: null },
        category: { slug: { in: ["technology", "science", "ai", "business"] } },
        ...(pushedIds.length > 0 ? { id: { notIn: pushedIds } } : {})
      },
      orderBy: { viewCount: "desc" },
      include: { category: true }
    });

    if (!article) {
      return NextResponse.json({ 
        success: true, 
        skipped: true, 
        reason: "No new trending technology/AI article found in the last 24 hours that hasn't been pushed yet." 
      });
    }

    // 3. Prepare OneSignal payload
    const payload = {
      app_id: process.env.ONESIGNAL_APP_ID,
      included_segments: ["Subscribed Users"],
      contents: { en: article.title },
      headings: { en: "Trending Story on ByteBulletin" },
      url: `https://www.thebytebulletin.com/news/${article.slug}`,
      big_picture: article.imageUrl,
      delayed_option: "timezone",
      delivery_time_of_day: "09:00AM"
    };

    // 4. Call OneSignal API
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${process.env.ONESIGNAL_REST_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OneSignal Push Failed:", errorText);
      return NextResponse.json({ 
        success: false, 
        reason: "OneSignal API Error", 
        details: errorText 
      }, { status: 500 });
    }

    const responseData = await response.json();

    // 5. Update the database to mark this article as pushed
    pushedIds.push(article.id);
    // Keep only the last 50 IDs to prevent the JSON array from growing indefinitely
    if (pushedIds.length > 50) {
      pushedIds = pushedIds.slice(pushedIds.length - 50);
    }
    
    await prisma.globalSetting.upsert({
      where: { key: "pushed_article_ids" },
      update: { value: JSON.stringify(pushedIds) },
      create: { 
        key: "pushed_article_ids", 
        value: JSON.stringify(pushedIds), 
        description: "JSON array of recently pushed article IDs to prevent duplicate OneSignal pushes" 
      }
    });

    // 6. Return success
    return NextResponse.json({
      success: true,
      message: "Push notification successfully scheduled.",
      article: {
        id: article.id,
        title: article.title,
        slug: article.slug
      },
      onesignalResponse: responseData
    });

  } catch (error: any) {
    console.error("Cron Auto-Push Error:", error);
    return NextResponse.json({ 
      success: false, 
      reason: "Internal Server Error", 
      error: error.message 
    }, { status: 500 });
  }
}
