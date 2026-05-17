import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../home.component", () => ({
  HomeComponent: () => <div data-testid="home-component" />,
}));

import { HomeContainer } from "../home.container";

describe("HomeContainer", () => {
  it("renders HomeComponent", () => {
    render(<HomeContainer />);
    expect(screen.getByTestId("home-component")).toBeTruthy();
  });
});
