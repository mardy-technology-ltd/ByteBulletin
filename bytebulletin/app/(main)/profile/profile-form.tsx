"use client";

import { useState } from "react";
import { updateUserProfile } from "@/actions/user.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Loader2 } from "lucide-react";

interface ProfileFormProps {
  initialName: string;
  email: string;
}

export function ProfileForm({ initialName, email }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await updateUserProfile(name);
      if (res.success) {
        setSuccess(res.message || "Profile updated successfully!");
      } else {
        setError(res.error || "Failed to update profile");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your full name"
          required
          className="rounded-xl"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="readOnlyEmail">Email Address (Read-only)</Label>
        <Input
          id="readOnlyEmail"
          type="email"
          value={email}
          disabled
          className="rounded-xl bg-muted/50 cursor-not-allowed opacity-80"
        />
        <p className="text-xs text-muted-foreground">Your verified account email address.</p>
      </div>

      <Button type="submit" className="rounded-xl font-semibold bg-primary hover:bg-primary/90" disabled={isPending}>
        {isPending ? (
          <span className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Saving changes...</span>
          </span>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
}
