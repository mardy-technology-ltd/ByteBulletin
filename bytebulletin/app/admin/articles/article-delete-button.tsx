"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteArticle } from "@/actions/admin.actions";
import { useRouter } from "next/navigation";

export function ArticleDeleteButton({ articleId }: { articleId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    setIsDeleting(true);
    try {
      await deleteArticle(articleId);
      router.refresh();
    } catch (e) {
      console.error("Failed to delete article", e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer"
      title="Delete Article"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin text-red-500" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </Button>
  );
}
