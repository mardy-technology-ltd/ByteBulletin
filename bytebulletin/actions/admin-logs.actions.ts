"use server";

import { prisma } from "@/lib/db/prisma";

export async function getAdminLogsData(page = 1, limit = 25) {
  try {
    const skip = (page - 1) * limit;

    const [logs, totalCount, successCount, failedCount] = await Promise.all([
      prisma.rssFetchLog.findMany({
        take: limit,
        skip,
        orderBy: { fetchedAt: "desc" },
        include: {
          source: { select: { name: true, siteUrl: true } },
        },
      }),
      prisma.rssFetchLog.count(),
      prisma.rssFetchLog.count({ where: { status: "SUCCESS" } }),
      prisma.rssFetchLog.count({ where: { status: "FAILED" } }),
    ]);

    return {
      success: true,
      logs,
      totalCount,
      successCount,
      failedCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("[getAdminLogsData Error]:", error);
    return {
      success: false,
      logs: [],
      totalCount: 0,
      successCount: 0,
      failedCount: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}
