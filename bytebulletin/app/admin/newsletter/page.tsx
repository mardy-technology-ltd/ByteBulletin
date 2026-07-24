import { Metadata } from "next";
import { getNewsletterSubscribersAction } from "@/actions/newsletter.actions";
import { Mail, Users, CheckCircle2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ExportCsvButton } from "./export-csv-button";
import { BroadcastModal } from "./broadcast-modal";

export const metadata: Metadata = {
  title: "Newsletter Subscribers | ByteBulletin Admin",
  description: "Manage and view all email subscribers captured via Exit-Intent modal and footer signup forms.",
};

export default async function AdminNewsletterPage() {
  const { subscribers } = await getNewsletterSubscribersAction();

  const activeCount = subscribers.filter((s: any) => s.status === "ACTIVE").length;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight flex items-center gap-2">
            <Mail className="w-8 h-8 text-primary" />
            <span>Newsletter Subscribers</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time subscriber leads captured via Exit-Intent popup and footer signup forms.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary border-primary/30">
            Total Leads: {subscribers.length}
          </Badge>
          <ExportCsvButton subscribers={subscribers} />
          <BroadcastModal totalSubscribers={activeCount} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-card border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Total Subscribers</span>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <p className="text-3xl font-extrabold font-heading text-foreground">{subscribers.length}</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Active Leads</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold font-heading text-emerald-500">{activeCount}</p>
        </div>

        <div className="p-6 rounded-2xl bg-card border shadow-sm space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Sender Domain</span>
            <Mail className="w-5 h-5 text-violet-500" />
          </div>
          <p className="text-lg font-bold font-heading text-violet-400 truncate">mail.thebytebulletin.com</p>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        <div className="p-5 border-b bg-muted/30 flex items-center justify-between">
          <h3 className="font-bold font-heading text-lg">Subscriber List ({subscribers.length})</h3>
        </div>

        {subscribers.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            <Mail className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p className="font-medium">No subscribers recorded yet.</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Subscribers from the Exit-Intent popup and footer form will appear here in real-time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b text-xs font-bold uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-3.5">#</th>
                  <th className="px-6 py-3.5">Subscriber Email</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subscribers.map((item: any, idx: number) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{idx + 1}</td>
                    <td className="px-6 py-4 font-semibold text-foreground">{item.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">
                      <span className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
