import { siteConfig } from "@/config/site";
import { NewsletterForm } from "@/components/common/newsletter-form";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t py-12 md:py-16 bg-muted/20">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2 space-y-4">
          <Link href="/" className="font-bold text-2xl inline-block font-heading">
            {siteConfig.name}
          </Link>
          <p className="text-sm text-muted-foreground max-w-sm">
            {siteConfig.description}
          </p>
          <p className="text-sm text-muted-foreground pt-4">
            Built by {siteConfig.creator}.{" "}
            <a href={siteConfig.links.github} target="_blank" rel="noreferrer" className="font-medium underline underline-offset-4 hover:text-primary">
              GitHub
            </a>
          </p>
        </div>
        
        <div className="col-span-1 space-y-4">
          <h4 className="font-semibold">Categories</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/category/technology" className="hover:text-primary transition-colors">Technology</Link></li>
            <li><Link href="/category/business" className="hover:text-primary transition-colors">Business</Link></li>
            <li><Link href="/category/science" className="hover:text-primary transition-colors">Science</Link></li>
          </ul>
        </div>

        <div className="col-span-1 space-y-4">
          <h4 className="font-semibold">Newsletter</h4>
          <p className="text-sm text-muted-foreground">Get the daily AI-summarized digest.</p>
          <NewsletterForm />
        </div>
      </div>
    </footer>
  );
}
