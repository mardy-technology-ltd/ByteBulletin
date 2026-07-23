import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | ByteBulletin",
  description: "Terms and Conditions governing the use of ByteBulletin platform and AI content aggregation services.",
};

export default function TermsPage() {
  return (
    <article className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-foreground">
      <header className="mb-10 text-center space-y-3">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="text-sm text-muted-foreground">
          Last Updated: July 23, 2026 • Please read these terms carefully before accessing ByteBulletin
        </p>
      </header>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">1. Acceptance of Terms</h2>
          <p>
            By accessing or using ByteBulletin (&ldquo;the Website&rdquo;), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access our services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">2. Intellectual Property & Aggregated Content</h2>
          <p>
            ByteBulletin is an AI-powered news aggregator that synthesizes publicly available technology and business news from accredited third-party publishers. All original news titles, trademarks, and source attributions remain the exclusive intellectual property of their respective publishers.
          </p>
          <p>
            ByteBulletin generates unique summaries, key takeaways, and analytical insights using AI algorithms. Re-use of ByteBulletin original summaries without proper canonical citation is strictly prohibited.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">3. User Accounts & Conduct</h2>
          <p>
            Users are responsible for maintaining the confidentiality of account credentials. You agree not to engage in malicious activities, unauthorized scraping, or automated abuse of our APIs and commenting systems.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">4. Limitation of Liability</h2>
          <p>
            ByteBulletin makes every effort to ensure information accuracy via AI fact-verification. However, content is provided &ldquo;as is&rdquo; without warranties of any kind. ByteBulletin shall not be liable for any direct or indirect damages resulting from reliance on news reports or third-party links.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">5. Governing Law</h2>
          <p>
            These terms are governed by and construed in accordance with applicable international web publishing laws and commercial regulations.
          </p>
        </section>
      </div>
    </article>
  );
}
