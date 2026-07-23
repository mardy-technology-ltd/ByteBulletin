import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { LiveSearchModal } from "@/components/common/live-search-modal";

// Mock searchArticlesAction
vi.mock("@/actions/article.actions", () => ({
  searchArticlesAction: vi.fn().mockResolvedValue([
    {
      id: "art-1",
      title: "OpenAI Announces GPT-5 Enterprise",
      slug: "openai-announces-gpt-5",
      excerpt: "Next generation AI model for enterprise.",
      imageUrl: "https://example.com/gpt5.jpg",
      sourceName: "TechCrunch",
      categoryName: "Technology",
      publishedAt: "2026-07-23T00:00:00.000Z",
      isAiSummarized: true,
    },
  ]),
}));

describe("LiveSearchModal Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render search trigger button in header", () => {
    render(<LiveSearchModal />);
    expect(screen.getByText(/Search AI articles.../i)).toBeInTheDocument();
  });

  it("should open modal when trigger button is clicked", () => {
    render(<LiveSearchModal />);
    const trigger = screen.getByText(/Search AI articles.../i);
    fireEvent.click(trigger);

    expect(screen.getByPlaceholderText(/Type to search stories, AI tools, topics.../i)).toBeInTheDocument();
  });

  it("should open modal when Ctrl+K is pressed", () => {
    render(<LiveSearchModal />);
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });

    expect(screen.getByPlaceholderText(/Type to search stories, AI tools, topics.../i)).toBeInTheDocument();
  });

  it("should close modal when Escape is pressed", () => {
    render(<LiveSearchModal />);
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(screen.getByPlaceholderText(/Type to search stories, AI tools, topics.../i)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByPlaceholderText(/Type to search stories, AI tools, topics.../i)).not.toBeInTheDocument();
  });
});
