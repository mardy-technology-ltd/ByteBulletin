import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const cats = await prisma.category.findMany({
    include: { _count: { select: { articles: true } } }
  });
  return NextResponse.json(cats);
}
