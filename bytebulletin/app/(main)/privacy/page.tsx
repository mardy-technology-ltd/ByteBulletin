import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | ByteBulletin",
  description: "ByteBulletin Privacy Policy compliant with EU GDPR, UK GDPR, and California CCPA/CPRA data protection regulations.",
};

export default function PrivacyPage() {
  return (
    <article className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-foreground">
      <header className="mb-10 text-center space-y-3">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">
          Last Updated: July 23, 2026 • Compliant with EU GDPR, UK GDPR & California CCPA/CPRA
        </p>
      </header>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">1. Introduction</h2>
          <p>
            ByteBulletin (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your privacy and is committed to protecting user personal data. This Privacy Policy informs readers about how we collect, process, and safeguard personal information when visiting ByteBulletin, in compliance with the European Union General Data Protection Regulation (EU GDPR), United Kingdom GDPR, and the California Consumer Privacy Act (CCPA/CPRA).
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">2. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Usage Data & Device Information:</strong> IP address, browser type, device identifiers, geographic location (country/city level), operating system, referring URLs, and page interaction metrics.
            </li>
            <li>
              <strong>Account Data:</strong> Name, email address, password hash, and profile details when registering or subscribing to our daily AI digest.
            </li>
            <li>
              <strong>Cookies & Tracking Identifiers:</strong> Essential session cookies, analytical cookies, and advertising beacons used to personalize news feeds and serve relevant advertisements.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">3. Google AdSense & Advertising Networks</h2>
          <p>
            ByteBulletin uses third-party advertising partners, including Google AdSense, Mediavine, and affiliated programmatic networks. These platforms use cookies and web beacons to serve ads based on prior visits to our site or other web pages.
          </p>
          <p>
            Users may opt out of personalized advertising by visiting{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Google Ads Settings
            </a>{" "}
            or{" "}
            <a
              href="https://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              AboutAds.info
            </a>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">4. Your Data Protection Rights (GDPR & CCPA)</h2>
          <p>Depending on your jurisdiction (European Union, UK, or USA), you possess specific data privacy rights:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Right to Access & Rectification:</strong> Request copies of your personal data.</li>
            <li><strong>Right to Erasure (&ldquo;Right to be Forgotten&rdquo;):</strong> Request deletion of stored personal data.</li>
            <li><strong>Do Not Sell or Share My Personal Information (CCPA/CPRA):</strong> California residents may opt out of data sharing for cross-context behavioral advertising.</li>
            <li><strong>Google Consent Mode v2 Signals:</strong> We respect your granular consent choices regarding analytics and ad storage signals.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">5. Data Retention & Contact Information</h2>
          <p>
            We retain personal information only for as long as necessary to provide services and comply with legal obligations. For privacy requests or questions regarding data protection, contact our Data Protection Officer at:
          </p>
          <p className="font-semibold text-primary">privacy@bytebulletin.com</p>
        </section>
      </div>
    </article>
  );
}
