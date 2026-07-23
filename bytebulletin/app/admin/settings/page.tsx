import { Metadata } from "next";
import { getGlobalSettingsAction } from "@/actions/admin-settings.actions";
import { SettingsForm } from "./settings-form";
import { Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "Global System Settings | ByteBulletin Admin",
  description: "Configure site metadata, AI summarization defaults, legal disclosures, and system settings.",
};

export default async function AdminSettingsPage() {
  const res = await getGlobalSettingsAction();

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight flex items-center gap-2">
            <Settings className="w-8 h-8 text-primary" />
            <span>Global System Settings</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage site metadata, AI engine parameters, and compliance configurations.
          </p>
        </div>
      </div>

      {/* Settings Form */}
      <SettingsForm initialSettings={res.settings} />
    </div>
  );
}
