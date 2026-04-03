import { useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

interface UseCompendiumFiltersOptions {
  /** Query-param key for the category/type filter (e.g. "level", "category"). Omit if not needed. */
  filterKey?: string;
  /** Default value for the category filter when absent. */
  filterDefault?: string;
  /** Default items per page. */
  defaultPerPage?: number;
}

export function useCompendiumFilters(opts: UseCompendiumFiltersOptions = {}) {
  const { filterKey, filterDefault = "all", defaultPerPage = 25 } = opts;
  const [searchParams, setSearchParams] = useSearchParams();

  // --- read from URL ---
  const searchTerm = searchParams.get("q") ?? "";
  const filterValue = filterKey
    ? (searchParams.get(filterKey) ?? filterDefault)
    : filterDefault;
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

  const setFilterValue = useCallback(
    (v: string) => {
      if (!filterKey) return;
      setParam(filterKey, v === filterDefault ? "" : v);
    },
    [setParam, filterKey, filterDefault],
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
      (filterKey ? filterValue !== filterDefault : false) ||
      currentPage > 1,
    [searchTerm, filterKey, filterValue, filterDefault, currentPage],
  );

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return {
    searchTerm,
    setSearchTerm,
    filterValue,
    setFilterValue,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    hasActiveFilters,
    clearFilters,
  } as const;
}
