import { Skeleton } from "@/components/ui/skeleton";

export default function NewsDetailLoading() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8 sm:py-12 animate-pulse">
      {/* Category & Source Badges Skeleton */}
      <div className="flex items-center space-x-3 mb-6">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-5 w-32 rounded-md" />
      </div>

      {/* Article Title Skeleton */}
      <div className="space-y-3 mb-6">
        <Skeleton className="h-10 sm:h-12 w-full rounded-xl" />
        <Skeleton className="h-10 sm:h-12 w-3/4 rounded-xl" />
      </div>

      {/* Date & Reading Time Skeleton */}
      <div className="flex items-center space-x-4 mb-8">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-20 rounded-md" />
      </div>

      {/* Featured Image Skeleton */}
      <Skeleton className="w-full aspect-video rounded-2xl mb-10 shadow-lg" />

      {/* AI Summary Box Skeleton */}
      <div className="rounded-3xl border border-border/40 bg-card/40 p-6 sm:p-8 space-y-4 mb-10">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-9 h-9 rounded-2xl" />
            <Skeleton className="h-6 w-40 rounded-md" />
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
        <Skeleton className="h-16 w-full rounded-2xl" />
        <div className="space-y-2.5 pt-2">
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>

      {/* Article Content Lines Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-full rounded-md" />
        <Skeleton className="h-5 w-full rounded-md" />
        <Skeleton className="h-5 w-5/6 rounded-md" />
        <Skeleton className="h-5 w-4/5 rounded-md" />
        <Skeleton className="h-5 w-full rounded-md" />
        <Skeleton className="h-5 w-3/4 rounded-md" />
      </div>
    </article>
  );
}
