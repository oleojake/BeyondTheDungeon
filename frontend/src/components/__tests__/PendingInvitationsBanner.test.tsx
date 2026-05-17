import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { PendingInvitationsBanner } from "../PendingInvitationsBanner";
import { I18nProvider } from "@/i18n";
import { AuthContext, type AuthState } from "@/core/auth/auth.provider";

const mockListInvitations = vi.fn();

vi.mock("@/core/api/campaign-invitation.service", () => ({
  listUserInvitations: (...args: unknown[]) => mockListInvitations(...args),
}));

const authedState: AuthState = {
  session: { user: { id: "1", email: "test@test.com" } } as never,
  user: { id: "1", email: "test@test.com" },
  loading: false,
  isAdmin: false,
  logout: async () => {},
};

function renderBanner(authState = authedState) {
  const router = createMemoryRouter([
    {
      path: "/",
      element: (
        <I18nProvider>
          <AuthContext.Provider value={authState}>
            <PendingInvitationsBanner />
          </AuthContext.Provider>
        </I18nProvider>
      ),
    },
  ]);
  return render(<RouterProvider router={router} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PendingInvitationsBanner", () => {
  it("renders nothing when user is not authenticated", () => {
    const state = { ...authedState, user: null, session: null };
    const { container } = renderBanner(state);
    expect(container.innerHTML).toBe("");
  });

  it("renders nothing when there are no invitations", async () => {
    mockListInvitations.mockResolvedValue([]);

    const { container } = renderBanner();

    await waitFor(() => {
      expect(mockListInvitations).toHaveBeenCalled();
    });
    expect(container.innerHTML).toBe("");
  });

  it("shows banner with invitation count", async () => {
    mockListInvitations.mockResolvedValue([{ id: "1" }, { id: "2" }]);

    renderBanner();

    const banner = await screen.findByText(/Tienes 2/);
    expect(banner.textContent).toMatch(/invitaciónes/);
    expect(screen.getByText("Mis Campañas")).toBeTruthy();
  });

  it("shows singular for 1 invitation", async () => {
    mockListInvitations.mockResolvedValue([{ id: "1" }]);

    renderBanner();

    const banner = await screen.findByText(/Tienes 1/);
    expect(banner.textContent).toMatch(/invitación/);
  });

  it("dismisses banner when close button is clicked", async () => {
    const user = userEvent.setup();
    mockListInvitations.mockResolvedValue([{ id: "1" }]);

    renderBanner();

    await screen.findByText(/Tienes 1 invitación/);
    await user.click(screen.getByLabelText("Cerrar aviso"));

    expect(screen.queryByText(/Tienes 1 invitación/)).toBeNull();
  });
});
