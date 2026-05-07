import { useState, useEffect, useRef, useMemo } from "react";
import type { CompendiumItem } from "../types";
import { getItemTags } from "../utils/itemTags";
import { getSlotFilter } from "../utils/itemFilters";

// ─── SlotPickerModal ──────────────────────────────────────────────────────────

export function SlotPickerModal({
  slotLabel,
  slotKey,
  allItems,
  onEquip,
  onClose,
}: {
  slotLabel: string;
  slotKey: string;
  allItems: CompendiumItem[];
  onEquip: (
    name: string,
    weight?: number,
    srdIndex?: string,
    tags?: string[],
    capacity?: string,
  ) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [searchAll, setSearchAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const slotFilter = useMemo(() => getSlotFilter(slotKey), [slotKey]);

  const pool = useMemo(
    () => (searchAll ? allItems : allItems.filter(slotFilter)),
    [allItems, slotFilter, searchAll],
  );

  const suggestions = useMemo(() => {
    if (!query.trim()) return pool;
    const q = query.toLowerCase();
    return pool.filter((i) => i.name.toLowerCase().includes(q));
  }, [pool, query]);

  const handleSelect = (item: CompendiumItem) => {
    const w = item.weight ? parseFloat(item.weight) : undefined;
    const tags = getItemTags(item.stats ?? {});
    const capacity = item.stats?.capacity as string | undefined;
    onEquip(
      item.name,
      w !== undefined && !isNaN(w) && w > 0 ? w : undefined,
      item.stats?.index as string | undefined,
      tags.length > 0 ? tags : undefined,
      capacity,
    );
    onClose();
  };

  const handleCustom = () => {
    if (!query.trim()) return;
    onEquip(query.trim(), undefined, undefined, ["CUSTOM"]);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#1e0d05] border border-amber-800/50 rounded-xl shadow-2xl w-full max-w-md mx-4 flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-amber-900/40">
          <h3 className="text-amber-300 font-semibold text-sm">
            Equipar — <span className="text-amber-500">{slotLabel}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-amber-700 hover:text-amber-400 text-lg leading-none"
          >
            ×
          </button>
        </div>
        {/* Search */}
        <div className="p-3 border-b border-amber-900/30">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (suggestions.length > 0) handleSelect(suggestions[0]);
                  else handleCustom();
                }
              }}
              placeholder={`Busca ${slotLabel.toLowerCase()}…`}
              className="flex-1 bg-amber-950/40 border border-amber-700/50 rounded-lg px-3 py-1.5 text-amber-100 placeholder:text-amber-600/70 text-sm focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleCustom}
              title="Añadir como objeto custom"
              className="px-3 py-1.5 rounded-lg border border-amber-700/70 text-amber-400 hover:bg-amber-700/30 text-sm font-semibold shrink-0"
            >
              +
            </button>
          </div>
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center gap-1.5 text-xs text-amber-500/80 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={searchAll}
                onChange={(e) => setSearchAll(e.target.checked)}
                className="accent-amber-600 w-3 h-3"
              />
              Buscar en todo el compendio ({allItems.length})
            </label>
            <span className="text-[10px] text-amber-600/60">
              {query.trim()
                ? `${suggestions.length} resultado${suggestions.length !== 1 ? "s" : ""}`
                : `${pool.length} objetos`}
            </span>
          </div>
        </div>
        {/* List */}
        <div className="overflow-y-auto flex-1 divide-y divide-amber-900/20">
          {allItems.length === 0 ? (
            <p className="px-4 py-6 text-xs text-amber-600 italic text-center">
              Cargando compendio…
            </p>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-4 text-xs text-amber-600 italic text-center">
              Sin resultados — pulsa + para añadir como objeto custom
            </p>
          ) : (
            suggestions.map((item) => {
              const dropTags = getItemTags(item.stats ?? {});
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-4 py-2.5 text-sm text-amber-200 hover:bg-amber-700/25 transition-colors"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-medium truncate">{item.name}</span>
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
      </div>
    </div>
  );
}
