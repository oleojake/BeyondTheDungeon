import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { render } from "@testing-library/react";
import { I18nProvider } from "@/i18n";
import { AuthContext, type AuthState } from "@/core/auth/auth.provider";
import { NavUser } from "../nav-user";

const defaultAuthState: AuthState = {
  session: null,
  user: null,
  loading: false,
  isAdmin: false,
  logout: async () => {},
};

function renderWithProviders(ui: React.ReactElement, authState: AuthState = defaultAuthState) {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <AuthContext.Provider value={authState}>
          {ui}
        </AuthContext.Provider>
      </I18nProvider>
    </MemoryRouter>
  );
}

describe("NavUser", () => {
  it("renders guest name when no user or fallback", () => {
    renderWithProviders(<NavUser />);
    expect(screen.getByText(/invitado/i)).toBeTruthy();
  });

  it("renders fallback user info when provided", () => {
    const fallback = { name: "Test User", email: "test@example.com" };
    renderWithProviders(<NavUser fallbackUser={fallback} />);
    expect(screen.getByText("Test User")).toBeTruthy();
    expect(screen.getByText("test@example.com")).toBeTruthy();
  });

  it("renders avatar with fallback initials", () => {
    const fallback = { name: "John Doe", email: "john@example.com" };
    renderWithProviders(<NavUser fallbackUser={fallback} />);
    expect(screen.getByText("JO")).toBeTruthy();
  });

  it("renders logout dropdown item", async () => {
    renderWithProviders(<NavUser />);
    const button = screen.getByRole("button");
    expect(button).toBeTruthy();
  });
});
