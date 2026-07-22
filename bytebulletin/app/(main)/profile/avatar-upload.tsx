"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadProfileAvatarAction } from "@/actions/avatar.actions";
import { Camera, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface AvatarUploadProps {
  user: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
}

export function AvatarUpload({ user }: AvatarUploadProps) {
  const [currentImage, setCurrentImage] = useState<string | null>(user.image || null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getInitials(user.name);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);

    // Client-side validation
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB.");
      return;
    }

    // Generate instant client preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadProfileAvatarAction(formData);

      if (res.success && res.imageUrl) {
        setCurrentImage(res.imageUrl);
        setSuccess("Profile picture updated!");
      } else {
        setError(res.error || "Failed to upload image.");
        setPreviewImage(null); // Revert preview on error
      }
    } catch {
      setError("An unexpected error occurred during upload.");
      setPreviewImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  const displaySrc = previewImage || currentImage;

  return (
    <div className="flex flex-col items-center sm:items-start space-y-3">
      <div className="relative group">
        <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-violet-500/40 shadow-xl overflow-hidden">
          {displaySrc && <AvatarImage src={displaySrc} alt={user.name || "User avatar"} className="object-cover" />}
          <AvatarFallback className="bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600 text-white text-2xl font-extrabold">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Upload Overlay Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-xs flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Upload profile image"
        >
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-violet-300" />
          ) : (
            <div className="flex flex-col items-center">
              <Camera className="w-6 h-6 text-white mb-0.5" />
              <span className="text-[10px] font-semibold tracking-wider uppercase">Change</span>
            </div>
          )}
        </button>

        {/* Camera Badge Icon for Mobile / Visibility */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute bottom-0 right-0 p-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-md border-2 border-background transition-transform active:scale-95 cursor-pointer"
          title="Upload new profile picture"
        >
          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
        </button>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Feedback Messages */}
      {error && (
        <p className="text-xs text-destructive flex items-center space-x-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </p>
      )}

      {success && (
        <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{success}</span>
        </p>
      )}
    </div>
  );
}
