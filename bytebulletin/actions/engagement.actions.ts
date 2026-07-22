"use server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { ReactionType } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Toggles or updates an emoji reaction for an article
 */
export async function toggleArticleReactionAction(articleId: string, type: ReactionType) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Please log in to react to articles." };
    }

    const model = (prisma as any)?.articleReaction;
    if (!model || typeof model.findUnique !== "function") {
      return { success: false, error: "Reactions service is temporarily unavailable." };
    }

    const userId = session.user.id;

    // Find existing reaction
    const existing = await model.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (existing) {
      if (existing.type === type) {
        // Toggle off if same reaction clicked again
        await model.delete({
          where: { id: existing.id },
        });
      } else {
        // Switch reaction type
        await model.update({
          where: { id: existing.id },
          data: { type },
        });
      }
    } else {
      // Create new reaction
      await model.create({
        data: {
          userId,
          articleId,
          type,
        },
      });
    }

    revalidatePath(`/news/[slug]`, "page");
    return { success: true };
  } catch (error) {
    console.error("Reaction Error:", error);
    return { success: false, error: "Failed to update reaction" };
  }
}

/**
 * Gets reaction counts and current user reaction for an article
 */
export async function getArticleReactionsData(articleId: string, currentUserId?: string) {
  const counts: Record<ReactionType | "total", number> = {
    LIKE: 0,
    LOVE: 0,
    LAUGH: 0,
    THINKING: 0,
    FIRE: 0,
    total: 0,
  };

  try {
    const model = (prisma as any)?.articleReaction;
    if (!model || typeof model.findMany !== "function") {
      return { counts, userReaction: null };
    }

    const reactions = await model.findMany({
      where: { articleId },
      select: { type: true, userId: true },
    });

    counts.total = reactions.length;
    let userReaction: ReactionType | null = null;

    reactions.forEach((r: { type: ReactionType; userId: string }) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
      if (currentUserId && r.userId === currentUserId) {
        userReaction = r.type;
      }
    });

    return { counts, userReaction };
  } catch (error) {
    console.error("getArticleReactionsData Error:", error);
    return { counts, userReaction: null };
  }
}

/**
 * Posts a new comment on an article
 */
export async function postCommentAction(articleId: string, content: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Please log in to leave a comment." };
    }

    const trimmed = content.trim();
    if (!trimmed || trimmed.length < 2) {
      return { success: false, error: "Comment must be at least 2 characters long." };
    }

    if (trimmed.length > 1000) {
      return { success: false, error: "Comment cannot exceed 1000 characters." };
    }

    const model = (prisma as any)?.comment;
    if (!model || typeof model.create !== "function") {
      return { success: false, error: "Comments service is temporarily unavailable." };
    }

    const comment = await model.create({
      data: {
        articleId,
        userId: session.user.id,
        content: trimmed,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    revalidatePath(`/news/[slug]`, "page");
    return { success: true, comment };
  } catch (error) {
    console.error("Comment Post Error:", error);
    return { success: false, error: "Failed to post comment" };
  }
}

/**
 * Deletes a comment if owned by current user or user is ADMIN
 */
export async function deleteCommentAction(commentId: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized." };
    }

    const model = (prisma as any)?.comment;
    if (!model || typeof model.findUnique !== "function") {
      return { success: false, error: "Comments service is temporarily unavailable." };
    }

    const comment = await model.findUnique({
      where: { id: commentId },
      select: { userId: true },
    });

    if (!comment) {
      return { success: false, error: "Comment not found." };
    }

    if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return { success: false, error: "You can only delete your own comments." };
    }

    await model.delete({
      where: { id: commentId },
    });

    revalidatePath(`/news/[slug]`, "page");
    return { success: true };
  } catch (error) {
    console.error("Delete Comment Error:", error);
    return { success: false, error: "Failed to delete comment" };
  }
}
