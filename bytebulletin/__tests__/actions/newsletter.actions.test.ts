import { describe, it, expect, vi, beforeEach } from "vitest";
import { subscribeEmailDirectly } from "@/actions/newsletter.actions";
import { prisma } from "@/lib/db/prisma";

// Mock Prisma Client
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    newsletterSubscriber: {
      upsert: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe("newsletter.actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("subscribeEmailDirectly", () => {
    it("should return validation error for invalid email", async () => {
      const res = await subscribeEmailDirectly("not-an-email");
      expect(res.success).toBe(false);
      expect(res.error).toBe("Invalid email address");
      expect(prisma.newsletterSubscriber.upsert).not.toHaveBeenCalled();
    });

    it("should upsert subscriber email into DB and return success", async () => {
      vi.mocked(prisma.newsletterSubscriber.upsert).mockResolvedValue({
        id: "sub-1",
        email: "executive@enterprise.com",
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const res = await subscribeEmailDirectly("executive@enterprise.com");
      expect(res.success).toBe(true);
      expect(res.message).toBe("Successfully subscribed!");
      expect(prisma.newsletterSubscriber.upsert).toHaveBeenCalledWith({
        where: { email: "executive@enterprise.com" },
        update: { status: "ACTIVE" },
        create: { email: "executive@enterprise.com", status: "ACTIVE" },
      });
    });
  });
});
