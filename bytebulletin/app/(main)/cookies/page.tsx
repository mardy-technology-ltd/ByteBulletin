import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy & Google Consent Mode v2 | ByteBulletin",
  description: "Comprehensive Cookie Policy explaining tracking cookies, analytics, advertising tags, and Google Consent Mode v2 compliance.",
};

export default function CookiePolicyPage() {
  return (
    <article className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-foreground">
      <header className="mb-10 text-center space-y-3">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground">
          Last Updated: July 23, 2026 • Compliant with EU ePrivacy Directive & Google Consent Mode v2
        </p>
      </header>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">1. What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your computer or mobile device when visiting a web page. They assist in remembering user preferences, authenticating logins, analyzing site performance, and delivering targeted advertisements.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">2. Types of Cookies We Use</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/40 border">
              <h3 className="font-bold text-base text-primary">Essential Session Cookies</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Required for site security, user authentication, theme selection, and core navigation. Cannot be disabled.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/40 border">
              <h3 className="font-bold text-base text-primary">Analytics & Performance Cookies</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Helps us measure site traffic, popular news categories, dwell time, and page speed across Tier-1 geographical regions.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-muted/40 border">
              <h3 className="font-bold text-base text-primary">Targeting & Programmatic Ad Cookies</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Used by Google AdSense, Mediavine, and programmatic partners to serve relevant advertisements based on user browsing signals.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">3. Google Consent Mode v2 Integration</h2>
          <p>
            ByteBulletin strictly enforces **Google Consent Mode v2** for European Union (EEA) and United Kingdom visitors. Before third-party ad tags fire, we transmit explicit consent signals (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`) based on your interaction with our cookie banner.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">4. How to Control Cookie Preferences</h2>
          <p>
            You can modify your cookie choices at any time via the cookie banner at the bottom of our website or through your browser settings:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Google Chrome Settings → Privacy & Security → Cookies</li>
            <li>Mozilla Firefox Settings → Privacy & Security → Enhanced Tracking Protection</li>
            <li>Apple Safari Preferences → Privacy → Block All Cookies</li>
          </ul>
        </section>
      </div>
    </article>
  );
}
