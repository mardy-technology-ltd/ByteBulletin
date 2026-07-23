import { Metadata } from "next";
import { getAdminLogsData } from "@/actions/admin-logs.actions";
import { Activity, CheckCircle2, AlertTriangle, Clock, Rss, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata: Metadata = {
  title: "System & RSS Fetch Logs | ByteBulletin Admin",
  description: "Monitor real-time RSS crawler activity, automated fetch durations, and error trace logs.",
};

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = parseInt(page || "1", 10);
  const res = await getAdminLogsData(currentPage, 25);

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight flex items-center gap-2">
            <Activity className="w-8 h-8 text-primary" />
            <span>System & Crawler Activity Logs</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track automated RSS ingestion jobs, execution times, and background crawler health.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="px-3 py-1.5 text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
            Success: {res.successCount}
          </Badge>
          {res.failedCount > 0 && (
            <Badge variant="outline" className="px-3 py-1.5 text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30">
              Errors: {res.failedCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Logs Table Card */}
      <div className="rounded-2xl border bg-card shadow-xs overflow-hidden">
        <div className="p-5 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-bold font-heading text-lg flex items-center gap-2">
            <Rss className="w-5 h-5 text-primary" />
            <span>Crawler Logs ({res.totalCount})</span>
          </h3>
        </div>

        {res.logs.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            <Activity className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium">No system logs recorded yet.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Crawler activity logs will populate automatically when RSS feeds are synced.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b text-xs font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Source</th>
                  <th className="px-6 py-3.5">Articles Created</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Fetched At</th>
                  <th className="px-6 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {res.logs.map((log: any) => {
                  const isSuccess = log.status === "SUCCESS";
                  return (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        {isSuccess ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>SUCCESS</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>FAILED</span>
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 font-semibold text-foreground">
                        {log.source?.name || "Global RSS Worker"}
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-xs text-primary">
                        +{log.articlesCreated} new ({log.articlesFound} found)
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {log.duration} ms
                      </td>

                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        <span className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(log.fetchedAt).toLocaleString("en-US")}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs">
                        {log.error ? (
                          <span className="text-rose-500 font-mono text-[11px] line-clamp-1 max-w-xs" title={log.error}>
                            {log.error}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-[11px]">Clean execution</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {res.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-4">
          {res.currentPage > 1 && (
            <Link
              href={`/admin/logs?page=${res.currentPage - 1}`}
              className="px-4 py-2 text-xs font-semibold rounded-xl border bg-card hover:bg-muted transition-colors"
            >
              Previous Page
            </Link>
          )}

          <span className="text-xs font-bold text-muted-foreground px-3">
            Page {res.currentPage} of {res.totalPages}
          </span>

          {res.currentPage < res.totalPages && (
            <Link
              href={`/admin/logs?page=${res.currentPage + 1}`}
              className="px-4 py-2 text-xs font-semibold rounded-xl border bg-card hover:bg-muted transition-colors"
            >
              Next Page
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
