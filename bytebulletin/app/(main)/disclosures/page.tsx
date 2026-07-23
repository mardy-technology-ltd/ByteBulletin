import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate & Advertising Disclosure | ByteBulletin",
  description: "Transparency disclosure regarding affiliate links, advertising revenue, and sponsored content policies on ByteBulletin.",
};

export default function DisclosuresPage() {
  return (
    <article className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-foreground">
      <header className="mb-10 text-center space-y-3">
        <h1 className="font-heading text-4xl font-extrabold tracking-tight">Affiliate & Advertising Disclosure</h1>
        <p className="text-sm text-muted-foreground">
          Last Updated: July 23, 2026 • Full Transparency Statement for Readers
        </p>
      </header>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-sm sm:text-base leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">1. FTC & Regulatory Compliance</h2>
          <p>
            In accordance with Federal Trade Commission (FTC) guidelines and international advertising standards, ByteBulletin maintains full transparency regarding our revenue sources, commercial partnerships, and affiliate relationships.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">2. Display Advertising</h2>
          <p>
            ByteBulletin displays digital advertisements managed by Google AdSense, Mediavine, and programmatic partners. These network ads are clearly demarcated from editorial content and do not influence our AI aggregation algorithms or news coverage priorities.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">3. Affiliate Links & Recommendations</h2>
          <p>
            Some articles and tool recommendations contain affiliate links (such as SaaS subscriptions, enterprise AI tools, cloud hosting, or hardware). If you click an affiliate link and make a purchase, ByteBulletin may earn a commercial commission at no additional cost to you.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-heading">4. Editorial Independence</h2>
          <p>
            Our AI curation pipeline and human editorial reviews operate independently of commercial arrangements. Advertisers and affiliate partners cannot pay to manipulate news accuracy or artificially alter AI key takeaways.
          </p>
        </section>
      </div>
    </article>
  );
}
