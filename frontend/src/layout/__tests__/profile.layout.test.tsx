import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { I18nProvider } from "@/i18n";
import { AuthContext } from "@/core/auth/auth.provider";
import { ProfileLayout } from "../profile.layout";

vi.mock("@/components/app-sidebar", () => ({
  AppSidebar: () => <div data-testid="app-sidebar" />,
}));

vi.mock("@/components/nav-user", () => ({
  NavUser: ({ fallbackUser }: { fallbackUser: { name: string } }) => (
    <div data-testid="nav-user">{fallbackUser.name}</div>
  ),
}));

vi.mock("@/components/language-switcher", () => ({
  LanguageSwitcher: ({ compact }: { compact?: boolean }) => (
    <div data-testid="language-switcher" data-compact={String(compact)} />
  ),
}));

vi.mock("@/components/ui/sidebar", () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-provider">{children}</div>
  ),
  SidebarInset: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="sidebar-inset" className={className}>{children}</div>
  ),
  SidebarTrigger: () => <div data-testid="sidebar-trigger" />,
}));

vi.mock("@/components/ui/breadcrumb", () => ({
  Breadcrumb: ({ children }: { children: React.ReactNode }) => <div data-testid="breadcrumb">{children}</div>,
  BreadcrumbItem: ({ children }: { children: React.ReactNode }) => <div data-testid="breadcrumb-item">{children}</div>,
  BreadcrumbLink: ({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean }) => (
    <span data-testid="breadcrumb-link" {...props}>{children}</span>
  ),
  BreadcrumbList: ({ children }: { children: React.ReactNode }) => <div data-testid="breadcrumb-list">{children}</div>,
  BreadcrumbPage: ({ children }: { children: React.ReactNode }) => <span data-testid="breadcrumb-page">{children}</span>,
  BreadcrumbSeparator: () => <span data-testid="breadcrumb-separator" />,
}));

vi.mock("@/core/auth/useAuth", () => ({
  useAuth: () => ({ user: mockUser }),
}));

let mockUser: { id: string; email: string | null } | null = { id: "1", email: "hero@dungeon.com" };

const authedState = {
  session: { user: { id: "1", email: "hero@dungeon.com" } } as never,
  user: { id: "1", email: "hero@dungeon.com" },
  loading: false,
  isAdmin: false,
  logout: async () => {},
};

function renderProfile(children: React.ReactNode, authState = authedState) {
  return render(
    <MemoryRouter initialEntries={["/profile"]}>
      <AuthContext.Provider value={authState}>
        <I18nProvider>
          <ProfileLayout>{children}</ProfileLayout>
        </I18nProvider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  cleanup();
  mockUser = { id: "1", email: "hero@dungeon.com" };
});

describe("ProfileLayout", () => {
  it("renders sidebar, header, and children", () => {
    const { container } = renderProfile(
      <div data-testid="page-content">Profile Page</div>
    );

    const profileLayout = container.firstChild as HTMLElement;
    expect(profileLayout.className).toContain("min-h-screen");

    expect(screen.getByTestId("sidebar-provider")).toBeTruthy();
    expect(screen.getByTestId("app-sidebar")).toBeTruthy();
    expect(screen.getByTestId("sidebar-inset")).toBeTruthy();
    expect(screen.getByTestId("sidebar-trigger")).toBeTruthy();
    expect(screen.getByTestId("language-switcher")).toBeTruthy();
    expect(screen.getByTestId("nav-user")).toBeTruthy();
    expect(screen.getByTestId("page-content")).toBeTruthy();
  });

  it("shows breadcrumb with dashboard label for /profile route", () => {
    renderProfile(
      <div data-testid="page-content">Profile Page</div>
    );

    expect(screen.getByText("Dashboard")).toBeTruthy();
  });

  it("displays the user name derived from email", () => {
    renderProfile(
      <div>Content</div>
    );
    expect(screen.getByTestId("nav-user").textContent).toBe("hero");
  });

  it("displays guest when user has no email", () => {
    const guestState = {
      ...authedState,
      user: { id: "2", email: null },
      session: { user: { id: "2" } } as never,
    };
    mockUser = { id: "2", email: null };
    renderProfile(<div>Content</div>, guestState);
    expect(screen.getByTestId("nav-user").textContent).toBe("Invitado");
  });

  it("forces dark class on mount and cleans up on unmount", () => {
    const html = document.documentElement;
    html.classList.remove("dark");

    const { unmount } = renderProfile(<div>Content</div>);
    expect(html.classList.contains("dark")).toBe(true);

    unmount();
    expect(html.classList.contains("dark")).toBe(false);
  });

  it("restores original dark state on unmount when it was already dark", () => {
    const html = document.documentElement;
    html.classList.add("dark");

    const { unmount } = renderProfile(<div>Content</div>);
    expect(html.classList.contains("dark")).toBe(true);

    unmount();
    expect(html.classList.contains("dark")).toBe(true);
  });
});
