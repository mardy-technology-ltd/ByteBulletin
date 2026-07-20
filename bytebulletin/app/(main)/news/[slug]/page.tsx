import { AISummarySnippet } from "@/components/common/ai-summary-snippet";
import { ShareBar } from "@/components/common/share-bar";
import { ProgressBar } from "@/components/common/progress-bar";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  // Mock data for metadata (In production: fetch from Prisma SeoMetadata)
  const title = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  const description = `Read the latest AI-summarized insights about ${title} on ByteBulletin.`;
  const url = `https://bytebulletin.com/news/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      publishedTime: new Date().toISOString(),
      authors: ["ByteBulletin AI"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
interface NewsDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewsDetailsPage({ params }: NewsDetailsPageProps) {
  const { slug } = await params;

  // Mock data
  const summaryPoints = [
    "OpenAI has officially announced the release date for GPT-5, slated for Q4 2026.",
    "The new model promises human-level reasoning capabilities across complex scientific domains.",
    "Developers will have early access starting next month via the new API endpoints."
  ];

  // JSON-LD Structured Data for Google News
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    "image": [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=800&auto=format&fit=crop"
    ],
    "datePublished": new Date().toISOString(),
    "dateModified": new Date().toISOString(),
    "author": [{
      "@type": "Organization",
      "name": "ByteBulletin AI",
      "url": "https://bytebulletin.com"
    }]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProgressBar />
      <article className="container py-10 max-w-3xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Technology</span>
            <span className="text-muted-foreground text-sm">•</span>
            <span className="text-muted-foreground text-sm">TechCrunch</span>
          </div>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            {slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </h1>
          <div className="flex items-center text-muted-foreground space-x-4 text-sm font-medium">
            <span>By ByteBulletin AI</span>
            <span>•</span>
            <time dateTime={new Date().toISOString()}>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
            <span>•</span>
            <span>5 min read</span>
          </div>
        </header>
        
        <AISummarySnippet summaryPoints={summaryPoints} />

        <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-primary hover:prose-a:text-primary/80 prose-img:rounded-xl">
          <p className="lead text-xl text-muted-foreground mb-8">
            Artificial intelligence research lab OpenAI has set a definitive timeline for its highly anticipated next-generation model, GPT-5, bringing months of intense speculation to a close.
          </p>
          
          <h2>The Path to AGI?</h2>
          <p>
            According to the official press release, the new architecture represents a fundamental shift in how large language models process context. By integrating continuous learning mechanisms, GPT-5 is capable of adapting its knowledge base in real-time without requiring full parameter retuning.
          </p>
          
          <blockquote className="border-l-4 border-primary pl-4 italic my-8 text-xl text-muted-foreground">
            &quot;We are no longer just predicting the next token; we are synthesizing logic trees that rival human cognitive processes.&quot;
          </blockquote>
          
          <h2>Developer Access</h2>
          <p>
            While the general public will need to wait until the holiday season, enterprise partners and selected developers will gain API access starting next month. The pricing structure is expected to be announced at their upcoming developer conference.
          </p>
        </div>

        <ShareBar url={`https://bytebulletin.com/news/${slug}`} title={`Read about ${slug} on ByteBulletin`} />
      </article>
    </>
  );
}
