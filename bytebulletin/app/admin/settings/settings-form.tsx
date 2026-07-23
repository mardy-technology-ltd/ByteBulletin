"use client";

import { useState } from "react";
import { updateGlobalSettingsAction } from "@/actions/admin-settings.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle, Save, Globe, Sparkles, ShieldCheck } from "lucide-react";

interface SettingsFormProps {
  initialSettings: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    takeawaysCount: string;
    autoAiSummary: string;
    consentModeV2: string;
  };
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateGlobalSettingsAction(formData);
      if (res.success) {
        setSuccessMsg(res.message || "Settings updated successfully!");
      } else {
        setErrorMsg(res.error || "Failed to update settings");
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 flex items-center space-x-2 text-sm font-semibold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300 flex items-center space-x-2 text-sm font-semibold animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Section 1: General Branding Settings */}
      <div className="p-6 rounded-2xl border bg-card space-y-5 shadow-xs">
        <div className="flex items-center space-x-2 border-b pb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-bold font-heading text-lg">General Brand & Meta Settings</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="siteName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Site Brand Name
            </Label>
            <Input
              id="siteName"
              name="siteName"
              defaultValue={initialSettings.siteName}
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactEmail" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Support & Compliance Email
            </Label>
            <Input
              id="contactEmail"
              name="contactEmail"
              type="email"
              defaultValue={initialSettings.contactEmail}
              required
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="siteDescription" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Default Meta Description
          </Label>
          <Textarea
            id="siteDescription"
            name="siteDescription"
            defaultValue={initialSettings.siteDescription}
            rows={3}
            required
            className="rounded-xl resize-none text-sm"
          />
        </div>
      </div>

      {/* Section 2: AI Summarization Engine Preferences */}
      <div className="p-6 rounded-2xl border bg-card space-y-5 shadow-xs">
        <div className="flex items-center space-x-2 border-b pb-4">
          <Sparkles className="w-5 h-5 text-violet-500" />
          <h3 className="font-bold font-heading text-lg">AI Summarization Preferences (Gemini & Groq)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="takeawaysCount" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Default Takeaways Per Story
            </Label>
            <Input
              id="takeawaysCount"
              name="takeawaysCount"
              type="number"
              min={3}
              max={6}
              defaultValue={initialSettings.takeawaysCount}
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Active LLM Engine
            </Label>
            <div className="h-11 px-4 rounded-xl border bg-muted/40 flex items-center font-mono text-xs font-bold text-violet-500">
              ⚡ Gemini 1.5 Pro / Groq Llama-3 Speed Engine
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Legal & Consent Mode Settings */}
      <div className="p-6 rounded-2xl border bg-card space-y-5 shadow-xs">
        <div className="flex items-center space-x-2 border-b pb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold font-heading text-lg">GDPR, CCPA & Google Consent Mode v2</h3>
        </div>

        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Google Consent Mode v2 Status: Active & Transmitting Signals</span>
          </div>
          <p>
            European Union (GDPR) and California (CCPA) data privacy consent standards are enforced globally across all Tier-1 visitor sessions.
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isPending}
          className="px-8 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm shadow-md cursor-pointer transition-all active:scale-95"
        >
          {isPending ? (
            "Saving Settings..."
          ) : (
            <span className="flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Save Configuration Changes</span>
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}
