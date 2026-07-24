import type { Metadata } from "next";

export const siteConfig = {
  name: "ByteBulletin",
  description:
    "AI-powered news aggregator delivering the world's top stories with Gemini-powered summaries, curated by category, in real time.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://thebytebulletin.com",
  ogImage: "/og-image.png",
  links: {
    twitter: "https://twitter.com/bytebulletin",
    github: "https://github.com/bytebulletin",
  },
  creator: "ByteBulletin Team",
  keywords: [
    "news",
    "AI news",
    "news aggregator",
    "Gemini AI",
    "tech news",
    "breaking news",
    "news summary",
    "ByteBulletin",
  ],
};

export type SiteConfig = typeof siteConfig;

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — AI-Powered News Aggregator`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.creator }],
  creator: siteConfig.creator,
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@bytebulletin",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },
};
