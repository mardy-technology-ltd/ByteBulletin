import { describe, it, expect } from "vitest";
import { getArticleImage } from "@/lib/utils/image";

describe("getArticleImage utility", () => {
  it("should return the original URL if valid", () => {
    const original = "https://example.com/image.jpg";
    const result = getArticleImage(original, "technology", "art-1");
    expect(result).toBe(original);
  });

  it("should return a fallback Unsplash image if original URL is empty", () => {
    const result = getArticleImage("", "technology", "art-1");
    expect(result).toContain("https://images.unsplash.com");
  });

  it("should return a fallback image if original URL is null or undefined", () => {
    const resultNull = getArticleImage(null, "business", "art-2");
    const resultUndefined = getArticleImage(undefined, "business", "art-2");

    expect(resultNull).toContain("https://images.unsplash.com");
    expect(resultUndefined).toContain("https://images.unsplash.com");
  });

  it("should return a deterministic image based on articleId", () => {
    const img1 = getArticleImage(null, "technology", "article-100");
    const img2 = getArticleImage(null, "technology", "article-100");
    expect(img1).toBe(img2);
  });

  it("should fallback to default category images if categorySlug is unknown", () => {
    const result = getArticleImage(null, "unknown-cat-xyz", "art-5");
    expect(result).toContain("https://images.unsplash.com");
  });
});
