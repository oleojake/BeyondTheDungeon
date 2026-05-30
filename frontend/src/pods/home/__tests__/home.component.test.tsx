import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../components", () => ({
  Navbar: () => <div data-testid="mock-navbar" />,
  Hero: () => <div data-testid="mock-hero" />,
  Features: () => <div data-testid="mock-features" />,
  Footer: () => <div data-testid="mock-footer" />,
}));

import { HomeComponent } from "../home.component";

describe("HomeComponent", () => {
  it("renders all home sub-components", () => {
    render(<HomeComponent />);
    expect(screen.getByTestId("mock-navbar")).toBeTruthy();
    expect(screen.getByTestId("mock-hero")).toBeTruthy();
    expect(screen.getByTestId("mock-features")).toBeTruthy();
    expect(screen.getByTestId("mock-footer")).toBeTruthy();
  });
});
