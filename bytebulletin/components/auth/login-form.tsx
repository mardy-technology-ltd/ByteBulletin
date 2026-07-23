"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/lib/validations/auth.schema";
import { loginUser } from "@/actions/auth.actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsPending(true);
    setError(null);
    try {
      const res = await loginUser(data);
      if (res?.requiresVerification && res?.email) {
        router.push(`/verify-email?email=${encodeURIComponent(res.email)}&unverified=true`);
        setIsPending(false);
      } else if (res?.error) {
        setError(res.error);
        setIsPending(false);
      } else {
        // Smooth instant navigation to dashboard
        const redirectUrl = res?.role === "ADMIN" ? "/admin" : "/";
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      console.error("Login submission error:", err);
      setError(err?.message || "Invalid email or password");
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-md border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="john@example.com" {...register("email")} />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-semibold text-violet-600 hover:text-violet-500 dark:text-violet-400 hover:underline transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            className="pr-10"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full font-semibold cursor-pointer" disabled={isPending}>
        {isPending ? (
          <span className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-white" />
            <span>Signing in...</span>
          </span>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
