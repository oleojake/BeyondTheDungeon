import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { render } from "@testing-library/react";
import { AuthContext } from "../auth.provider";
import { AdminRoute } from "../AdminRoute";

function createRouter(authState: Partial<{
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

  return createMemoryRouter([
    {
      path: "/",
      element: <div>Root</div>,
    },
    {
      path: "/admin",
      element: (
        <AuthContext.Provider value={defaultState}>
          <AdminRoute>
            <div data-testid="admin-content">Admin Panel</div>
          </AdminRoute>
        </AuthContext.Provider>
      ),
    },
    {
      path: "/login",
      element: <div>Login Page</div>,
    },
    {
      path: "/profile/campanas",
      element: <div>Mis Campañas</div>,
    },
  ], {
    initialEntries: ["/admin"],
  });
}

describe("AdminRoute", () => {
  it("renders children when user is admin", () => {
    render(<RouterProvider router={createRouter({ user: { id: "1", email: "admin@test.com" }, isAdmin: true, loading: false })} />);
    expect(screen.getByTestId("admin-content")).toBeTruthy();
  });

  it("redirects to login when not authenticated", () => {
    render(<RouterProvider router={createRouter({ user: null, loading: false })} />);
    expect(screen.queryByTestId("admin-content")).toBeNull();
    expect(screen.getByText("Login Page")).toBeTruthy();
  });

  it("redirects to campanas when user is not admin", () => {
    render(<RouterProvider router={createRouter({ user: { id: "1", email: "user@test.com" }, isAdmin: false, loading: false })} />);
    expect(screen.queryByTestId("admin-content")).toBeNull();
    expect(screen.getByText("Mis Campañas")).toBeTruthy();
  });

  it("shows nothing while loading", () => {
    render(<RouterProvider router={createRouter({ user: null, loading: true })} />);
    expect(screen.queryByTestId("admin-content")).toBeNull();
  });
});
