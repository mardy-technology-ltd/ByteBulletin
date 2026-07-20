// ─────────────────────────────────────────────────────────────
// Source (RSS Feed) domain types
// ─────────────────────────────────────────────────────────────

export type FetchStatus = "SUCCESS" | "FAILED" | "PARTIAL";

export interface Source {
  id: string;
  name: string;
  slug: string;
  feedUrl: string;
  siteUrl: string;
  logoUrl: string | null;
  categoryId: string;
  isActive: boolean;
  fetchInterval: number; // minutes
  lastFetchedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SourceWithCategory extends Source {
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  _count?: {
    articles: number;
  };
}

export interface CreateSourceDTO {
  name: string;
  feedUrl: string;
  siteUrl: string;
  logoUrl?: string;
  categoryId: string;
  fetchInterval?: number;
}

export interface UpdateSourceDTO {
  name?: string;
  feedUrl?: string;
  siteUrl?: string;
  logoUrl?: string;
  categoryId?: string;
  isActive?: boolean;
  fetchInterval?: number;
}

export interface RssFetchLog {
  id: string;
  sourceId: string;
  status: FetchStatus;
  articlesFound: number;
  articlesCreated: number;
  error: string | null;
  duration: number; // ms
  fetchedAt: Date;
}

export interface SourceHealth {
  source: SourceWithCategory;
  lastLog: RssFetchLog | null;
  successRate: number; // 0-100
  avgDuration: number; // ms
}
