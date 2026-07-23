"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, Mail, CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { subscribeEmailDirectly } from "@/actions/newsletter.actions";

export function ExitIntentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hasSeenModal = localStorage.getItem("bytebulletin_exit_modal_dismissed");
    if (hasSeenModal) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger modal when cursor leaves top of window (Exit Intent)
      if (e.clientY <= 10) {
        setIsOpen(true);
        localStorage.setItem("bytebulletin_exit_modal_dismissed", "true");
        document.removeEventListener("mouseleave", handleMouseLeave);
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsPending(true);
    setError(null);
    try {
      const res = await subscribeEmailDirectly(email);
      if (res.success) {
        setIsSubmitted(true);
        setTimeout(() => setIsOpen(false), 2500);
      } else {
        setError(res.error || "Failed to subscribe");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-900 to-black border border-violet-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-violet-950/60 relative text-white overflow-hidden"
      >
        {/* Glow Ambient Effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10 space-y-5 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h3 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Before You Leave...
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed max-w-sm mx-auto">
              Get our daily executive AI digest covering high-impact tech, enterprise cloud & AI updates in your inbox.
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs text-red-400 bg-red-950/60 border border-red-500/30 rounded-xl">
              {error}
            </div>
          )}

          {isSubmitted ? (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center space-x-2 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-sm">Thank you for subscribing!</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <Input
                  type="email"
                  placeholder="Enter your work email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-11 h-12 rounded-xl bg-slate-950/80 border-gray-700 text-white placeholder:text-gray-500 focus:border-violet-500 text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-600/30 cursor-pointer transition-all active:scale-[0.99]"
              >
                {isPending ? "Subscribing..." : "Get Free AI Intelligence Digest"}
              </Button>
            </form>
          )}

          <div className="flex items-center justify-center space-x-2 text-[11px] text-gray-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-violet-400" />
            <span>Zero Spam. Unsubscribe at any time.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
