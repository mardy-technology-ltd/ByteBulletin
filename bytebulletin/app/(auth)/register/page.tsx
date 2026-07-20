import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-xl shadow-lg border">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block text-2xl font-heading font-bold tracking-tight mb-2">
            ByteBulletin
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Sign up to get AI-curated news tailored to you
          </p>
        </div>
        
        <RegisterForm />
        
      </div>
    </div>
  );
}
