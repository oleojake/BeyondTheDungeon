import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CompendiumItem } from "../types";
import { getItemTags } from "../utils/itemTags";

// ─── AutocompleteInput ────────────────────────────────────────────────────────

export function AutocompleteInput({
  allItems,
  categoryFilter,
  placeholder,
  onSelect,
  hideSearchAll = false,
}: {
  allItems: CompendiumItem[];
  categoryFilter: (item: CompendiumItem) => boolean;
  placeholder: string;
  onSelect: (
    name: string,
    weight?: number,
    srdIndex?: string,
    tags?: string[],
  ) => void;
  hideSearchAll?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [searchAll, setSearchAll] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const pool = useMemo(
    () => (searchAll ? allItems : allItems.filter(categoryFilter)),
    [allItems, categoryFilter, searchAll],
  );

  const suggestions = useMemo(() => {
    if (!query.trim()) return pool;
    const q = query.toLowerCase();
    return pool.filter((i) => i.name.toLowerCase().includes(q));
  }, [pool, query]);

  const handleSelect = (item: CompendiumItem) => {
    const w = item.weight ? parseFloat(item.weight) : undefined;
    const tags = getItemTags(item.stats ?? {});
    onSelect(
      item.name,
      w !== undefined && !isNaN(w) && w > 0 ? w : undefined,
      item.stats?.index as string | undefined,
      tags.length > 0 ? tags : undefined,
    );
    setQuery("");
    setOpen(false);
  };

  const handleCustom = () => {
    if (!query.trim()) return;
    onSelect(query.trim(), undefined, undefined, ["CUSTOM"]);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (suggestions.length > 0) handleSelect(suggestions[0]);
              else handleCustom();
            }
            if (e.key === "Escape") setOpen(false);
          }}
          className="bg-amber-950/40 border-amber-700/50 text-amber-100 placeholder:text-amber-600/70 h-8 text-sm"
        />
        <Button
          size="sm"
          variant="outline"
          className="border-amber-700/70 text-amber-400 hover:bg-amber-700/30 h-8 px-3 shrink-0"
          onClick={handleCustom}
        >
          +
        </Button>
      </div>
      {open && (
        <div className="absolute z-50 w-full mt-1 rounded-lg border border-amber-700/50 bg-[#2a1508] shadow-2xl overflow-hidden">
          {allItems.length > 0 && (
            <div className="px-3 py-1 border-b border-amber-900/40 flex items-center justify-between">
              <span className="text-[10px] text-amber-600/70">
                {query.trim()
                  ? `${suggestions.length} resultado${suggestions.length !== 1 ? "s" : ""}`
                  : `${pool.length} objetos — escribe para filtrar`}
              </span>
            </div>
          )}
          <div className="max-h-56 overflow-y-auto">
            {allItems.length === 0 ? (
              <p className="px-3 py-3 text-xs text-amber-600 italic text-center">
                Cargando compendio…
              </p>
            ) : suggestions.length === 0 ? (
              <p className="px-3 py-2 text-xs text-amber-600 italic">
                Sin resultados — pulsa + para añadir como objeto custom
              </p>
            ) : (
              suggestions.map((item) => {
                const dropTags = getItemTags(item.stats ?? {});
                return (
                  <button
                    key={item.id}
                    onMouseDown={() => handleSelect(item)}
                    className="w-full text-left px-3 py-2 text-sm text-amber-200 hover:bg-amber-700/30 transition-colors border-b border-amber-900/20 last:border-0"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-medium">{item.name}</span>
                      <span className="text-[10px] text-amber-600/70 shrink-0 whitespace-nowrap">
                        {item.type}
                        {item.weight && item.weight !== "0"
                          ? ` · ${item.weight} lb`
                          : ""}
                      </span>
                    </div>
                    {dropTags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        {dropTags.map((t) => (
                          <span
                            key={t}
                            className="px-1 py-0 rounded text-[9px] bg-amber-800/40 text-amber-400/90 leading-4"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
          {!hideSearchAll && (
            <div className="sticky bottom-0 border-t border-amber-900/50 px-3 py-1.5 bg-[#1e0e05]">
              <label className="flex items-center gap-2 text-xs text-amber-500/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={searchAll}
                  onChange={(e) => setSearchAll(e.target.checked)}
                  className="accent-amber-600 w-3 h-3"
                />
                Buscar en todo el compendio ({allItems.length} objetos)
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
