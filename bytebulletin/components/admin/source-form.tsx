"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createSource } from "@/actions/admin.actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

const sourceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  feedUrl: z.string().url("Must be a valid URL").min(1, "RSS Feed URL is required"),
  siteUrl: z.string().url("Must be a valid URL").min(1, "Site URL is required"),
  categoryId: z.string().min(1, "Category is required"),
  fetchInterval: z.number().min(5, "Minimum interval is 5 minutes"),
});

type SourceInput = z.infer<typeof sourceSchema>;

interface SourceFormProps {
  categories: { id: string; name: string }[];
}

export function SourceForm({ categories }: SourceFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SourceInput>({
    resolver: zodResolver(sourceSchema),
    defaultValues: {
      name: "",
      feedUrl: "",
      siteUrl: "",
      categoryId: categories[0]?.id || "",
      fetchInterval: 30,
    },
  });

  async function onSubmit(data: SourceInput) {
    setError(null);
    const result = await createSource(data);
    
    if (result.success) {
      router.push("/admin/sources");
    } else {
      setError(result.error || "Something went wrong.");
    }
  }

  return (
    <div className="max-w-2xl bg-card border rounded-lg p-6 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}
        
        <div className="grid gap-6 md:grid-cols-2">
          <div className="col-span-2 space-y-2">
            <label className="text-sm font-medium leading-none">Source Name</label>
            <Input placeholder="e.g. Google News, The Verge" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="col-span-2 md:col-span-1 space-y-2">
            <label className="text-sm font-medium leading-none">RSS Feed URL</label>
            <Input placeholder="https://..." {...register("feedUrl")} />
            <p className="text-xs text-muted-foreground">Link to the XML/RSS feed.</p>
            {errors.feedUrl && <p className="text-sm text-destructive">{errors.feedUrl.message}</p>}
          </div>

          <div className="col-span-2 md:col-span-1 space-y-2">
            <label className="text-sm font-medium leading-none">Root Website URL</label>
            <Input placeholder="https://..." {...register("siteUrl")} />
            <p className="text-xs text-muted-foreground">Main website link.</p>
            {errors.siteUrl && <p className="text-sm text-destructive">{errors.siteUrl.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Category</label>
            <select 
              {...register("categoryId")}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="" disabled>Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Fetch Interval (Minutes)</label>
            <Input type="number" {...register("fetchInterval", { valueAsNumber: true })} />
            {errors.fetchInterval && <p className="text-sm text-destructive">{errors.fetchInterval.message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push("/admin/sources")}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Source
          </Button>
        </div>
      </form>
    </div>
  );
}
