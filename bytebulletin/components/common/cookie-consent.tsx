"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("bytebulletin_cookie_consent");
    if (!consent) {
      // Show consent banner after 1 second delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("bytebulletin_cookie_consent", "all");
    setIsVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem("bytebulletin_cookie_consent", "essential");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Privacy and Cookie Consent"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-5 rounded-3xl bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-xl border border-violet-500/30 text-white shadow-2xl shadow-violet-950/40 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2 text-violet-400">
          <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-400/30">
            <Cookie className="w-5 h-5 text-violet-400" />
          </div>
          <span className="font-heading font-bold text-sm tracking-tight text-white">
            Privacy & Cookie Choices (GDPR / CCPA)
          </span>
        </div>
        <button
          onClick={handleEssentialOnly}
          className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer"
          aria-label="Close cookie banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed mb-4">
        We use cookies and analytics to enhance your reading experience, personalize high-CPC tech news, and measure traffic in accordance with US (CCPA) and EU (GDPR) data privacy standards.
      </p>

      <div className="flex items-center space-x-2">
        <Button
          onClick={handleAcceptAll}
          className="flex-1 h-9 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-violet-600/30 cursor-pointer transition-all active:scale-95"
        >
          Accept All
        </Button>
        <Button
          onClick={handleEssentialOnly}
          variant="outline"
          className="h-9 rounded-xl border-gray-700 hover:bg-slate-800 text-gray-300 font-semibold text-xs cursor-pointer transition-all"
        >
          Essential Only
        </Button>
      </div>
    </aside>
  );
}
