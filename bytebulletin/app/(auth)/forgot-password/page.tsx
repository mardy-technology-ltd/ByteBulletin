"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetLinkAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsPending(true);
    try {
      const res = await sendPasswordResetLinkAction(email);
      if (res.success) {
        setSuccessMessage(res.message || "We have sent a password reset link to your email.");
      } else {
        setError(res.error || "Failed to process request");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full space-y-8 bg-slate-900/60 backdrop-blur-xl border border-violet-500/20 p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
            <KeyRound className="h-7 w-7" />
          </div>
          <h2 className="font-heading text-3xl font-extrabold tracking-tight text-white">
            Forgot Password?
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            No worries! Enter your registered email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {error && (
          <div className="p-4 text-sm bg-red-950/60 border border-red-500/40 text-red-200 rounded-xl flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {successMessage ? (
          <div className="p-6 text-center bg-violet-950/40 border border-violet-500/40 rounded-2xl space-y-4 animate-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium text-violet-200 leading-relaxed">
              {successMessage}
            </p>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center text-xs font-semibold text-violet-400 hover:text-violet-300 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back to Sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="forgot-email" className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Email Address
              </Label>
              <Input
                id="forgot-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-950/70 border-gray-700/60 text-white placeholder:text-gray-500 focus:border-violet-500 h-11 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold shadow-lg shadow-violet-600/30 cursor-pointer transition-all active:scale-[0.99]"
            >
              {isPending ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Checking Email...</span>
                </span>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center text-xs font-semibold text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                Back to Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
