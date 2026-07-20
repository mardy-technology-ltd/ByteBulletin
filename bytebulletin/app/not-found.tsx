import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <h1 className="font-heading text-8xl font-extrabold tracking-tight mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">This story doesn&apos;t exist.</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link href="/">
        <Button size="lg">Back to Frontpage</Button>
      </Link>
    </div>
  );
}
