"use client";

import { useState } from "react";
import { Sparkles, Save, Loader2, CheckCircle2, AlertCircle, Link as LinkIcon, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSponsorSettingAction } from "@/actions/sponsor.actions";

interface SponsorConfigCardProps {
  initialSponsor: {
    brandName?: string | null;
    sponsorText?: string | null;
    sponsorLink?: string | null;
    isEnabled: boolean;
  } | null;
}

export function SponsorConfigCard({ initialSponsor }: SponsorConfigCardProps) {
  const [brandName, setBrandName] = useState(initialSponsor?.brandName || "");
  const [sponsorText, setSponsorText] = useState(initialSponsor?.sponsorText || "");
  const [sponsorLink, setSponsorLink] = useState(initialSponsor?.sponsorLink || "");
  const [isEnabled, setIsEnabled] = useState(initialSponsor?.isEnabled ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSaving(true);

    try {
      const res = await updateSponsorSettingAction({
        brandName,
        sponsorText,
        sponsorLink,
        isEnabled,
      });

      if (res.success) {
        setFeedback({ type: "success", text: res.message || "Sponsor banner saved!" });
      } else {
        setFeedback({ type: "error", text: res.error || "Failed to save sponsor banner." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", text: err?.message || "An unexpected error occurred." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-card p-6 shadow-sm space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg leading-tight">Weekly Newsletter Sponsor Banner</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure the active sponsor banner included in your automated weekly newsletter cron.
            </p>
          </div>
        </div>

        {/* Sponsor Toggle Switch */}
        <label className="inline-flex items-center cursor-pointer space-x-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {isEnabled ? "Sponsor Active" : "Sponsor Disabled"}
          </span>
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
        </label>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center space-x-2.5 font-medium ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500"
              : "bg-red-500/10 border border-red-500/30 text-red-500"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="sponsor-brand" className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" /> Sponsor Brand Name
            </Label>
            <Input
              id="sponsor-brand"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g. Notion AI or Vercel"
              className="rounded-xl bg-background border-border/80 text-sm h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sponsor-link" className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5" /> Sponsor Destination Link
            </Label>
            <Input
              id="sponsor-link"
              type="url"
              value={sponsorLink}
              onChange={(e) => setSponsorLink(e.target.value)}
              placeholder="https://example.com?ref=bytebulletin"
              className="rounded-xl bg-background border-border/80 text-sm h-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sponsor-text" className="text-xs font-bold uppercase text-muted-foreground">
            Sponsor Announcement / Promo Offer Text
          </Label>
          <textarea
            id="sponsor-text"
            rows={2}
            value={sponsorText}
            onChange={(e) => setSponsorText(e.target.value)}
            placeholder="e.g. Supercharge your team workflows with Notion AI. Get 20% off your annual subscription today!"
            className="w-full rounded-xl bg-background border border-border/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 leading-relaxed resize-none"
          />
        </div>

        {/* Live Banner Preview Box */}
        {isEnabled && (
          <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30 space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-400">
              Live Banner Preview (In Email)
            </span>
            <div className="text-xs text-foreground font-medium">
              <span className="font-bold text-violet-400 mr-2">[ SPONSORED BY {brandName || "BRAND"} ]</span>
              {sponsorText || "Your sponsor promotional copy will appear here."}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <Button
            type="submit"
            disabled={isSaving}
            size="sm"
            className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs px-5 shadow-md shadow-violet-600/20 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" />
                Save Sponsor Banner
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
