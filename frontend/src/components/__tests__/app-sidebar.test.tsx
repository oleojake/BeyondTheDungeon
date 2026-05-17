import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

vi.mock("@/components/ui/sidebar-context", () => ({
  useSidebar: () => ({ state: "expanded", open: true, setOpen: vi.fn(), openMobile: false, setOpenMobile: vi.fn(), isMobile: false, toggleSidebar: vi.fn() }),
}));

vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children, className, collapsible, ...props }: React.ComponentProps<"div"> & { collapsible?: string }) => (
    <div data-testid="sidebar" className={className} data-collapsible={collapsible} {...props}>{children}</div>
  ),
  SidebarContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-content">{children}</div>
  ),
  SidebarHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-header">{children}</div>
  ),
  SidebarRail: () => <div data-testid="sidebar-rail" />,
}));

vi.mock("@/components/nav-main", () => ({
  NavMain: ({ items }: { items: Array<{ title: string; url: string }> }) => (
    <div data-testid="nav-main">
      {items.map((item) => (
        <a key={item.url} href={item.url} data-testid={`nav-item-${item.title}`}>
          {item.title}
        </a>
      ))}
    </div>
  ),
}));

vi.mock("@/i18n", () => ({
  useTranslation: () => ({
    t: {
      sidebar: {
        home: { title: "Inicio", subtitle: "Volver al inicio" },
        campaigns: { title: "Campañas", subtitle: "Gestiona tus campañas" },
        inventory: { title: "Inventario", subtitle: "Tus objetos" },
        characters: { title: "Personajes", subtitle: "Tus fichas" },
        maps: { title: "Mapas", subtitle: "Tus mapas" },
        dice: { title: "Dados", subtitle: "Tira los dados" },
        forum: { title: "Foro", subtitle: "Discute con otros" },
        settings: { title: "Ajustes", subtitle: "Configuración" },
      },
    },
  }),
}));

import { AppSidebar } from "../app-sidebar";

function renderSidebar() {
  const router = createMemoryRouter([
    {
      path: "/",
      element: <AppSidebar />,
    },
  ]);
  return render(<RouterProvider router={router} />);
}

describe("AppSidebar", () => {
  it("renders the sidebar wrapper", () => {
    renderSidebar();
    expect(screen.getByTestId("sidebar")).toBeTruthy();
  });

  it("renders SidebarHeader, SidebarContent and SidebarRail", () => {
    renderSidebar();
    expect(screen.getByTestId("sidebar-header")).toBeTruthy();
    expect(screen.getByTestId("sidebar-content")).toBeTruthy();
    expect(screen.getByTestId("sidebar-rail")).toBeTruthy();
  });

  it("renders the brand logo link", () => {
    renderSidebar();
    const logo = screen.getByAltText("Beyond the Dungeon");
    expect(logo).toBeTruthy();
    expect(logo.closest("a")?.getAttribute("href")).toBe("/");
  });

  it("renders the brand title text", () => {
    renderSidebar();
    expect(screen.getByText("Beyond the Dungeon")).toBeTruthy();
  });

  it("renders NavMain with all nav items", () => {
    renderSidebar();
    const navMain = screen.getByTestId("nav-main");
    expect(navMain).toBeTruthy();

    expect(screen.getByTestId("nav-item-Inicio")).toBeTruthy();
    expect(screen.getByTestId("nav-item-Campañas")).toBeTruthy();
    expect(screen.getByTestId("nav-item-Inventario")).toBeTruthy();
    expect(screen.getByTestId("nav-item-Personajes")).toBeTruthy();
    expect(screen.getByTestId("nav-item-Mapas")).toBeTruthy();
    expect(screen.getByTestId("nav-item-Dados")).toBeTruthy();
    expect(screen.getByTestId("nav-item-Foro")).toBeTruthy();
    expect(screen.getByTestId("nav-item-Ajustes")).toBeTruthy();
  });

  it("renders nav items with correct URLs", () => {
    renderSidebar();
    expect(screen.getByTestId("nav-item-Inicio").getAttribute("href")).toBe("/");
    expect(screen.getByTestId("nav-item-Campañas").getAttribute("href")).toBe("/mis-campanas");
    expect(screen.getByTestId("nav-item-Ajustes").getAttribute("href")).toBe("/profile/settings");
  });
});
