import { Link } from "react-router-dom";
import type { BagItem, CompendiumItem } from "../types";
import { AutocompleteInput } from "./AutocompleteInput";

// ─── Bag section ──────────────────────────────────────────────────────────────

const MIN_BAG_ROWS = 4;
const FILTER_ALL = () => true;

export function BagSection({
  items,
  allItems,
  onSelect,
  onChangeQty,
  onRemove,
  readOnly = false,
}: {
  items: BagItem[];
  allItems: CompendiumItem[];
  onSelect: (
    name: string,
    weight?: number,
    srdIndex?: string,
    tags?: string[],
  ) => void;
  onChangeQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  readOnly?: boolean;
}) {
  const emptyCount = Math.max(0, MIN_BAG_ROWS * 2 - items.length);
  return (
    <div className="space-y-2">
      <div className="h-52 overflow-y-auto p-2 rounded-lg bg-black/15 border border-amber-900/25">
        <div className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="px-3 py-2 rounded-lg border border-amber-700/30 bg-amber-900/20 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {item.srdIndex ? (
                    <Link
                      to={`/objetos/${item.srdIndex}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-100 truncate block hover:text-amber-300 hover:underline"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <span
                      className={`truncate block ${item.tags?.includes("CUSTOM") ? "text-amber-100/80 italic" : "text-amber-100"}`}
                    >
                      {item.name}
                    </span>
                  )}
                  {item.weight !== undefined && (
                    <span className="text-[10px] text-amber-600/80">
                      {item.weight} lb
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {!readOnly && (
                    <>
                      <button
                        onClick={() => onChangeQty(item.id, -1)}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-amber-400 font-bold"
                      >
                        −
                      </button>
                      <span className="text-xs font-semibold text-amber-200 w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onChangeQty(item.id, +1)}
                        className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 text-amber-400 font-bold"
                      >
                        +
                      </button>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="ml-1 text-amber-700 hover:text-red-400 leading-none"
                      >
                        ×
                      </button>
                    </>
                  )}
                  {readOnly && (
                    <span className="text-xs font-semibold text-amber-200">
                      ×{item.quantity}
                    </span>
                  )}
                </div>
              </div>
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className={`px-1.5 py-0 rounded text-[9px] leading-4 ${t === "CUSTOM" ? "bg-violet-900/60 text-violet-300/90 font-semibold tracking-wide" : "bg-amber-800/40 text-amber-400/90"}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {Array.from({ length: emptyCount }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center px-3 py-2 rounded-lg border border-dashed border-amber-800/20 text-amber-700/30 text-sm italic"
            >
              — vacío —
            </div>
          ))}
        </div>
      </div>
      {!readOnly && (
        <AutocompleteInput
          allItems={allItems}
          categoryFilter={FILTER_ALL}
          placeholder="Busca cualquier objeto del compendio…"
          onSelect={onSelect}
          hideSearchAll
        />
      )}
    </div>
  );
}
