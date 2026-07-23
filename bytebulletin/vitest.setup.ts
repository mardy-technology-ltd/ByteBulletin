import "@testing-library/jest-dom";
import React from "react";
import { vi, afterEach } from "vitest";

// Cleanup DOM after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock Next.js Image component
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => React.createElement("img", { ...props, alt: (props.alt as string) || "" }),
}));

// Mock next-auth
vi.mock("next-auth", () => ({
  default: vi.fn(() => ({
    handlers: { GET: vi.fn(), POST: vi.fn() },
    signIn: vi.fn(),
    signOut: vi.fn(),
    auth: vi.fn(),
  })),
  AuthError: class AuthError extends Error {},
}));

