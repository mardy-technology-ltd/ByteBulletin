import { Sparkles, ExternalLink, Zap, ShieldCheck } from "lucide-react";

interface AffiliateBannerCardProps {
  categorySlug?: string;
}

export function AffiliateBannerCard({ categorySlug }: AffiliateBannerCardProps) {
  // Select contextual affiliate offer based on category
  let offer = {
    badge: "Recommended AI Tool",
    title: "Accelerate your AI Workflows with Jasper AI",
    description: "Create enterprise-grade marketing content, code summaries, and strategy reports 5x faster.",
    cta: "Claim 10,000 Free Credits ↗",
    url: "https://jasper.ai",
    tag: "SPECIAL PARTNER OFFER",
  };

  if (categorySlug === "security" || categorySlug === "cybersecurity") {
    offer = {
      badge: "Top Security Deal",
      title: "Protect Enterprise Networks with NordVPN Teams",
      description: "Zero-Trust network architecture and military-grade encryption for remote tech teams.",
      cta: "Get 68% Off Enterprise Plan ↗",
      url: "https://nordvpn.com",
      tag: "CYBERSECURITY PICK",
    };
  } else if (categorySlug === "business" || categorySlug === "saas") {
    offer = {
      badge: "High-Growth SaaS",
      title: "Scale Cloud Infrastructure on Cloudways Managed Hosting",
      description: "Ultra-fast NVMe cloud hosting with 24/7 expert support and automated backups.",
      cta: "Start 3-Day Free Trial ↗",
      url: "https://cloudways.com",
      tag: "EXECUTIVE TECH CHOICE",
    };
  }

  return (
    <div className="my-8 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-violet-500/30 shadow-xl backdrop-blur-xl relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
        <div className="space-y-2 flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-violet-400 bg-violet-500/15 border border-violet-500/30 px-2.5 py-0.5 rounded-full">
              <Zap className="w-3 h-3 inline mr-1 fill-current" /> {offer.badge}
            </span>
            <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">
              {offer.tag}
            </span>
          </div>

          <h4 className="font-heading font-extrabold text-lg sm:text-xl text-white leading-snug">
            {offer.title}
          </h4>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-xl">
            {offer.description}
          </p>
        </div>

        <a
          href={offer.url}
          target="_blank"
          rel="noopener noreferrer shadow-lg"
          className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-md shadow-violet-600/30 transition-all hover:scale-[1.02] active:scale-95 shrink-0 cursor-pointer"
        >
          <span>{offer.cta}</span>
        </a>
      </div>

      <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-violet-400" /> Verified Partner Offer
        </span>
        <span>Sponsored Partner Listing</span>
      </div>
    </div>
  );
}
