export default function BreakingNewsPage() {
  return (
    <div className="container py-10">
      <div className="flex items-center space-x-2 mb-8">
        <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
        <h1 className="font-heading text-4xl font-bold tracking-tight">Breaking News</h1>
      </div>
      <p className="text-muted-foreground">The latest critical updates as they happen.</p>
    </div>
  );
}
