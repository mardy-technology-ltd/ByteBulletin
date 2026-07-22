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
import { Loader2 } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

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
        <Input id="password" type="password" placeholder="At least 6 characters" {...register("password")} className="rounded-xl" />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full h-11 rounded-xl font-semibold bg-primary hover:bg-primary/90 shadow-md" disabled={isPending}>
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
