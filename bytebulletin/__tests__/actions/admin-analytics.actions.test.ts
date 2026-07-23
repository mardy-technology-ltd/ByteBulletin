import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAdminAnalyticsData } from "@/actions/admin-analytics.actions";
import { prisma } from "@/lib/db/prisma";

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    article: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    user: {
      count: vi.fn(),
    },
    bookmark: {
      count: vi.fn(),
    },
    comment: {
      count: vi.fn(),
    },
    articleReaction: {
      count: vi.fn(),
    },
    newsletterSubscriber: {
      count: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
  },
}));

describe("admin-analytics.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return formatted analytics counts and category distributions", async () => {
    vi.mocked(prisma.article.count).mockResolvedValue(150);
    vi.mocked(prisma.user.count).mockResolvedValue(45);
    vi.mocked(prisma.bookmark.count).mockResolvedValue(89);
    vi.mocked(prisma.comment.count).mockResolvedValue(32);
    vi.mocked(prisma.articleReaction.count).mockResolvedValue(210);
    vi.mocked(prisma.newsletterSubscriber.count).mockResolvedValue(115);

    vi.mocked(prisma.article.findMany).mockResolvedValue([
      {
        id: "art-1",
        title: "OpenAI Sora Enterprise Release",
        slug: "openai-sora-enterprise",
        source: { name: "TechCrunch" },
        category: { name: "Technology", slug: "technology" },
        _count: { bookmarks: 12, comments: 5, reactions: 20 },
      },
    ] as any);

    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { id: "cat-1", name: "Technology", slug: "technology", _count: { articles: 90 } },
      { id: "cat-2", name: "Business", slug: "business", _count: { articles: 60 } },
    ] as any);

    const res = await getAdminAnalyticsData();

    expect(res.success).toBe(true);
    expect(res.data.totalArticles).toBe(150);
    expect(res.data.totalUsers).toBe(45);
    expect(res.data.totalBookmarks).toBe(89);
    expect(res.data.totalComments).toBe(32);
    expect(res.data.totalSubscribers).toBe(115);
    expect(res.data.topArticles).toHaveLength(1);
    expect(res.data.categoriesWithCount).toHaveLength(2);
  });
});
