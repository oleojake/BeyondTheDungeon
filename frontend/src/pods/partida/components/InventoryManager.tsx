// ================================================
// InventoryManager – Gerenciador completo e reutilizable de inventario
// ================================================
// Componente que contiene toda la lógica y UI del inventario.
// Se usa en inventario.scene.tsx, FichaOverlay.tsx, y mi-ficha.scene.tsx

import { useState, useEffect, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  InventoryState,
  CompendiumItem,
  EquippedItem,
  ConsumableItem,
  BagItem,
  Currency,
} from "./inventory/types";
import {
  Silhouette,
  EquipSlot,
  SlotPickerModal,
  ConsumableSection,
  BagSection,
  NotesSection,
} from "./inventory/components";
import {
  EQUIPMENT_SLOTS,
  emptyInventory,
} from "./inventory/utils/slotConfig";
import { FILTER_POTIONS, FILTER_SCROLLS, FILTER_AMMO } from "./inventory/utils/itemFilters";

interface InventoryManagerProps {
  // Estado actual del inventario (JSON string)
  inventory: string;
  onInventoryChange: (newInventory: string) => void;

  // Datos del compendio
  compendiumItems: CompendiumItem[];

  // Configuración
  maxCarryWeight?: number;
  autoMaxCarryWeight?: number;
  onMaxCarryWeightChange?: (weight: number) => void;

  // Notas
  notes?: string;
  onNotesChange?: (notes: string) => void;

  // Modo lectura
  readOnly?: boolean;
}

export function InventoryManager({
  inventory: inventoryJson,
  onInventoryChange,
  compendiumItems,
  maxCarryWeight = 150,
  autoMaxCarryWeight,
  onMaxCarryWeightChange,
  notes = "",
  onNotesChange,
  readOnly = false,
}: InventoryManagerProps) {
  // Parse JSON initial state
  const [inventory, setInventory] = useState<InventoryState>(() => {
    try {
      if (inventoryJson && inventoryJson.trim().startsWith("{")) {
        return JSON.parse(inventoryJson) as InventoryState;
      }
    } catch {
      // Fallback to empty
    }
    return emptyInventory;
  });

  const [openSlot, setOpenSlot] = useState<string | null>(null);
  const [autoCapacity, setAutoCapacity] = useState(() => {
    return !(autoMaxCarryWeight !== undefined && maxCarryWeight !== autoMaxCarryWeight);
  });
  const [manualCapacityStr, setManualCapacityStr] = useState(String(maxCarryWeight));

  useEffect(() => {
    if (!autoCapacity) {
      setManualCapacityStr(String(maxCarryWeight));
    }
  }, [maxCarryWeight, autoCapacity]);

  // Sync to parent when inventory changes
  useEffect(() => {
    onInventoryChange(JSON.stringify(inventory));
  }, [inventory]);

  // ─── Cálculo de peso ───────────────────────────────────

  const autoCurrentWeight =
    inventory.bag.reduce(
      (sum, item) => sum + (item.weight ?? 0) * item.quantity,
      0,
    ) +
    Object.entries(inventory.equipped)
      .filter(([key, item]) => key !== "mount" && item !== null)
      .reduce((sum, [, item]) => sum + (item!.weight ?? 0), 0);

  const mountCapacity = (() => {
    const cap = inventory.equipped["mount"]?.capacity;
    if (!cap) return 0;
    const n = parseFloat(cap.replace(/[^\d.]/g, ""));
    return isNaN(n) ? 0 : n;
  })();

  const effectiveMax = maxCarryWeight + mountCapacity;
  const currentWeight = autoCurrentWeight;

  const overEncumbered = currentWeight > effectiveMax && effectiveMax > 0;
  const weightPct = effectiveMax > 0 ? (currentWeight / effectiveMax) * 100 : 0;

  // ─── Handlers ──────────────────────────────────────────

  const clearSlot = (key: string) => {
    if (readOnly) return;
    setInventory((prev) => ({
      ...prev,
      equipped: { ...prev.equipped, [key]: null },
    }));
  };

  const equipSlot = (
    key: string,
    name: string,
    weight?: number,
    srdIndex?: string,
    tags?: string[],
    capacity?: string,
  ) => {
    if (readOnly) return;
    setInventory((prev) => ({
      ...prev,
      equipped: {
        ...prev.equipped,
        [key]: { id: Math.random().toString(), name, type: key, weight, srdIndex, tags, capacity },
      },
    }));
  };

  const addConsumable = (
    type: "potions" | "scrolls" | "ammo",
    name: string,
  ) => {
    if (readOnly) return;
    setInventory((prev) => ({
      ...prev,
      [type]: [
        ...prev[type],
        { id: Math.random().toString(), name, quantity: 1 },
      ],
    }));
  };

  const changeQty = (
    type: "potions" | "scrolls" | "ammo" | "bag",
    id: string,
    delta: number,
  ) => {
    if (readOnly) return;
    setInventory((prev) => ({
      ...prev,
      [type]: prev[type].map((item: any) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + delta) }
          : item,
      ),
    }));
  };

  const removeItem = (type: "potions" | "scrolls" | "ammo" | "bag", id: string) => {
    if (readOnly) return;
    setInventory((prev) => ({
      ...prev,
      [type]: prev[type].filter((item: any) => item.id !== id),
    }));
  };

  const addBagItem = (name: string, weight?: number, srdIndex?: string) => {
    if (readOnly) return;
    setInventory((prev) => ({
      ...prev,
      bag: [
        ...prev.bag,
        {
          id: Math.random().toString(),
          name,
          quantity: 1,
          weight,
          srdIndex,
        },
      ],
    }));
  };

  const setCurrency = (coin: keyof Currency, value: string) => {
    if (readOnly) return;
    const num = parseInt(value) || 0;
    setInventory((prev) => ({
      ...prev,
      currency: { ...prev.currency, [coin]: Math.max(0, num) },
    }));
  };

  return (
    <div className="space-y-6">
      {/* PAPERDOLL - EQUIPO EQUIPADO */}
      <section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
        <h2 className="text-xl font-semibold text-amber-300 mb-4">⚔️ Equipo Equipado</h2>
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
                item={inventory.equipped[slot.key]}
                onClear={() => clearSlot(slot.key)}
                onOpen={() => !readOnly && setOpenSlot(slot.key)}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
        {!readOnly && (
          <p className="text-xs text-amber-700/50 text-center mt-3">
            Haz clic en un slot para buscar y equipar un objeto
          </p>
        )}
      </section>

      {/* MODAL SELECTOR */}
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
                equipSlot(openSlot, name, weight, srdIndex, tags, capacity)
              }
              onClose={() => setOpenSlot(null)}
            />
          );
        })()}

      {/* POCIONES Y PERGAMINOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
          <h2 className="text-xl font-semibold text-amber-300 mb-1 flex items-center gap-2">
            🧪 Pociones
          </h2>
          <p className="text-xs text-amber-600/70 mb-3 italic">
            Pociones y brebajes mágicos
          </p>
          <ConsumableSection
            items={inventory.potions}
            rowColor="bg-amber-900/25 border-amber-800/35"
            allItems={compendiumItems}
            categoryFilter={FILTER_POTIONS}
            inputPlaceholder="Busca pociones…"
            onSelect={(name) => addConsumable("potions", name)}
            onChangeQty={(id, d) => changeQty("potions", id, d)}
            onRemove={(id) => removeItem("potions", id)}
            readOnly={readOnly}
          />
        </section>

        <section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
          <h2 className="text-xl font-semibold text-amber-300 mb-1 flex items-center gap-2">
            📜 Pergaminos
          </h2>
          <p className="text-xs text-amber-600/70 mb-3 italic">
            Pergaminos de conjuros y recetas
          </p>
          <ConsumableSection
            items={inventory.scrolls}
            rowColor="bg-amber-900/25 border-amber-800/35"
            allItems={compendiumItems}
            categoryFilter={FILTER_SCROLLS}
            inputPlaceholder="Busca pergaminos…"
            onSelect={(name) => addConsumable("scrolls", name)}
            onChangeQty={(id, d) => changeQty("scrolls", id, d)}
            onRemove={(id) => removeItem("scrolls", id)}
            readOnly={readOnly}
          />
        </section>
      </div>

      {/* MUNICIÓN */}
      <section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
        <h2 className="text-xl font-semibold text-amber-300 mb-1 flex items-center gap-2">
          🎯 Munición
        </h2>
        <p className="text-xs text-amber-600/70 mb-3 italic">
          Proyectiles y armas de lanzamiento
        </p>
        <ConsumableSection
          items={inventory.ammo}
          rowColor="bg-amber-900/25 border-amber-800/35"
          allItems={compendiumItems}
          categoryFilter={FILTER_AMMO}
          inputPlaceholder="Busca munición…"
          onSelect={(name) => addConsumable("ammo", name)}
          onChangeQty={(id, d) => changeQty("ammo", id, d)}
          onRemove={(id) => removeItem("ammo", id)}
          readOnly={readOnly}
        />
      </section>

      {/* BOLSA */}
      <section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
        <div className="flex items-baseline gap-3 mb-1">
          <h2 className="text-xl font-semibold text-amber-300">📦 Inventario</h2>
          <span className="text-xs text-amber-600">
            {inventory.bag.reduce((s, i) => s + i.quantity, 0)} objetos
          </span>
        </div>
        <p className="text-xs text-amber-700/60 mb-3 italic">
          Todos los objetos
        </p>
        <BagSection
          items={inventory.bag}
          allItems={compendiumItems}
          onSelect={addBagItem}
          onChangeQty={(id, d) => changeQty("bag", id, d)}
          onRemove={(id) => removeItem("bag", id)}
          readOnly={readOnly}
        />
      </section>

      {/* PESO Y MONEDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PESO */}
        <section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
          <h2 className="text-xl font-semibold text-amber-300 mb-4">⚖️ Peso</h2>
          <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-amber-950/20 rounded border border-amber-700/30">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-widest text-amber-600">Peso Actual</p>
                  <p className={`text-2xl font-bold ${overEncumbered ? "text-red-400" : "text-amber-200"}`}>
                    {currentWeight.toFixed(1)}
                  </p>
                </div>
                <div className="h-16 w-1 bg-amber-800/50 rounded" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-[10px] uppercase tracking-widest text-amber-600">Capacidad máx.</p>
                    {!readOnly && onMaxCarryWeightChange && autoMaxCarryWeight !== undefined && (
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
                  {autoCapacity || !onMaxCarryWeightChange || readOnly ? (
                    <p className="text-2xl font-bold text-amber-200">{maxCarryWeight.toFixed(1)}</p>
                  ) : (
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
                      className="text-2xl font-bold bg-transparent border-b focus:outline-none w-24 text-center text-amber-200 border-amber-700/50 focus:border-amber-400"
                    />
                  )}
                  {mountCapacity > 0 && (
                    <p className="text-[10px] text-amber-500/80 mt-0.5">
                      +{mountCapacity} lb montura → <span className="text-amber-300">{effectiveMax.toFixed(1)} lb total</span>
                    </p>
                  )}
                </div>
              </div>

              {overEncumbered && (
                <p className="text-xs text-red-400 font-semibold mb-2">⚠️ ¡Sobrecargado!</p>
              )}

              {!readOnly && (
                <p className="text-[10px] text-amber-700/80 mt-1 italic">
                  Usa auto para aplicar fuerza × 15 o manual para personalizar la capacidad máxima.
                </p>
              )}
            </div>
          </section>

        {/* MONEDAS */}
        <section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
          <h2 className="text-xl font-semibold text-amber-300 mb-4">💰 Monedas</h2>
          <div className="space-y-2">
            {(["pp", "po", "pe", "pa", "pc"] as const).map((coin) => (
              <div key={coin} className="flex items-center gap-2">
                <label className="text-xs text-amber-600 w-12 uppercase">{coin}</label>
                <Input
                  type="number"
                  min={0}
                  value={inventory.currency[coin]}
                  onChange={(e) => setCurrency(coin, e.target.value)}
                  readOnly={readOnly}
                  className="flex-1 bg-gray-700 border-gray-600 text-amber-300 h-7 text-xs"
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* NOTAS */}
      {onNotesChange && (
        <NotesSection
          value={notes}
          onChange={onNotesChange}
          placeholder="Notas sobre tu inventario, ítems especiales, misiones..."
          readOnly={readOnly}
        />
      )}
    </div>
  );
}
