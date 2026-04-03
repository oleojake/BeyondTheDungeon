import { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

interface UseCompendiumFiltersOptions {
  /** Query-param key for the category/type filter (e.g. "level", "category"). Omit if not needed. */
  filterKey?: string;
  /** Default items per page. */
  defaultPerPage?: number;
}

export function useCompendiumFilters(opts: UseCompendiumFiltersOptions = {}) {
  const { filterKey, defaultPerPage = 25 } = opts;
  const [searchParams, setSearchParams] = useSearchParams();

  // --- read from URL ---
  const searchTerm = searchParams.get("q") ?? "";
  const filterValues: string[] = useMemo(() => {
    if (!filterKey) return [];
    const raw = searchParams.get(filterKey);
    if (!raw) return [];
    return raw.split(",").filter(Boolean);
  }, [searchParams, filterKey]);
  const currentPage = Math.max(1, Number(searchParams.get("page")) || 1);
  const itemsPerPage = Number(searchParams.get("perPage")) || defaultPerPage;

  // --- helpers to update URL (merge with existing params) ---
  const setParam = useCallback(
    (key: string, value: string, resetPage = true) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (!value || value === "") {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        if (resetPage && key !== "page") {
          next.delete("page");
        }
        return next;
      }, { replace: true });
    },
    [setSearchParams],
  );

  const setSearchTerm = useCallback(
    (v: string) => setParam("q", v),
    [setParam],
  );

  /** Toggle a single value in/out of the multi-select filter. */
  const toggleFilter = useCallback(
    (v: string) => {
      if (!filterKey) return;
      const current = new Set(filterValues);
      if (current.has(v)) {
        current.delete(v);
      } else {
        current.add(v);
      }
      const serialized = Array.from(current).join(",");
      setParam(filterKey, serialized);
    },
    [filterKey, filterValues, setParam],
  );

  /** Clear all filter selections (show all). */
  const clearFilter = useCallback(() => {
    if (!filterKey) return;
    setParam(filterKey, "");
  }, [filterKey, setParam]);

  /** Check if a value is currently selected. */
  const isFilterActive = useCallback(
    (v: string) => filterValues.includes(v),
    [filterValues],
  );

  const setCurrentPage = useCallback(
    (v: number | ((prev: number) => number)) => {
      const resolved = typeof v === "function" ? v(currentPage) : v;
      setParam("page", resolved <= 1 ? "" : String(resolved), false);
    },
    [setParam, currentPage],
  );

  const setItemsPerPage = useCallback(
    (v: number) => setParam("perPage", v === defaultPerPage ? "" : String(v)),
    [setParam, defaultPerPage],
  );

  // --- derived state ---
  const hasActiveFilters = useMemo(
    () =>
      searchTerm !== "" ||
      filterValues.length > 0 ||
      currentPage > 1,
    [searchTerm, filterValues, currentPage],
  );

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return {
    searchTerm,
    setSearchTerm,
    filterValues,
    toggleFilter,
    clearFilter,
    isFilterActive,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    hasActiveFilters,
    clearFilters,
  } as const;
}
