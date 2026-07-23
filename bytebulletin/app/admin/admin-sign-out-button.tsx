"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "next-auth/react";

export function AdminSignOutButton() {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSigningOut(true);
    setTimeout(() => {
      signOut({ callbackUrl: "/" });
    }, 150);
  };

  return (
    <>
      {isSigningOut && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md text-white animate-in fade-in duration-200">
          <div className="flex flex-col items-center space-y-4 p-8 rounded-3xl bg-slate-900/90 border border-violet-500/30 shadow-2xl max-w-sm text-center">
            <Loader2 className="w-10 h-10 animate-spin text-violet-400" />
            <div>
              <h3 className="text-lg font-bold tracking-tight text-slate-100">Signing Out...</h3>
              <p className="text-xs text-slate-400 mt-1">Clearing your session safely. Redirecting...</p>
            </div>
          </div>
        </div>,
        document.body
      )}

      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-red-500/10 disabled:opacity-50"
        title="Sign out of admin"
      >
        {isSigningOut ? (
          <Loader2 className="w-5 h-5 animate-spin text-red-500" />
        ) : (
          <LogOut className="w-5 h-5" />
        )}
      </button>
    </>
  );
}
