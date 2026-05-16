import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider } from "../auth.provider";
import { useAuth } from "../useAuth";

const mockGetSession = vi.fn();
const mockOnAuthStateChange = vi.fn(() => ({
  data: { subscription: { unsubscribe: vi.fn() } },
}));
let mockAdminResult = { data: { is_admin: false }, error: null };

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve(mockAdminResult)),
        })),
      })),
    })),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockAdminResult = { data: { is_admin: false }, error: null };
});

function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(auth.loading)}</span>
      <span data-testid="user-id">{auth.user?.id ?? "null"}</span>
      <span data-testid="is-admin">{String(auth.isAdmin)}</span>
    </div>
  );
}

describe("AuthProvider", () => {
  it("shows loading initially", () => {
    mockGetSession.mockReturnValue(
      new Promise(() => {
        /* never resolves — keep loading=true */
      }),
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("loading").textContent).toBe("true");
  });

  it("sets user when session exists", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "user-1", email: "test@test.com" } } },
      error: null,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user-id").textContent).toBe("user-1");
    });
  });

  it("sets user to null when no session", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user-id").textContent).toBe("null");
    });
  });

  it("sets isAdmin based on profiles table", async () => {
    mockAdminResult = { data: { is_admin: true }, error: null };

    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: "admin-1", email: "admin@test.com" } } },
      error: null,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-admin").textContent).toBe("true");
    });
  });

  it("subscribes to auth state changes", () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(mockOnAuthStateChange).toHaveBeenCalled();
  });
});
