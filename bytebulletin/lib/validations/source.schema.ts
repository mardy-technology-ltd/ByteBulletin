import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Source (RSS Feed) Validation Schemas
// ─────────────────────────────────────────────────────────────

export const createSourceSchema = z.object({
  name: z
    .string()
    .min(2, "Source name must be at least 2 characters")
    .max(100, "Source name cannot exceed 100 characters"),
  feedUrl: z
    .string()
    .url("Please enter a valid RSS feed URL")
    .min(1, "RSS feed URL is required"),
  siteUrl: z
    .string()
    .url("Please enter a valid website URL")
    .min(1, "Website URL is required"),
  logoUrl: z.string().url("Please enter a valid logo URL").optional().or(z.literal("")),
  categoryId: z.string().cuid("Invalid category selected"),
  fetchInterval: z
    .number()
    .int()
    .min(5, "Minimum fetch interval is 5 minutes")
    .max(1440, "Maximum fetch interval is 1440 minutes (24 hours)")
    .default(30),
});

export const updateSourceSchema = createSourceSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateSourceInput = z.infer<typeof createSourceSchema>;
export type UpdateSourceInput = z.infer<typeof updateSourceSchema>;
