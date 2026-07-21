import { prisma } from "@/lib/db/prisma";

export class BookmarkRepository {
  /**
   * Fetches all bookmarked articles for a specific user.
   */
  static async getUserBookmarks(userId: string) {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        article: {
          include: {
            source: { select: { name: true } },
            aiSummary: { select: { id: true } },
          },
        },
      },
    });

    return bookmarks.map((b) => b.article);
  }

  /**
   * Checks if a user has bookmarked a specific article.
   */
  static async isBookmarked(userId: string, articleId: string): Promise<boolean> {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    return !!bookmark;
  }

  /**
   * Toggles a bookmark for a user.
   * Returns true if bookmarked, false if unbookmarked.
   */
  static async toggleBookmark(userId: string, articleId: string): Promise<boolean> {
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (existing) {
      await prisma.bookmark.delete({
        where: { id: existing.id },
      });
      return false; // Unbookmarked
    } else {
      await prisma.bookmark.create({
        data: {
          userId,
          articleId,
        },
      });
      return true; // Bookmarked
    }
  }
}
