import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/config";

export async function GET() {
  const session = await auth();

  // Validate Authentication
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            imageUrl: true,
            publishedAt: true,
            source: { select: { name: true, logoUrl: true } },
            category: { select: { name: true, slug: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: bookmarks });
  } catch (error: unknown) {
    console.error("[GET /api/user/bookmarks] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  // Validate Authentication
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    if (!body.articleId) {
      return NextResponse.json(
        { success: false, error: "Missing articleId" },
        { status: 400 }
      );
    }

    // Upsert to handle if they click bookmark twice rapidly
    const bookmark = await prisma.bookmark.upsert({
      where: {
        userId_articleId: {
          userId: session.user.id,
          articleId: body.articleId,
        },
      },
      update: {}, // Do nothing if it exists
      create: {
        userId: session.user.id,
        articleId: body.articleId,
      },
    });

    return NextResponse.json({ success: true, data: bookmark }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/user/bookmarks] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
