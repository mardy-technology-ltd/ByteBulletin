// ─────────────────────────────────────────────────────────────
// User domain types
// ─────────────────────────────────────────────────────────────

export type UserRole = "USER" | "ADMIN";
export type DigestFrequency = "DAILY" | "WEEKLY";
export type ThemePreference = "LIGHT" | "DARK" | "SYSTEM";

export interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  image: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreference {
  id: string;
  userId: string;
  followedCategories: string[];
  emailDigest: boolean;
  digestFrequency: DigestFrequency;
  theme: ThemePreference;
}

export interface UserWithPreferences extends User {
  preferences: UserPreference | null;
}

export interface UpdateProfileDTO {
  name?: string;
  image?: string;
}

export interface UpdatePreferencesDTO {
  followedCategories?: string[];
  emailDigest?: boolean;
  digestFrequency?: DigestFrequency;
  theme?: ThemePreference;
}

// Session user (returned from Auth.js)
export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
}
