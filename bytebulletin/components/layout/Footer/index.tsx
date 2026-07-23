import { siteConfig } from "@/config/site";
import { NewsletterForm } from "@/components/common/newsletter-form";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-12 md:py-16 bg-slate-950/80 text-foreground border-border/40">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-1 space-y-4">
          <Link href="/" className="font-bold text-2xl inline-block font-heading text-white">
            {siteConfig.name}
          </Link>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            AI-powered tech & business intelligence delivering synthesized summaries, curated by category for Tier-1 readers.
          </p>
          <p className="text-xs text-muted-foreground pt-2">
            © {new Date().getFullYear()} {siteConfig.name} — Published on <a href="https://thebytebulletin.com" className="hover:underline text-primary">thebytebulletin.com</a>. All rights reserved.
          </p>
        </div>
        
        <div className="col-span-1 space-y-3">
          <h4 className="font-semibold text-sm uppercase tracking-wider text-primary">Categories</h4>
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            <li><Link href="/category/technology" className="hover:text-primary transition-colors">Technology & AI</Link></li>
            <li><Link href="/category/business" className="hover:text-primary transition-colors">Business & SaaS</Link></li>
            <li><Link href="/category/science" className="hover:text-primary transition-colors">Science & EV Tech</Link></li>
            <li><Link href="/category/health" className="hover:text-primary transition-colors">Health & Biotech</Link></li>
            <li><Link href="/category/sports" className="hover:text-primary transition-colors">Sports & Entertainment</Link></li>
          </ul>
        </div>

        <div className="col-span-1 space-y-3">
          <h4 className="font-semibold text-sm uppercase tracking-wider text-primary">Legal & Privacy</h4>
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy (GDPR/CCPA)</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy & Consent</Link></li>
            <li><Link href="/disclosures" className="hover:text-primary transition-colors">Affiliate & Ad Disclosure</Link></li>
          </ul>
        </div>

        <div className="col-span-1 space-y-3">
          <h4 className="font-semibold text-sm uppercase tracking-wider text-primary">Executive Newsletter</h4>
          <p className="text-xs text-muted-foreground">Get daily AI-summarized insights straight to your inbox.</p>
          <NewsletterForm />
        </div>
      </div>
    </footer>
  );
}
