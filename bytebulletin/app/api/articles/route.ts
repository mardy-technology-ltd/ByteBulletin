import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const category = searchParams.get("category");
    const sourceId = searchParams.get("source");

    const skip = (page - 1) * limit;

    // Build the query where clause
    const where: any = {
      status: "PUBLISHED",
    };

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (sourceId) {
      where.sourceId = sourceId;
    }

    // Fetch total count and articles in parallel
    const [total, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        skip,
        take: limit,
        orderBy: { publishedAt: "desc" },
        include: {
          category: { select: { name: true, slug: true } },
          source: { select: { name: true, url: true, logoUrl: true } },
          aiSummary: { select: { summary: true } },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: articles,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: unknown) {
    console.error("[GET /api/articles] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
