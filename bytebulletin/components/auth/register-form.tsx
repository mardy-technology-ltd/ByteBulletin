"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterInput } from "@/lib/validations/auth.schema";
import { registerUser } from "@/actions/auth.actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsPending(true);
    setError(null);
    try {
      const res = await registerUser(data);
      if (res?.error) {
        setError(res.error);
      } else if (res?.requiresVerification) {
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        router.push("/login?registered=true");
      }
    } catch (err) {
      console.error("Registration submit error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-center">
          {error}
        </div>
      )}
      
      <div className="space-y-1.5">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="John Doe" {...register("name")} className="rounded-xl" />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email Address</Label>
        <Input id="email" type="email" placeholder="john@example.com" {...register("email")} className="rounded-xl" />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="At least 8 characters"
            {...register("password")}
            className="rounded-xl pr-10"
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

      <Button type="submit" className="w-full h-11 rounded-xl font-semibold bg-primary hover:bg-primary/90 shadow-md cursor-pointer" disabled={isPending}>
        {isPending ? (
          <span className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Creating account...</span>
          </span>
        ) : (
          "Sign up"
        )}
      </Button>

      <div className="text-center text-sm text-muted-foreground mt-4">
        Already have an account? <Link href="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
      </div>
    </form>
  );
}
