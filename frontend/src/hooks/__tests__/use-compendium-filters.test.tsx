import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { type ReactNode } from "react";
import { useCompendiumFilters } from "../use-compendium-filters";

function renderWithRouter(initialEntries = ["/"]) {
  return renderHook(() => useCompendiumFilters({ filterKey: "level" }), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    ),
  });
}

describe("useCompendiumFilters", () => {
  it("returns defaults with no URL params", () => {
    const { result } = renderWithRouter();

    expect(result.current.searchTerm).toBe("");
    expect(result.current.filterValues).toEqual([]);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.itemsPerPage).toBe(25);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("reads search term from URL", () => {
    const { result } = renderWithRouter(["/?q=fireball"]);
    expect(result.current.searchTerm).toBe("fireball");
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("reads page from URL", () => {
    const { result } = renderWithRouter(["/?page=3"]);
    expect(result.current.currentPage).toBe(3);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("reads filter values from URL", () => {
    const { result } = renderWithRouter(["/?level=3,5"]);
    expect(result.current.filterValues).toEqual(["3", "5"]);
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("reads custom perPage from URL", () => {
    const { result } = renderWithRouter(["/?perPage=50"]);
    expect(result.current.itemsPerPage).toBe(50);
  });

  it("sets search term via setSearchTerm", () => {
    const { result } = renderWithRouter();

    act(() => {
      result.current.setSearchTerm("dragon");
    });

    expect(result.current.searchTerm).toBe("dragon");
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("toggles filter values", () => {
    const { result } = renderWithRouter(["/?level=3"]);

    act(() => {
      result.current.toggleFilter("5");
    });

    expect(result.current.filterValues).toContain("3");
    expect(result.current.filterValues).toContain("5");

    act(() => {
      result.current.toggleFilter("3");
    });

    expect(result.current.filterValues).not.toContain("3");
    expect(result.current.filterValues).toContain("5");
  });

  it("checks if filter is active", () => {
    const { result } = renderWithRouter(["/?level=3,5"]);

    expect(result.current.isFilterActive("3")).toBe(true);
    expect(result.current.isFilterActive("7")).toBe(false);
  });

  it("clears a single filter", () => {
    const { result } = renderWithRouter(["/?level=3,5"]);

    act(() => {
      result.current.clearFilter();
    });

    expect(result.current.filterValues).toEqual([]);
  });

  it("clears all filters", () => {
    const { result } = renderWithRouter(["/?q=fire&level=3&page=2"]);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.searchTerm).toBe("");
    expect(result.current.filterValues).toEqual([]);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("sets current page", () => {
    const { result } = renderWithRouter();

    act(() => {
      result.current.setCurrentPage(5);
    });

    expect(result.current.currentPage).toBe(5);

    act(() => {
      result.current.setCurrentPage(1);
    });

    expect(result.current.currentPage).toBe(1);
  });

  it("sets items per page", () => {
    const { result } = renderWithRouter();

    act(() => {
      result.current.setItemsPerPage(50);
    });

    expect(result.current.itemsPerPage).toBe(50);
  });

  it("clamps page to minimum of 1", () => {
    const { result } = renderWithRouter(["/?page=0"]);
    expect(result.current.currentPage).toBe(1);
  });

  it("handles missing filterKey gracefully", () => {
    const { result } = renderHook(() => useCompendiumFilters(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <MemoryRouter initialEntries={["/"]}>{children}</MemoryRouter>
      ),
    });

    expect(result.current.filterValues).toEqual([]);

    act(() => {
      result.current.toggleFilter("test");
    });

    expect(result.current.filterValues).toEqual([]);
  });
});
