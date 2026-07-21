import { prisma } from "@/lib/db/prisma";
import { SourceForm } from "@/components/admin/source-form";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Add New Source - Admin",
};

export default async function NewSourcePage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 w-full">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/sources">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold">Add RSS Source</h1>
          <p className="text-muted-foreground">Register a new feed to automatically fetch articles.</p>
        </div>
      </div>
      
      <SourceForm categories={categories} />
    </div>
  );
}
