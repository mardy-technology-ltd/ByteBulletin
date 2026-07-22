"use client";

import { useState } from "react";
import { postCommentAction, deleteCommentAction } from "@/actions/engagement.actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Trash2, Loader2, Lock } from "lucide-react";
import Link from "next/link";

interface CommentUser {
  id: string;
  name?: string | null;
  image?: string | null;
}

interface CommentItem {
  id: string;
  content: string;
  createdAt: Date | string;
  userId: string;
  user: CommentUser;
}

interface CommentSectionProps {
  articleId: string;
  initialComments: CommentItem[];
  currentUser?: {
    id: string;
    name?: string | null;
    image?: string | null;
    role?: string | null;
  } | null;
}

export function CommentSection({
  articleId,
  initialComments,
  currentUser = null,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatTimeAgo = (dateInput: Date | string) => {
    const date = new Date(dateInput);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const trimmed = content.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await postCommentAction(articleId, trimmed);
      if (res.success && res.comment) {
        setComments([res.comment as CommentItem, ...comments]);
        setContent("");
      } else {
        setError(res.error || "Failed to post comment");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (deletingId) return;
    setDeletingId(commentId);

    try {
      const res = await deleteCommentAction(commentId);
      if (res.success) {
        setComments(comments.filter((c) => c.id !== commentId));
      } else {
        alert(res.error || "Could not delete comment.");
      }
    } catch {
      alert("Failed to delete comment.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-border/40 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-2.5">
        <MessageSquare className="w-5 h-5 text-violet-500" />
        <h3 className="font-heading text-2xl font-extrabold tracking-tight">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Input Form */}
      {currentUser ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex items-start space-x-3">
            <Avatar className="w-10 h-10 border border-violet-500/30 shrink-0 mt-1">
              {currentUser.image && <AvatarImage src={currentUser.image} alt={currentUser.name || "User"} />}
              <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs font-bold">
                {getInitials(currentUser.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts on this article..."
                rows={3}
                required
                className="w-full p-3 rounded-2xl border border-border/50 bg-card/60 focus:bg-card focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm outline-none transition-all resize-none"
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="rounded-xl font-semibold bg-primary hover:bg-primary/90 px-5 shadow-sm"
                >
                  {isSubmitting ? (
                    <span className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Posting...</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-2">
                      <Send className="w-4 h-4 mr-1.5" />
                      <span>Post Comment</span>
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm text-center space-y-3">
          <div className="mx-auto w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-500">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base">Join the Discussion</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Please sign in to leave a comment and share your opinion.
            </p>
          </div>
          <div className="flex justify-center space-x-3 pt-2">
            <Link
              href={`/login?callbackUrl=/article/${articleId}`}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-border bg-card hover:bg-muted transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4 pt-2">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8 italic">
            No comments yet. Be the first to start the conversation!
          </p>
        ) : (
          comments.map((c) => {
            const isOwner = currentUser?.id === c.userId || currentUser?.role === "ADMIN";

            return (
              <div
                key={c.id}
                className="group relative flex items-start space-x-3 p-4 rounded-2xl border border-border/30 bg-card/30 hover:bg-card/60 transition-colors"
              >
                <Avatar className="w-9 h-9 border border-border/50 shrink-0 mt-0.5">
                  {c.user.image && <AvatarImage src={c.user.image} alt={c.user.name || "User"} />}
                  <AvatarFallback className="bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-600 text-white text-xs font-bold">
                    {getInitials(c.user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-extrabold text-foreground">{c.user.name || "Tech Reader"}</span>
                      <span className="text-[11px] text-muted-foreground">• {formatTimeAgo(c.createdAt)}</span>
                    </div>

                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-destructive/10 cursor-pointer"
                        title="Delete comment"
                      >
                        {deletingId === c.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{c.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
