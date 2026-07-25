import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getArticleReactionsData } from "@/actions/engagement.actions";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentSlug = searchParams.get("currentSlug");
    const categorySlug = searchParams.get("categorySlug");
    const excludeIdsParam = searchParams.get("excludeIds");

    const excludeIds = excludeIdsParam ? excludeIdsParam.split(",").filter(Boolean) : [];

    // Base query conditions
    const baseWhere: any = {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
    };

    if (currentSlug) {
      baseWhere.slug = { not: currentSlug };
    }

    if (excludeIds.length > 0) {
      baseWhere.id = { notIn: excludeIds };
    }

    let article = null;

    // 1. Try finding next article in the same category WITH AI summary
    if (categorySlug) {
      article = await prisma.article.findFirst({
        where: {
          ...baseWhere,
          category: { slug: categorySlug },
          aiSummary: { isNot: null },
        },
        orderBy: { publishedAt: "desc" },
        include: {
          source: true,
          category: true,
          aiSummary: true,
          seo: true,
        },
      });
    }

    // 2. Try finding next article in ANY category WITH AI summary
    if (!article) {
      article = await prisma.article.findFirst({
        where: {
          ...baseWhere,
          aiSummary: { isNot: null },
        },
        orderBy: { publishedAt: "desc" },
        include: {
          source: true,
          category: true,
          aiSummary: true,
          seo: true,
        },
      });
    }

    // 3. Fallback to any published article
    if (!article) {
      article = await prisma.article.findFirst({
        where: baseWhere,
        orderBy: { publishedAt: "desc" },
        include: {
          source: true,
          category: true,
          aiSummary: true,
          seo: true,
        },
      });
    }

    if (!article) {
      return NextResponse.json({ success: true, article: null });
    }

    // Fetch reaction counts via existing helper
    const { counts: reactionCounts } = await getArticleReactionsData(article.id);

    let comments: any[] = [];
    try {
      const commentModel = (prisma as any)?.comment;
      if (commentModel && typeof commentModel.findMany === "function") {
        comments = await commentModel.findMany({
          where: { articleId: article.id },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        });
      }
    } catch (err) {
      console.error("Next article comments fetch error:", err);
    }

    return NextResponse.json({
      success: true,
      article: {
        ...article,
        reactionCounts,
        userReaction: null,
        comments,
      },
    });
  } catch (error: unknown) {
    console.error("[GET /api/articles/next] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
