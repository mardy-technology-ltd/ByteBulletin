"use client";

import { useState } from "react";
import { Sparkles, Mail, CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import { subscribeEmailDirectly } from "@/actions/newsletter.actions";

export function InlineCtaBanner() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await subscribeEmailDirectly(email);
      if (res.success) {
        setStatus("success");
        setMessage("Welcome aboard! You're now subscribed to Executive Briefings.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(res.error || "Failed to subscribe. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("An unexpected error occurred.");
    }
  };

  return (
    <div className="w-full my-12 relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 p-6 sm:p-10 shadow-2xl">
      {/* Background Glowing Orbs */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Content */}
        <div className="space-y-3 text-center lg:text-left flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/15 border border-violet-500/30 text-violet-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Executive Intelligence
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-100 tracking-tight leading-tight">
            Stay Ahead of the AI Revolution
          </h2>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Get daily synthesized executive AI summaries, breakthrough news, and technical market insights delivered straight to your inbox.
          </p>
          <div className="flex items-center justify-center lg:justify-start gap-4 text-xs text-slate-400 pt-1">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> No Spam</span>
            <span>•</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-violet-400" /> 1-Click Unsubscribe</span>
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full lg:w-96 shrink-0">
          {status === "success" ? (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs text-center font-medium space-y-1">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
              <p className="font-bold text-sm">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="Enter your professional email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-violet-500 transition-colors shadow-inner"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{status === "loading" ? "Subscribing..." : "Get Free AI Intelligence"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {status === "error" && (
                <p className="text-[11px] text-rose-400 text-center font-medium">{message}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
