import { FolderSearch, AlertCircle } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: "search" | "error";
}

export function EmptyState({ 
  title = "No results found", 
  description = "We couldn't find anything matching your criteria.",
  icon = "search"
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed rounded-xl bg-muted/20">
      <div className="bg-muted p-4 rounded-full mb-4">
        {icon === "search" ? (
          <FolderSearch className="w-8 h-8 text-muted-foreground" />
        ) : (
          <AlertCircle className="w-8 h-8 text-muted-foreground" />
        )}
      </div>
      <h3 className="text-xl font-heading font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm">
        {description}
      </p>
    </div>
  );
}
