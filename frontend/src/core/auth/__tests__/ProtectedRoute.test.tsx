import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render } from "@testing-library/react";
import { AuthContext } from "../auth.provider";
import { ProtectedRoute } from "../ProtectedRoute";

function renderWithAuth(authState: Partial<{
  user: { id: string; email: string } | null;
  loading: boolean;
  isAdmin: boolean;
}>) {
  const defaultState = {
    session: null,
    user: null,
    loading: false,
    isAdmin: false,
    logout: vi.fn(),
    ...authState,
  };

  const router = createMemoryRouter([
    {
      path: "/secret",
      element: (
        <AuthContext.Provider value={defaultState}>
          <ProtectedRoute>
            <div data-testid="protected-content">Protected Content</div>
          </ProtectedRoute>
        </AuthContext.Provider>
      ),
    },
    {
      path: "/login",
      element: <div>Login Page</div>,
    },
  ], {
    initialEntries: ["/secret"],
  });

  return render(<RouterProvider router={router} />);
}

describe("ProtectedRoute", () => {
  it("renders children when user is authenticated", () => {
    renderWithAuth({ user: { id: "1", email: "a@b.com" }, loading: false });
    expect(screen.getByTestId("protected-content")).toBeTruthy();
  });

  it("redirects to login when user is not authenticated", () => {
    renderWithAuth({ user: null, loading: false });
    expect(screen.queryByTestId("protected-content")).toBeNull();
    expect(screen.getByText("Login Page")).toBeTruthy();
  });

  it("shows nothing while loading", () => {
    renderWithAuth({ user: null, loading: true });
    expect(screen.queryByTestId("protected-content")).toBeNull();
  });
});
