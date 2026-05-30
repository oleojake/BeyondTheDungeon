import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import { ProfileTabs } from "../profile-tabs";
import { renderWithProviders } from "@/test/test-utils";

describe("ProfileTabs", () => {
  it("renders all non-admin tabs for regular users", () => {
    renderWithProviders(<ProfileTabs />, {
      initialEntries: ["/profile/campanas"],
    });

    // The component renders both desktop nav and a mobile trigger bar.
    // Scope to the desktop <nav> to avoid duplicate-text errors on the active label.
    const nav = screen.getByRole("navigation");
    expect(within(nav).getByText("Campañas")).toBeTruthy();
    expect(within(nav).getByText("Fichas")).toBeTruthy();
    expect(within(nav).getByText("Mapas")).toBeTruthy();
    expect(within(nav).getByText("Ajustes")).toBeTruthy();
  });

  it("does not render admin tab for regular users", () => {
    renderWithProviders(<ProfileTabs />, {
      initialEntries: ["/profile/campanas"],
    });

    expect(screen.queryByText("Admin")).toBeNull();
  });

  it("renders admin tab for admin users", () => {
    renderWithProviders(<ProfileTabs />, {
      initialEntries: ["/profile/campanas"],
      authState: {
        session: null,
        user: { id: "admin-id", email: "admin@test.com" },
        loading: false,
        isAdmin: true,
        logout: async () => {},
      },
    });

    expect(screen.getByText("Admin")).toBeTruthy();
  });

  it("highlights the active tab", () => {
    renderWithProviders(<ProfileTabs />, {
      initialEntries: ["/fichas"],
    });

    const nav = screen.getByRole("navigation");
    const charsLink = within(nav).getByText("Fichas").closest("a");
    expect(charsLink?.className).toContain("border-amber-500");
  });

  it("applies purple highlight to admin tab when active", () => {
    renderWithProviders(<ProfileTabs />, {
      initialEntries: ["/admin"],
      authState: {
        session: null,
        user: { id: "admin-id", email: "admin@test.com" },
        loading: false,
        isAdmin: true,
        logout: async () => {},
      },
    });

    const nav = screen.getByRole("navigation");
    const adminLink = within(nav).getByText("Admin").closest("a");
    expect(adminLink?.className).toContain("border-purple-500");
  });
});
