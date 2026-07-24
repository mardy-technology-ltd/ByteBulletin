"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportCsvButtonProps {
  subscribers: Array<{
    id: string;
    email: string;
    status: string;
    createdAt: Date | string;
  }>;
}

export function ExportCsvButton({ subscribers }: ExportCsvButtonProps) {
  const handleExport = () => {
    if (!subscribers || subscribers.length === 0) return;

    // Build CSV content
    const headers = ["ID", "Email", "Status", "Subscribed Date"];
    const rows = subscribers.map((sub, index) => [
      index + 1,
      `"${sub.email}"`,
      sub.status,
      `"${new Date(sub.createdAt).toISOString()}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `bytebulletin_subscribers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      onClick={handleExport}
      disabled={!subscribers || subscribers.length === 0}
      variant="outline"
      size="sm"
      className="rounded-xl border-border/80 hover:bg-muted/80 text-xs font-semibold cursor-pointer"
    >
      <Download className="w-4 h-4 mr-1.5 text-primary" />
      <span>Export CSV</span>
    </Button>
  );
}
