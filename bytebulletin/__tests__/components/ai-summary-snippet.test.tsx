import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AISummarySnippet } from "@/components/common/ai-summary-snippet";

describe("AISummarySnippet Component", () => {
  const mockSummary = "This is an executive AI-synthesized summary of top technology news.";
  const mockPoints = [
    "OpenAI releases new enterprise models with higher context window.",
    "Cloud infrastructure costs reduced by 40% using specialized chips.",
    "Zero-trust architecture adopted by Fortune 500 tech companies.",
    "Developer productivity increased using AI code completion tools.",
    "Regulatory approval granted for next-generation quantum computing.",
  ];

  it("should render AI Powered badge and summary text", () => {
    render(<AISummarySnippet summary={mockSummary} summaryPoints={mockPoints} />);

    expect(screen.getByText(/AI Powered/i)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(mockSummary, "i"))).toBeInTheDocument();
  });

  it("should render all 5 core takeaway bullet points", () => {
    render(<AISummarySnippet summary={mockSummary} summaryPoints={mockPoints} />);

    mockPoints.forEach((point) => {
      expect(screen.getByText(point)).toBeInTheDocument();
    });

    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("05")).toBeInTheDocument();
  });
});
