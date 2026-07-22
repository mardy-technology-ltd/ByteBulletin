"use server";

import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function uploadProfileAvatarAction(formData: FormData) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const file = formData.get("file") as File | null;

    if (!file) {
      return { success: false, error: "No image file provided." };
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: "File size exceeds 5MB limit." };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return { success: false, error: "Only JPEG, PNG, WEBP, and GIF images are allowed." };
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine extension from MIME type
    const ext = file.type.split("/")[1] || "png";
    const fileName = `${session.user.id}-${Date.now()}.${ext}`;

    // Target upload directory: public/uploads/avatars/
    const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Image URL accessible relative to public folder
    const avatarUrl = `/uploads/avatars/${fileName}`;

    // Update user record in database
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: avatarUrl },
    });

    revalidatePath("/profile");
    revalidatePath("/");

    return {
      success: true,
      imageUrl: avatarUrl,
      message: "Profile avatar updated successfully!",
    };
  } catch (error) {
    console.error("[Avatar Upload Error]:", error);
    return { success: false, error: "Failed to upload profile image." };
  }
}
