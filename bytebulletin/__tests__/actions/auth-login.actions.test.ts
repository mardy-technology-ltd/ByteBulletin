import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginUser } from "@/actions/auth.actions";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";

// Mock dependencies
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/auth/config", () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  auth: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
  },
  compare: vi.fn(),
}));

describe("auth.actions - loginUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return validation error for invalid email format", async () => {
    const res = await loginUser({ email: "invalid-email", password: "Password123!" });
    expect(res.success).toBe(false);
    expect(res.error).toBe("Invalid credentials format");
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("should return error if user is not found in database", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const res = await loginUser({ email: "nonexistent@bytebulletin.com", password: "Password123!" });
    expect(res.success).toBe(false);
    expect(res.error).toBe("Invalid email or password");
  });

  it("should return error if password comparison fails", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "admin-1",
      email: "admin@bytebulletin.com",
      name: "Developer Admin",
      role: "ADMIN",
      emailVerified: new Date(),
      password: "hashed_password",
    } as any);

    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const res = await loginUser({ email: "admin@bytebulletin.com", password: "WrongPassword!" });
    expect(res.success).toBe(false);
    expect(res.error).toBe("Invalid email or password");
  });

  it("should return success and ADMIN role for valid admin credentials", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "admin-1",
      email: "admin@bytebulletin.com",
      name: "Developer Admin",
      role: "ADMIN",
      emailVerified: new Date(),
      password: "hashed_password",
    } as any);

    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const res = await loginUser({ email: "admin@bytebulletin.com", password: "AdminPass123!" });
    expect(res.success).toBe(true);
    expect(res.role).toBe("ADMIN");
  });
});
