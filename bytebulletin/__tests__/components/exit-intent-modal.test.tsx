import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ExitIntentModal } from "@/components/common/exit-intent-modal";

// Mock subscribeEmailDirectly action
vi.mock("@/actions/newsletter.actions", () => ({
  subscribeEmailDirectly: vi.fn().mockResolvedValue({
    success: true,
    message: "Successfully subscribed!",
  }),
}));

describe("ExitIntentModal Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should not render modal initially if cursor hasn't exited top boundary", () => {
    render(<ExitIntentModal />);
    expect(screen.queryByText(/Before You Leave.../i)).not.toBeInTheDocument();
  });

  it("should open modal when cursor moves to top boundary (clientY <= 10)", () => {
    render(<ExitIntentModal />);
    fireEvent.mouseLeave(document, { clientY: 5 });

    expect(screen.getByText(/Before You Leave.../i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your work email.../i)).toBeInTheDocument();
    expect(localStorage.getItem("bytebulletin_exit_modal_dismissed")).toBe("true");
  });

  it("should not open modal if already dismissed in localStorage", () => {
    localStorage.setItem("bytebulletin_exit_modal_dismissed", "true");
    render(<ExitIntentModal />);
    fireEvent.mouseLeave(document, { clientY: 5 });

    expect(screen.queryByText(/Before You Leave.../i)).not.toBeInTheDocument();
  });
});
