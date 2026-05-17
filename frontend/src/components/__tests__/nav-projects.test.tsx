import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import { NavProjects } from "../nav-projects";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Home, Settings } from "lucide-react";

function renderWithSidebar(ui: React.ReactElement) {
  return render(<SidebarProvider>{ui}</SidebarProvider>);
}

describe("NavProjects", () => {
  const projects = [
    { name: "Project Alpha", url: "/alpha", icon: Home },
    { name: "Project Beta", url: "/beta", icon: Settings },
  ];

  it("renders the group label", () => {
    renderWithSidebar(<NavProjects projects={projects} />);
    expect(screen.getByText("Projects")).toBeTruthy();
  });

  it("renders all project items", () => {
    renderWithSidebar(<NavProjects projects={projects} />);
    expect(screen.getByText("Project Alpha")).toBeTruthy();
    expect(screen.getByText("Project Beta")).toBeTruthy();
  });

  it("renders a 'More' item at the end", () => {
    renderWithSidebar(<NavProjects projects={projects} />);
    const moreItems = screen.getAllByText("More");
    expect(moreItems.length).toBeGreaterThanOrEqual(1);
  });

  it("renders project links with correct hrefs", () => {
    renderWithSidebar(<NavProjects projects={projects} />);
    const alphaLink = screen.getByText("Project Alpha").closest("a");
    expect(alphaLink?.getAttribute("href")).toBe("/alpha");
  });

  it("renders empty state when projects is empty", () => {
    renderWithSidebar(<NavProjects projects={[]} />);
    expect(screen.getByText("Projects")).toBeTruthy();
  });
});
