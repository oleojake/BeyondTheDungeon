import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/router", () => ({
  AppRouter: () => <div data-testid="app-router" />,
}));

import { App } from "../App";

describe("App", () => {
  it("renders AppRouter", () => {
    render(<App />);
    expect(screen.getByTestId("app-router")).toBeTruthy();
  });
});
