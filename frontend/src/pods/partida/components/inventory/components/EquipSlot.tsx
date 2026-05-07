import { EQUIPMENT_SLOTS } from "../utils/slotConfig";
import type { EquippedItem } from "../types";

export function EquipSlot({
  slot,
  item,
  onClear,
  onOpen,
  readOnly = false,
}: {
  slot: (typeof EQUIPMENT_SLOTS)[number];
  item: EquippedItem | null;
  onClear: () => void;
  onOpen: () => void;
  readOnly?: boolean;
}) {
  const Icon = slot.icon;
  return (
    <div
      style={{ gridColumn: slot.col, gridRow: slot.row }}
      onClick={readOnly ? undefined : onOpen}
      className={`group relative flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-lg border-2 border-dashed border-amber-800/50 bg-[#1a0e06]/60 transition-all select-none ${
        readOnly
          ? "cursor-default"
          : "hover:border-amber-500 hover:bg-[#2b1608] cursor-pointer"
      }`}
      title={slot.label}
    >
      {item ? (
        <>
          <span className="text-xs text-amber-200 text-center leading-tight font-medium px-1 line-clamp-2">
            {item.name}
          </span>
          {!readOnly && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              className="absolute -top-1.5 -right-1.5 hidden group-hover:flex w-4 h-4 rounded-full bg-red-700 text-white items-center justify-center text-xs leading-none"
            >
              ×
            </button>
          )}
        </>
      ) : (
        <>
          <Icon className="w-6 h-6 text-amber-800/60" />
          <span className="text-[10px] text-amber-800/60 text-center leading-tight px-1">
            {slot.label}
          </span>
        </>
      )}
    </div>
  );
}
