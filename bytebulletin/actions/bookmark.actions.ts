"use server";

import { auth } from "@/lib/auth/config";
import { BookmarkRepository } from "@/repositories/bookmark.repository";
import { revalidatePath } from "next/cache";

/**
 * Toggles a bookmark for the current user.
 * Returns true if the article is now bookmarked, false otherwise.
 */
export async function toggleBookmarkAction(articleId: string, path?: string) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const isBookmarked = await BookmarkRepository.toggleBookmark(session.user.id, articleId);

  if (path) {
    revalidatePath(path);
  }

  return { isBookmarked };
}
