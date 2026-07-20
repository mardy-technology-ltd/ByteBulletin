// ─────────────────────────────────────────────────────────────
// Article domain types — used across all layers
// ─────────────────────────────────────────────────────────────

export type ArticleStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type AISentiment = "POSITIVE" | "NEUTRAL" | "NEGATIVE";

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string | null;
}

export interface ArticleSource {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  siteUrl: string;
}

export interface AISummary {
  id: string;
  summary: string;
  keyPoints: string[];
  sentiment: AISentiment;
  model: string;
  generatedAt: Date;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string | null;
  originalUrl: string;
  imageUrl: string | null;
  author: string | null;
  publishedAt: Date;
  sourceId: string;
  categoryId: string;
  status: ArticleStatus;
  viewCount: number;
  isFeatured: boolean;
  tags: string[];
  readingTime: number;
  createdAt: Date;
  updatedAt: Date;
  source: ArticleSource;
  category: ArticleCategory;
  aiSummary: AISummary | null;
}

// Lightweight card version for list views
export interface ArticleCard {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string | null;
  author: string | null;
  publishedAt: Date;
  readingTime: number;
  viewCount: number;
  isFeatured: boolean;
  tags: string[];
  source: ArticleSource;
  category: ArticleCategory;
  hasAISummary: boolean;
}

// For article creation (RSS ingestion)
export interface CreateArticleDTO {
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  originalUrl: string;
  imageUrl?: string;
  author?: string;
  publishedAt: Date;
  sourceId: string;
  categoryId: string;
  tags?: string[];
  readingTime?: number;
}

// For article queries
export interface ArticleFilters {
  categorySlug?: string;
  sourceSlug?: string;
  status?: ArticleStatus;
  isFeatured?: boolean;
  search?: string;
  tags?: string[];
}

export interface PaginatedArticles {
  articles: ArticleCard[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
}
