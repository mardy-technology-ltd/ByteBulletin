// ─────────────────────────────────────────────────────────────
// API & Server Action response types
// ─────────────────────────────────────────────────────────────

// Generic server action result — all Server Actions return this shape
export type ActionResult<T = undefined> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// Pagination metadata
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Generic paginated response
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Query options for list endpoints
export interface QueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Cron job response
export interface CronJobResult {
  success: boolean;
  message: string;
  processed?: number;
  errors?: string[];
  duration: number; // ms
}
