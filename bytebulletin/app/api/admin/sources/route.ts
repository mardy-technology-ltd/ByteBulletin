import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/config";

export async function GET() {
  const session = await auth();

  // Validate Admin Role
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sources = await prisma.source.findMany({
      orderBy: { name: "asc" },
      include: {
        category: { select: { name: true } },
      },
    });

    return NextResponse.json({ success: true, data: sources });
  } catch (error: unknown) {
    console.error("[GET /api/admin/sources] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();

  // Validate Admin Role
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.feedUrl || !body.categoryId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, feedUrl, categoryId" },
        { status: 400 }
      );
    }

    const source = await prisma.source.create({
      data: {
        name: body.name,
        url: body.url || "", // optional root url
        feedUrl: body.feedUrl,
        logoUrl: body.logoUrl,
        categoryId: body.categoryId,
        fetchInterval: body.fetchInterval || 30, // default 30 mins
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json({ success: true, data: source }, { status: 201 });
  } catch (error: unknown) {
    console.error("[POST /api/admin/sources] Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
