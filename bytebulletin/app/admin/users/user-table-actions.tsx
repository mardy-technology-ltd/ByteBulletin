"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { deleteUserAction } from "@/actions/admin.actions";
import { useRouter } from "next/navigation";

interface UserTableActionsProps {
  userId: string;
  userName: string;
  userEmail: string;
  isCurrentUser: boolean;
}

export function UserTableActions({
  userId,
  userName,
  userEmail,
  isCurrentUser,
}: UserTableActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      const res = await deleteUserAction(userId);
      if (!res.success) {
        setErrorMessage(res.error || "Failed to delete user");
        setIsDeleting(false);
      } else {
        setShowConfirm(false);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred");
      setIsDeleting(false);
    }
  };

  if (isCurrentUser) {
    return (
      <span className="text-xs text-muted-foreground italic font-medium px-2.5 py-1 bg-muted/30 border border-border/30 rounded-md inline-block">
        Current Admin
      </span>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowConfirm(true)}
        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/15 rounded-lg cursor-pointer transition-colors"
        title={`Delete user ${userName}`}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      {/* Premium Centered Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-red-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl shadow-red-950/20 space-y-5 text-left text-foreground relative animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center space-x-3 text-red-500">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Delete User Account</h3>
                <p className="text-xs text-muted-foreground">Permanent Account Removal</p>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2 text-sm text-slate-300 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
              <p>
                Are you sure you want to delete <strong className="text-white">{userName}</strong>?
              </p>
              <p className="text-xs text-violet-400 font-mono break-all">
                {userEmail}
              </p>
              <p className="text-xs text-red-400 font-medium pt-1">
                ⚠️ Warning: All user bookmarks, reactions, and preferences will be permanently wiped.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 text-xs text-red-400 bg-red-950/40 border border-red-800/50 rounded-xl">
                {errorMessage}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="cursor-pointer border-slate-800 hover:bg-slate-900 text-slate-300 rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl cursor-pointer shadow-lg shadow-red-950/50"
              >
                {isDeleting ? (
                  <span className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Deleting...</span>
                  </span>
                ) : (
                  "Confirm Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
