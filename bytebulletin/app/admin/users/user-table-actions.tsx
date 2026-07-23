"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
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
    return <span className="text-xs text-muted-foreground italic">Current Admin</span>;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowConfirm(true)}
        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 cursor-pointer"
        title={`Delete user ${userName}`}
      >
        <Trash2 className="w-4 h-4" />
      </Button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-white">
            <h3 className="text-lg font-bold text-red-400">Delete User Account</h3>
            <p className="text-sm text-slate-300">
              Are you sure you want to permanently delete user <strong>{userName}</strong> ({userEmail})?
              This action cannot be undone.
            </p>

            {errorMessage && (
              <div className="p-3 text-xs text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg">
                {errorMessage}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="cursor-pointer border-slate-700 hover:bg-slate-800 text-slate-200"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 cursor-pointer"
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
