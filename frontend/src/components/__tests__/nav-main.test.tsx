import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { NavMain } from "../nav-main";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Home, Settings } from "lucide-react";

function renderWithProviders(ui: React.ReactElement, { initialEntries = ["/"] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <SidebarProvider>
        {ui}
      </SidebarProvider>
    </MemoryRouter>
  );
}

describe("NavMain", () => {
  const items = [
    { title: "Home", url: "/", icon: Home, badge: "3" },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  it("renders all nav items", () => {
    renderWithProviders(<NavMain items={items} />);
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Settings")).toBeTruthy();
  });

  it("renders badge when provided", () => {
    renderWithProviders(<NavMain items={items} />);
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("renders links with correct hrefs", () => {
    renderWithProviders(<NavMain items={items} />);
    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink?.getAttribute("href")).toBe("/");
  });

  it("marks active item based on current location", () => {
    renderWithProviders(<NavMain items={items} />, { initialEntries: ["/settings"] });
    const settingsLink = screen.getByText("Settings").closest("a");
    expect(settingsLink?.getAttribute("aria-current")).toBe("true");
  });

  it("renders empty state when items is empty", () => {
    renderWithProviders(<NavMain items={[]} />);
    expect(screen.queryByRole("link")).toBeNull();
  });
});
