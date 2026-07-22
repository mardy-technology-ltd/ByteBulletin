"use server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

export async function updateUserProfile(name: string) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: "Name must be at least 2 characters" };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: trimmedName },
    });

    revalidatePath("/profile");
    revalidatePath("/");

    return { success: true, message: "Profile updated successfully!" };
  } catch (error) {
    console.error("Update Profile Error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
