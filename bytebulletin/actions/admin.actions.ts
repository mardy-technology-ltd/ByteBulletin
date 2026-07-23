"use server";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/config";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
}

export async function createSource(data: {
  name: string;
  feedUrl: string;
  siteUrl: string;
  categoryId: string;
  fetchInterval: number;
}) {
  await checkAdmin();

  try {
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    
    await prisma.source.create({
      data: {
        name: data.name,
        slug,
        feedUrl: data.feedUrl,
        siteUrl: data.siteUrl,
        categoryId: data.categoryId,
        fetchInterval: data.fetchInterval,
      },
    });

    revalidatePath("/admin/sources");
    return { success: true };
  } catch (error) {
    console.error("Failed to create source:", error);
    return { success: false, error: "Failed to create source" };
  }
}

export async function toggleSourceStatus(id: string, isActive: boolean) {
  await checkAdmin();

  try {
    await prisma.source.update({
      where: { id },
      data: { isActive },
    });
    
    revalidatePath("/admin/sources");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle source:", error);
    return { success: false, error: "Failed to update source" };
  }
}

export async function deleteSource(id: string) {
  await checkAdmin();

  try {
    await prisma.source.delete({
      where: { id },
    });
    
    revalidatePath("/admin/sources");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete source:", error);
    return { success: false, error: "Failed to delete source" };
  }
}

export async function deleteArticle(id: string) {
  await checkAdmin();

  try {
    // Delete related records first
    await prisma.aISummary.deleteMany({ where: { articleId: id } });
    await prisma.seoMetadata.deleteMany({ where: { articleId: id } });
    await prisma.bookmark.deleteMany({ where: { articleId: id } });
    
    await prisma.article.delete({
      where: { id },
    });
    
    revalidatePath("/admin/articles");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete article:", error);
    return { success: false, error: "Failed to delete article" };
  }
}

export async function deleteUserAction(userId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized: Admin access required" };
  }

  if (session.user.id === userId) {
    return { success: false, error: "You cannot delete your own admin account" };
  }

  try {
    // Delete cascading user relations
    await prisma.bookmark.deleteMany({ where: { userId } });
    await prisma.articleReaction.deleteMany({ where: { userId } });
    await prisma.comment.deleteMany({ where: { userId } });
    await prisma.userPreference.deleteMany({ where: { userId } });
    await prisma.account.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete user:", error);
    return { success: false, error: error?.message || "Failed to delete user" };
  }
}
