import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CookieConsent } from "@/components/common/cookie-consent";

describe("CookieConsent Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render cookie banner if no consent is saved in localStorage", () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText(/Privacy & Cookie Choices/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Accept All/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Essential Only/i })).toBeInTheDocument();
  });

  it("should not render banner if consent is already saved in localStorage", () => {
    localStorage.setItem("bytebulletin_cookie_consent", "all");
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.queryByText(/Privacy & Cookie Choices/i)).not.toBeInTheDocument();
  });

  it("should save 'all' consent to localStorage when Accept All is clicked", () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const acceptBtn = screen.getByRole("button", { name: /Accept All/i });
    fireEvent.click(acceptBtn);

    expect(localStorage.getItem("bytebulletin_cookie_consent")).toBe("all");
    expect(screen.queryByText(/Privacy & Cookie Choices/i)).not.toBeInTheDocument();
  });

  it("should save 'essential' consent to localStorage when Essential Only is clicked", () => {
    render(<CookieConsent />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const essentialBtn = screen.getByRole("button", { name: /Essential Only/i });
    fireEvent.click(essentialBtn);

    expect(localStorage.getItem("bytebulletin_cookie_consent")).toBe("essential");
    expect(screen.queryByText(/Privacy & Cookie Choices/i)).not.toBeInTheDocument();
  });
});
