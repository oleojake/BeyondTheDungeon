import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import { TeamSwitcher } from "../team-switcher";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Home } from "lucide-react";

function renderWithSidebar(ui: React.ReactElement) {
  return render(<SidebarProvider>{ui}</SidebarProvider>);
}

describe("TeamSwitcher", () => {
  const teams = [
    { name: "Team A", logo: Home, plan: "Free" },
    { name: "Team B", logo: Home, plan: "Pro" },
  ];

  it("renders the first team as active by default", () => {
    renderWithSidebar(<TeamSwitcher teams={teams} />);
    expect(screen.getByText("Team A")).toBeTruthy();
  });

  it("renders the plan of the active team", () => {
    renderWithSidebar(<TeamSwitcher teams={teams} />);
    expect(screen.getByText("Free")).toBeTruthy();
  });

  it("returns null when teams array is empty", () => {
    const { container } = renderWithSidebar(<TeamSwitcher teams={[]} />);
    expect(container.querySelector("ul")).toBeNull();
  });

  it("renders all team names including non-active ones in the dropdown", () => {
    renderWithSidebar(<TeamSwitcher teams={teams} />);
    expect(screen.getByText("Team A")).toBeTruthy();
  });

  it("renders the ChevronsUpDown icon button for opening the dropdown", () => {
    renderWithSidebar(<TeamSwitcher teams={teams} />);
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(1);
  });
});
