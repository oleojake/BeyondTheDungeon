import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";

const mockUseAuth = vi.fn();

vi.mock("@/core/auth/useAuth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("../app.layout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

import { FullscreenToolLayout } from "../tool.layout";

describe("FullscreenToolLayout", () => {
  it("renders nothing while loading", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });
    const { container } = render(
      <FullscreenToolLayout>
        <div data-testid="child" />
      </FullscreenToolLayout>
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders children directly when user is authenticated", () => {
    mockUseAuth.mockReturnValue({ user: { id: "1" }, loading: false });
    render(
      <FullscreenToolLayout>
        <div data-testid="child" />
      </FullscreenToolLayout>
    );
    expect(screen.getByTestId("child")).toBeTruthy();
    expect(screen.queryByTestId("app-layout")).toBeNull();
  });

  it("wraps children in AppLayout when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });
    render(
      <FullscreenToolLayout>
        <div data-testid="child" />
      </FullscreenToolLayout>
    );
    expect(screen.getByTestId("app-layout")).toBeTruthy();
    expect(screen.getByTestId("child")).toBeTruthy();
  });
});
