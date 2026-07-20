import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Article Validation Schemas
// ─────────────────────────────────────────────────────────────

export const articleFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  categorySlug: z.string().optional(),
  sourceSlug: z.string().optional(),
  search: z.string().max(200).optional(),
  isFeatured: z.coerce.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
});

export const updateArticleSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  excerpt: z.string().min(1).max(1000).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isFeatured: z.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  categoryId: z.string().cuid().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1, "Search query is required").max(200),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  categorySlug: z.string().optional(),
});

export type ArticleFiltersInput = z.infer<typeof articleFiltersSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
