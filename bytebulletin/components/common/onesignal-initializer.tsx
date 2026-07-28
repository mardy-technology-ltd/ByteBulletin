"use client";

import { useEffect } from "react";

// Add TypeScript declaration for OneSignalDeferred on the window object
declare global {
  interface Window {
    OneSignalDeferred: any[];
  }
}

export function OneSignalInitializer() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function (OneSignal: any) {
        try {
          await OneSignal.init({
            appId: "bcc4b120-a664-4be8-ada5-8a7f9081e86f",
            notifyButton: {
              enable: true,
              displayPredicate: () => true,
            },
            allowLocalhostAsSecureOrigin: true, // Allow testing on localhost
            autoResubscribe: true,
          });
        } catch (error) {
          console.warn("OneSignal initialization failed (likely due to localhost origin):", error);
        }
      });
    }
  }, []);

  return null;
}
