import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema, forgotPasswordSchema } from "@/lib/validations/auth.schema";

describe("Auth Validation Schemas", () => {
  describe("loginSchema", () => {
    it("should pass valid credentials", () => {
      const validData = { email: "admin@bytebulletin.com", password: "AdminPassword123!" };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should fail invalid email format", () => {
      const invalidData = { email: "invalid-email-format", password: "Password123!" };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("valid email address");
      }
    });

    it("should fail password shorter than 8 characters", () => {
      const invalidData = { email: "admin@bytebulletin.com", password: "short" };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("at least 8 characters");
      }
    });
  });

  describe("registerSchema", () => {
    it("should pass valid registration input", () => {
      const validData = {
        name: "John Doe",
        email: "user@bytebulletin.com",
        password: "securepassword",
        confirmPassword: "securepassword",
      };
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should fail when confirmPassword does not match password", () => {
      const MismatchedData = {
        name: "John Doe",
        email: "user@bytebulletin.com",
        password: "securepassword1",
        confirmPassword: "differentpassword",
      };
      const result = registerSchema.safeParse(MismatchedData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords do not match");
      }
    });
  });

  describe("forgotPasswordSchema", () => {
    it("should pass valid email", () => {
      const result = forgotPasswordSchema.safeParse({ email: "user@example.com" });
      expect(result.success).toBe(true);
    });

    it("should fail empty email", () => {
      const result = forgotPasswordSchema.safeParse({ email: "" });
      expect(result.success).toBe(false);
    });
  });
});
