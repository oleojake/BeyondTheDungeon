import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LanguageSwitcher } from "../language-switcher";
import { renderWithProviders } from "@/test/test-utils";

describe("LanguageSwitcher", () => {
  it("renders the current language ES by default", () => {
    renderWithProviders(<LanguageSwitcher />);
    expect(screen.getByText("ES")).toBeTruthy();
  });

  it("renders the switch indicator in non-compact mode", () => {
    renderWithProviders(<LanguageSwitcher />);
    expect(screen.getByText("→ English")).toBeTruthy();
  });

  it("hides the switch indicator in compact mode", () => {
    renderWithProviders(<LanguageSwitcher compact />);
    expect(screen.queryByText("→ English")).toBeNull();
  });

  it("toggles locale on click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageSwitcher />);

    expect(screen.getByText("ES")).toBeTruthy();

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("EN")).toBeTruthy();
    expect(screen.getByText("→ Español")).toBeTruthy();
  });

  it("has accessible aria-label indicating switch direction", () => {
    renderWithProviders(<LanguageSwitcher />);
    const button = screen.getByRole("button");
    expect(button.getAttribute("aria-label")).toMatch(/^Switch to /);
  });

  it("applies custom className", () => {
    renderWithProviders(<LanguageSwitcher className="custom-class" />);
    const button = screen.getByRole("button");
    expect(button.className).toContain("custom-class");
  });
});
