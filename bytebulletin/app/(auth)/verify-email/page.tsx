"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmailAction, resendVerificationOtpAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ShieldCheck, Mail, ArrowRight, RefreshCw, CheckCircle2 } from "lucide-react";

interface VerifyEmailPageProps {
  searchParams: Promise<{ email?: string; token?: string; unverified?: string }>;
}

export default function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = use(searchParams);
  const router = useRouter();

  const [email, setEmail] = useState<string>(params.email || "");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If user navigated from 1-click email verification link
  useEffect(() => {
    if (params.token && params.email) {
      handleTokenVerification(params.email, params.token);
    }
  }, [params.token, params.email]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleTokenVerification = async (userEmail: string, token: string) => {
    setIsPending(true);
    setError(null);
    try {
      const res = await verifyEmailAction(userEmail, token);
      if (res.success) {
        setSuccess("Email verified successfully! Redirecting to login...");
        setTimeout(() => router.push("/login?verified=true"), 2000);
      } else {
        setError(res.error || "Verification failed");
      }
    } catch {
      setError("An unexpected error occurred during verification.");
    } finally {
      setIsPending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // User pasted full OTP
      const pasted = value.trim().slice(0, 6).split("");
      const newOtp = [...otp];
      pasted.forEach((char, i) => {
        newOtp[i] = char;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(5, pasted.length - 1)]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("").trim();

    if (fullOtp.length !== 6) {
      setError("Please enter all 6 digits of the OTP code.");
      return;
    }

    if (!email) {
      setError("Email address is missing. Please sign up or log in again.");
      return;
    }

    setIsPending(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await verifyEmailAction(email, fullOtp);
      if (res.success) {
        setSuccess("Email verified successfully! Redirecting to login...");
        setTimeout(() => router.push("/login?verified=true"), 2000);
      } else {
        setError(res.error || "Invalid verification code.");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      setError("Please enter your email address below.");
      return;
    }
    if (resendCooldown > 0) return;

    setIsPending(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await resendVerificationOtpAction(email);
      if (res.success) {
        setSuccess(res.message || "New OTP code sent!");
        setResendCooldown(60);
      } else {
        setError(res.error || "Failed to resend OTP.");
      }
    } catch {
      setError("Could not resend OTP email.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6 bg-card/60 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-border/40">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-block text-2xl font-heading font-extrabold tracking-tight gradient-text mb-2">
            ByteBulletin
          </Link>

          <div className="mx-auto w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight">Verify your Email</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We sent a 6-digit OTP code to <br />
            <span className="font-semibold text-foreground">{email || "your email"}</span>
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!params.email && (
            <div className="space-y-2">
              <label htmlFor="emailInput" className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Email Address</label>
              <Input
                id="emailInput"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
          )}

          {/* 6-Digit OTP Inputs */}
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl border-border/60 focus:border-violet-500 focus:ring-violet-500/20"
              />
            ))}
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md" disabled={isPending}>
            {isPending ? "Verifying..." : "Verify & Activate Account"}
            {!isPending && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </form>

        <div className="flex flex-col items-center justify-center space-y-3 pt-4 border-t border-border/40 text-sm">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendCooldown > 0 || isPending}
            className="flex items-center text-xs font-semibold text-violet-500 hover:text-violet-400 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isPending ? "animate-spin" : ""}`} />
            {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP Email"}
          </button>

          <Link href="/login" className="text-xs text-muted-foreground hover:underline">
            Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
