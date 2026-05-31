// ================================================
// InventoryManager – Componente reutilizable para gestión de inventario
// ================================================
// Orquesta toda la lógica de inventario (paperdoll, consumibles, bolsa, monedas)
// Reutilizable en inventario.scene.tsx, mi-ficha.scene.tsx y FichaOverlay.tsx
// ================================================

import { useState, useMemo, useEffect } from "react";
import { Shirt, FlaskConical, ScrollText, Target, Package, Coins, Scale } from "lucide-react";
import type { CompendiumItem, Currency } from "./types";
import { EQUIPMENT_SLOTS } from "./utils/slotConfig";
import { FILTER_POTIONS, FILTER_SCROLLS, FILTER_AMMO } from "./utils/itemFilters";
import {
  Silhouette,
  EquipSlot,
  SlotPickerModal,
  ConsumableSection,
  BagSection,
  NotesSection,
} from "./components";
import { useInventoryState } from "./hooks/useInventoryState";

export interface InventoryManagerProps {
  inventory: string; // JSON stringified
  onInventoryChange: (newInventory: string) => void;
  compendiumItems: CompendiumItem[];

  // Opcionales
  showNotes?: boolean;
  notes?: string;
  onNotesChange?: (notes: string) => void;
  maxCarryWeight?: number;
  autoMaxCarryWeight?: number;
  onMaxCarryWeightChange?: (val: number) => void;
}

const CURRENCY_LABELS: {
  key: keyof Currency;
  label: string;
  color: string;
}[] = [
  { key: "pp", label: "Platino", color: "text-slate-300" },
  { key: "po", label: "Oro", color: "text-yellow-400" },
  { key: "pe", label: "Electrum", color: "text-teal-400" },
  { key: "pa", label: "Plata", color: "text-gray-300" },
  { key: "pc", label: "Cobre", color: "text-orange-400" },
];

export function InventoryManager({
  inventory: inventoryProp,
  onInventoryChange,
  compendiumItems,
  showNotes = false,
  notes = "",
  onNotesChange,
  maxCarryWeight = 150,
  autoMaxCarryWeight,
  onMaxCarryWeightChange,
}: InventoryManagerProps) {
  // ── Inventory State (usando hook) ─────────────────────────────────────────
  const { inventory: inv, handlers } = useInventoryState({
    initialInventory: inventoryProp,
    onInventoryChange,
  });

  // ── Slot Picker Modal State ───────────────────────────────────────────────
  const [openSlot, setOpenSlot] = useState<string | null>(null);

  // ── Weight Management ─────────────────────────────────────────────────────
  const [autoCapacity, setAutoCapacity] = useState(() => {
    return !(autoMaxCarryWeight !== undefined && maxCarryWeight !== autoMaxCarryWeight);
  });
  const [manualCapacityStr, setManualCapacityStr] = useState(String(maxCarryWeight));

  // Sync manualCapacityStr with maxCarryWeight if it changes externally while in manual mode
  useEffect(() => {
    if (!autoCapacity) {
      setManualCapacityStr(String(maxCarryWeight));
    }
  }, [maxCarryWeight, autoCapacity]);

  // ── Auto Calculate Weight ─────────────────────────────────────────────────
  const autoCurrentWeight = useMemo(() => {
    // Bag items
    const bagWeight = inv.bag.reduce(
      (sum, item) => sum + (item.weight ?? 0) * item.quantity,
      0,
    );
    // Equipped items (excluding mount slot)
    const equipWeight = Object.entries(inv.equipped)
      .filter(([key, item]) => key !== "mount" && item !== null)
      .reduce((sum, [, item]) => sum + (item!.weight ?? 0), 0);
    return bagWeight + equipWeight;
  }, [inv.bag, inv.equipped]);

  // ── Mount Capacity ────────────────────────────────────────────────────────
  const mountCapacity = useMemo(() => {
    const cap = inv.equipped["mount"]?.capacity;
    if (!cap) return 0;
    const n = parseFloat(cap.replace(/[^\d.]/g, ""));
    return isNaN(n) ? 0 : n;
  }, [inv.equipped]);

  const effectiveMax = maxCarryWeight + mountCapacity;
  const currentWeight = autoCurrentWeight;

  const weightPct =
    maxCarryWeight > 0 || mountCapacity > 0
      ? Math.min(100, (currentWeight / effectiveMax) * 100)
      : 0;
  const overEncumbered = effectiveMax > 0 && currentWeight > effectiveMax;

  return (
    <div className="space-y-6">
      {/* ── Carry Weight ─────────────────────────────────────────── */}
      <div className="rounded-xl border border-amber-800/40 bg-[#2a1204]/70 px-5 py-4 flex flex-wrap items-center gap-6">
        <Scale className="w-6 h-6 text-amber-600 shrink-0" />
        <div className="flex items-center gap-6 flex-wrap flex-1">
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center mb-0.5">
              <p className="text-[10px] uppercase tracking-widest text-amber-600">
                Peso actual
              </p>
            </div>
            <p
              className={`text-2xl font-bold ${overEncumbered ? "text-red-400" : "text-amber-200"}`}
            >
              {currentWeight.toFixed(1)}
              <span className="text-sm font-normal text-amber-600 ml-1">
                lb
              </span>
            </p>
          </div>
          <div className="text-amber-800/40 text-xl">|</div>
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center mb-0.5">
              <p className="text-[10px] uppercase tracking-widest text-amber-600">
                Capacidad máx.
              </p>
              {onMaxCarryWeightChange && autoMaxCarryWeight !== undefined && (
                <button
                  onClick={() => {
                    if (autoCapacity) {
                      setManualCapacityStr(String(maxCarryWeight));
                      setAutoCapacity(false);
                    } else {
                      setAutoCapacity(true);
                      onMaxCarryWeightChange(autoMaxCarryWeight);
                    }
                  }}
                  title={
                    autoCapacity
                      ? "Introducir manualmente"
                      : "Volver al cálculo automático"
                  }
                  className="text-[9px] px-1.5 py-0.5 rounded border border-amber-800/50 text-amber-600 hover:text-amber-400 hover:border-amber-600/60 transition-colors"
                >
                  {autoCapacity ? "auto" : "manual"}
                </button>
              )}
            </div>
            {autoCapacity || !onMaxCarryWeightChange ? (
              <div className="flex items-baseline gap-1 justify-center">
                <p className="text-2xl font-bold text-amber-200">{maxCarryWeight}</p>
                <span className="text-sm text-amber-600">lb</span>
              </div>
            ) : (
              <div className="flex items-baseline gap-1 justify-center">
                <input
                  type="text"
                  inputMode="decimal"
                  value={manualCapacityStr}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (/^\d*\.?\d*$/.test(v)) setManualCapacityStr(v);
                  }}
                  onBlur={() => {
                    const n = parseFloat(manualCapacityStr);
                    const validN = isNaN(n) || manualCapacityStr === "" ? 0 : Math.max(0, n);
                    setManualCapacityStr(validN.toString());
                    onMaxCarryWeightChange(validN);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                  className={`text-2xl font-bold bg-transparent border-b focus:outline-none w-20 text-center text-amber-200 border-amber-700/50 focus:border-amber-400`}
                />
                <span className="text-sm text-amber-600">lb</span>
              </div>
            )}
            {mountCapacity > 0 && (
              <p className="text-[10px] text-amber-500/80 mt-0.5">
                +{mountCapacity} lb montura →{" "}
                <span className="text-amber-300">
                  {effectiveMax} lb total
                </span>
              </p>
            )}
          </div>
          {effectiveMax > 0 && (
            <div className="flex-1 min-w-[120px]">
              <div className="h-2 bg-amber-950 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${overEncumbered ? "bg-red-600" : weightPct > 80 ? "bg-yellow-500" : "bg-amber-500"}`}
                  style={{ width: `${weightPct}%` }}
                />
              </div>
              <p
                className={`text-[10px] text-right mt-0.5 ${overEncumbered ? "text-red-400" : "text-amber-700"}`}
              >
                {overEncumbered
                  ? "¡Sobrecargado!"
                  : `${Math.round(weightPct)}% cargado`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════
				    EQUIPO EQUIPADO – Paperdoll con silueta
				════════════════════════════════════════════════════════════ */}
      <section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
        <h2 className="text-xl font-semibold text-amber-300 mb-4 flex items-center gap-2">
          <Shirt className="w-5 h-5" /> Equipo equipado
        </h2>
        <div className="relative w-fit mx-auto">
          <Silhouette />
          <div
            className="relative grid gap-3"
            style={{
              gridTemplateColumns: "repeat(3, 5rem)",
              gridTemplateRows: "repeat(5, 5rem)",
            }}
          >
            {EQUIPMENT_SLOTS.map((slot) => (
              <EquipSlot
                key={slot.key}
                slot={slot}
                item={inv.equipped[slot.key]}
                onClear={() => handlers.clearSlot(slot.key)}
                onOpen={() => setOpenSlot(slot.key)}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-amber-700/50 text-center mt-3">
          Haz clic en un slot para buscar y equipar un objeto
        </p>
      </section>
      {openSlot &&
        (() => {
          const slot = EQUIPMENT_SLOTS.find((s) => s.key === openSlot);
          if (!slot) return null;
          return (
            <SlotPickerModal
              slotLabel={slot.label}
              slotKey={slot.key}
              allItems={compendiumItems}
              onEquip={(name, weight, srdIndex, tags, capacity) =>
                handlers.equipSlot(openSlot!, name, weight, srdIndex, tags, capacity)
              }
              onClose={() => setOpenSlot(null)}
            />
          );
        })()}

      {/* ════════════════════════════════════════════════════════════
				    POCIONES + PERGAMINOS (al mismo nivel)
				════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
          <h2 className="text-xl font-semibold text-amber-300 mb-1 flex items-center gap-2">
            <FlaskConical className="w-5 h-5" /> Pociones
          </h2>
          <p className="text-xs text-amber-600/70 mb-3 italic">
            Pociones y brebajes mágicos
          </p>
          <ConsumableSection
            items={inv.potions}
            rowColor="bg-amber-900/25 border-amber-800/35"
            allItems={compendiumItems}
            categoryFilter={FILTER_POTIONS}
            inputPlaceholder="Busca pociones…"
            onSelect={(name, weight, srdIndex, tags) =>
              handlers.addConsumable("potions", name, weight, srdIndex, tags)
            }
            onChangeQty={(id, d) => handlers.changeQty("potions", id, d)}
            onRemove={(id) => handlers.removeItem("potions", id)}
          />
        </section>

        <section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
          <h2 className="text-xl font-semibold text-amber-300 mb-1 flex items-center gap-2">
            <ScrollText className="w-5 h-5" /> Pergaminos
          </h2>
          <p className="text-xs text-amber-600/70 mb-3 italic">
            Pergaminos de conjuros y recetas
          </p>
          <ConsumableSection
            items={inv.scrolls}
            rowColor="bg-amber-900/25 border-amber-800/35"
            allItems={compendiumItems}
            categoryFilter={FILTER_SCROLLS}
            inputPlaceholder="Busca pergaminos…"
            onSelect={(name, weight, srdIndex, tags) =>
              handlers.addConsumable("scrolls", name, weight, srdIndex, tags)
            }
            onChangeQty={(id, d) => handlers.changeQty("scrolls", id, d)}
            onRemove={(id) => handlers.removeItem("scrolls", id)}
          />
        </section>
      </div>

      {/* ════════════════════════════════════════════════════════════
				    BOLSA – ancho completo, dos columnas, con peso
				════════════════════════════════════════════════════════════ */}
      <section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
        <div className="flex items-baseline gap-3 mb-1">
          <h2 className="text-xl font-semibold text-amber-300 flex items-center gap-2">
            <Package className="w-5 h-5" /> Inventario
          </h2>
          <span className="text-xs text-amber-600">
            {inv.bag.reduce((s, i) => s + i.quantity, 0)} objetos
          </span>
        </div>
        <p className="text-xs text-amber-700/60 mb-3 italic">
          Todos los objetos: equipables no equipados, herramientas,
          consumibles, etc.
        </p>
        <BagSection
          items={inv.bag}
          allItems={compendiumItems}
          onSelect={handlers.addBagItem}
          onChangeQty={(id, d) => handlers.changeQty("bag", id, d)}
          onRemove={(id) => handlers.removeItem("bag", id)}
        />
      </section>

      {/* ════════════════════════════════════════════════════════════
				    MUNICIÓN
				════════════════════════════════════════════════════════════ */}
      <section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
        <h2 className="text-xl font-semibold text-amber-300 mb-1 flex items-center gap-2">
          <Target className="w-5 h-5" /> Munición
        </h2>
        <p className="text-xs text-amber-600/70 mb-3 italic">
          Flechas, virotes, dagas arrojadizas…
        </p>
        <ConsumableSection
          items={inv.ammo}
          rowColor="bg-amber-900/25 border-amber-800/35"
          allItems={compendiumItems}
          categoryFilter={FILTER_AMMO}
          inputPlaceholder="Busca munición…"
          onSelect={(name, weight, srdIndex, tags) =>
            handlers.addConsumable("ammo", name, weight, srdIndex, tags)
          }
          onChangeQty={(id, d) => handlers.changeQty("ammo", id, d)}
          onRemove={(id) => handlers.removeItem("ammo", id)}
        />
      </section>

      {/* ════════════════════════════════════════════════════════════
				    MONEDERO
				════════════════════════════════════════════════════════════ */}
      <section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5 mx-auto w-full max-w-md">
        <h2 className="text-xl font-semibold text-amber-300 mb-4 flex items-center gap-2">
          <Coins className="w-5 h-5" /> Monedero
        </h2>
        <div className="grid grid-cols-5 gap-2">
          {CURRENCY_LABELS.map(({ key, label, color }) => (
            <div
              key={key}
              className="flex flex-col items-center gap-1 rounded-lg border border-amber-800/30 bg-black/20 p-2"
            >
              <span
                className={`text-[10px] font-semibold ${color} text-center`}
              >
                {label}
              </span>
              <input
                type="number"
                min={0}
                value={inv.currency[key]}
                onChange={(e) => handlers.setCurrency(key, e.target.value)}
                className="w-full text-center bg-transparent border-b border-amber-800/40 text-amber-100 text-lg font-bold focus:outline-none focus:border-amber-500"
              />
              <span
                className={`text-[9px] uppercase tracking-wider ${color}`}
              >
                {key}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
				    NOTAS (opcional)
				════════════════════════════════════════════════════════════ */}
      {showNotes && onNotesChange && (
        <NotesSection
          value={notes}
          onChange={onNotesChange}
          placeholder="Anotaciones sobre tu inventario, objetos especiales, misiones..."
        />
      )}
    </div>
  );
}
