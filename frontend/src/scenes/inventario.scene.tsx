import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/core/auth/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HardHat,
  Shirt,
  Wind,
  Grab,
  Gem,
  Sword,
  Swords,
  Footprints,
  Circle,
  HelpCircle,
  FlaskConical,
  ScrollText,
  Target,
  Package,
  Coins,
  Save,
  LogIn,
  UserPlus,
  Info,
  Scale,
  User2,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { routes } from "@/router";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface EquippedItem {
  id: string;
  name: string;
  type: string;
  weight?: number;
  srdIndex?: string;
  tags?: string[];
  capacity?: string;
}

interface ConsumableItem {
  id: string;
  name: string;
  quantity: number;
  srdIndex?: string;
  tags?: string[];
}

interface BagItem {
  id: string;
  name: string;
  quantity: number;
  weight?: number;
  srdIndex?: string;
  tags?: string[];
}

interface Currency {
  pp: number; // Platino
  po: number; // Oro
  pe: number; // Electrum
  pa: number; // Plata
  pc: number; // Cobre
}

interface InventoryState {
  equipped: Record<string, EquippedItem | null>;
  potions: ConsumableItem[];
  scrolls: ConsumableItem[];
  ammo: ConsumableItem[];
  bag: BagItem[];
  currency: Currency;
}

interface CompendiumItem {
  id: string;
  name: string;
  type: string;
  weight: string | null;
  rarity: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats: Record<string, any>;
}

// ─── Extrae etiquetas relevantes de stats ────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getItemTags(stats: Record<string, any>): string[] {
  const tags: string[] = [];
  if (stats.cost?.quantity && stats.cost.unit)
    tags.push(`${stats.cost.quantity} ${stats.cost.unit}`);
  if (stats.damage?.damage_dice) {
    const dtype = stats.damage.damage_type?.name ?? "";
    tags.push(`${stats.damage.damage_dice} ${dtype}`.trim());
  }
  if (stats.two_handed_damage?.damage_dice)
    tags.push(`(${stats.two_handed_damage.damage_dice})`);
  if (stats.armor_class?.base) {
    const dex = stats.armor_class.dex_bonus ? "+Des" : "";
    tags.push(`CA ${stats.armor_class.base}${dex}`);
  }
  if (
    stats.weapon_range === "Melee" &&
    stats.range?.normal &&
    stats.range.normal > 5
  )
    tags.push(`Alcance ${stats.range.normal} ft`);
  if (stats.throw_range?.normal)
    tags.push(
      `Lanzado ${stats.throw_range.normal}/${stats.throw_range.long ?? "?"} ft`,
    );
  if (stats.weapon_range === "Ranged" && stats.range?.normal)
    tags.push(`${stats.range.normal}/${stats.range.long ?? "?"} ft`);
  if (stats.rarity?.name && stats.rarity.name !== "None")
    tags.push(stats.rarity.name);
  if (stats.weapon_category) tags.push(stats.weapon_category);
  if (stats.armor_category) tags.push(stats.armor_category);
  if (stats.stealth_disadvantage) tags.push("Sigilo DesV");
  if (stats.capacity) tags.push(`Cap. ${stats.capacity}`);
  const skipProps = new Set(["monk", "special"]);
  (stats.properties ?? []).forEach((p: { index: string; name: string }) => {
    if (!skipProps.has(p.index)) tags.push(p.name);
  });
  return tags;
}

// ─── Filtros por categoría ────────────────────────────────────────────────────

const FILTER_POTIONS = (item: CompendiumItem) =>
  item.stats?.equipment_category?.name === "Potion" ||
  item.name.toLowerCase().includes("potion") ||
  item.name.toLowerCase().includes("poci");

const FILTER_SCROLLS = (item: CompendiumItem) =>
  item.stats?.equipment_category?.name === "Scroll" ||
  item.name.toLowerCase().includes("scroll") ||
  item.name.toLowerCase().includes("pergamino");

const FILTER_AMMO = (item: CompendiumItem) =>
  item.stats?.gear_category?.name === "Ammunition" ||
  (item.stats?.properties ?? []).some(
    (p: { name: string }) => p.name === "Thrown",
  );

const FILTER_ALL = () => true;

// ─── Filtros por slot de equipo ───────────────────────────────────────────────

function filterHelmet(item: CompendiumItem): boolean {
  const n = item.name.toLowerCase();
  const cat = item.stats?.equipment_category?.name ?? "";
  return (
    (cat === "Wondrous Items" &&
      /helm|hat|cap|crown|tiara|headband/i.test(n)) ||
    /helm|hat|cap|crown|tiara|headband/i.test(n)
  );
}

function filterAmulet(item: CompendiumItem): boolean {
  return /necklace|amulet|pendant|medallion/i.test(item.name);
}

function filterArmor(item: CompendiumItem): boolean {
  const cat = item.stats?.equipment_category?.name ?? "";
  const ac = item.stats?.armor_category ?? "";
  const n = item.name.toLowerCase();
  return (
    (cat === "Armor" && ac !== "Shield") ||
    (cat === "Wondrous Items" && /robe|mantle/i.test(n))
  );
}

function filterCloak(item: CompendiumItem): boolean {
  return /cloak|cape|mantle|robe/i.test(item.name);
}

function filterGloves(item: CompendiumItem): boolean {
  return /gloves|gauntlets|bracers|bracer/i.test(item.name);
}

function filterWeapon(item: CompendiumItem): boolean {
  const cat = item.stats?.equipment_category?.name ?? "";
  return (
    cat === "Weapon" ||
    cat === "Rod" ||
    cat === "Staff" ||
    cat === "Wand" ||
    (cat === "Wondrous Items" &&
      /sword|blade|bow|wand|rod|staff/i.test(item.name))
  );
}

function filterOffhand(item: CompendiumItem): boolean {
  const cat = item.stats?.equipment_category?.name ?? "";
  const ac = item.stats?.armor_category ?? "";
  return (
    cat === "Weapon" ||
    cat === "Rod" ||
    cat === "Staff" ||
    cat === "Wand" ||
    (cat === "Armor" && ac === "Shield") ||
    /shield|buckler/i.test(item.name)
  );
}

function filterRing(item: CompendiumItem): boolean {
  const cat = item.stats?.equipment_category?.name ?? "";
  return cat === "Ring" || /ring/i.test(item.name);
}

function filterBelt(item: CompendiumItem): boolean {
  return /belt|girdle/i.test(item.name);
}

function filterBoots(item: CompendiumItem): boolean {
  return /boots|boot|shoes|slippers|sandals|greaves/i.test(item.name);
}

function filterMount(item: CompendiumItem): boolean {
  const cat = item.stats?.equipment_category?.name ?? "";
  return cat === "Mounts and Vehicles";
}

// (intermediate draft constants removed)
function getSlotFilter(slotKey: string): (item: CompendiumItem) => boolean {
  switch (slotKey) {
    case "helmet":
      return filterHelmet;
    case "amulet":
      return filterAmulet;
    case "armor":
      return filterArmor;
    case "cloak":
      return filterCloak;
    case "gloves":
      return filterGloves;
    case "mainhand":
      return filterWeapon;
    case "offhand":
      return filterOffhand;
    case "ring1":
    case "ring2":
      return filterRing;
    case "belt":
      return filterBelt;
    case "boots":
      return filterBoots;
    case "mount":
      return filterMount;
    default:
      return FILTER_ALL;
  }
}

// ─── Slots del Paperdoll ─────────────────────────────────────────────────────
// col/row are 1-based CSS grid positions (3 cols × 5 rows)
// Empty cells (row 1 col 1, row 1 col 3) are left as natural gap in the grid

const EQUIPMENT_SLOTS = [
  { key: "helmet", label: "Casco", icon: HardHat, col: 2, row: 1 },
  { key: "amulet", label: "Colgante", icon: Gem, col: 1, row: 2 },
  { key: "armor", label: "Armadura", icon: Shirt, col: 2, row: 2 },
  { key: "cloak", label: "Capa", icon: Wind, col: 3, row: 2 },
  { key: "gloves", label: "Guantes", icon: Grab, col: 1, row: 3 },
  { key: "mainhand", label: "Arma principal", icon: Sword, col: 2, row: 3 },
  { key: "offhand", label: "Arma sec. / Escudo", icon: Swords, col: 3, row: 3 },
  { key: "ring1", label: "Anillo izq.", icon: Circle, col: 1, row: 4 },
  { key: "belt", label: "Cinturón", icon: HelpCircle, col: 2, row: 4 },
  { key: "ring2", label: "Anillo der.", icon: Circle, col: 3, row: 4 },
  { key: "boots", label: "Botas", icon: Footprints, col: 2, row: 5 },
  { key: "mount", label: "Montura", icon: HelpCircle, col: 3, row: 5 },
] as const;

// ─── Estado inicial ──────────────────────────────────────────────────────────

const emptyInventory: InventoryState = {
  equipped: Object.fromEntries(EQUIPMENT_SLOTS.map((s) => [s.key, null])),
  potions: [],
  scrolls: [],
  ammo: [],
  bag: [],
  currency: { pp: 0, po: 0, pe: 0, pa: 0, pc: 0 },
};

// ─── Silueta SVG de fondo ─────────────────────────────────────────────────────

function Silhouette() {
  return (
    <svg
      viewBox="0 0 100 230"
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      fill="none"
      stroke="#f59e0b"
      strokeWidth="3.5"
      strokeLinecap="round"
      style={{ opacity: 0.08 }}
    >
      {/* Cabeza */}
      <circle cx="50" cy="22" r="13" />
      {/* Cuello */}
      <line x1="50" y1="35" x2="50" y2="45" />
      {/* Torso */}
      <line x1="50" y1="45" x2="50" y2="115" />
      {/* Hombros */}
      <line x1="20" y1="52" x2="80" y2="52" />
      {/* Brazo izquierdo */}
      <line x1="20" y1="52" x2="16" y2="95" />
      {/* Brazo derecho */}
      <line x1="80" y1="52" x2="84" y2="95" />
      {/* Manos */}
      <circle cx="16" cy="98" r="3" />
      <circle cx="84" cy="98" r="3" />
      {/* Cadera */}
      <line x1="34" y1="115" x2="66" y2="115" />
      {/* Pierna izquierda */}
      <line x1="38" y1="115" x2="32" y2="175" />
      {/* Pierna derecha */}
      <line x1="62" y1="115" x2="68" y2="175" />
      {/* Pies */}
      <line x1="32" y1="175" x2="22" y2="181" />
      <line x1="68" y1="175" x2="78" y2="181" />
    </svg>
  );
}

// ─── Componente de Slot ───────────────────────────────────────────────────────

function EquipSlot({
  slot,
  item,
  onClear,
  onOpen,
}: {
  slot: (typeof EQUIPMENT_SLOTS)[number];
  item: EquippedItem | null;
  onClear: () => void;
  onOpen: () => void;
}) {
  const Icon = slot.icon;
  return (
    <div
      style={{ gridColumn: slot.col, gridRow: slot.row }}
      onClick={onOpen}
      className="group relative flex flex-col items-center justify-center gap-1 w-20 h-20 rounded-lg border-2 border-dashed border-amber-800/50 bg-[#1a0e06]/60 hover:border-amber-500 hover:bg-[#2b1608] transition-all cursor-pointer select-none"
      title={slot.label}
    >
      {item ? (
        <>
          <span className="text-xs text-amber-200 text-center leading-tight font-medium px-1 line-clamp-2">
            {item.name}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="absolute -top-1.5 -right-1.5 hidden group-hover:flex w-4 h-4 rounded-full bg-red-700 text-white items-center justify-center text-xs leading-none"
          >
            ×
          </button>
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

// ─── SlotPickerModal ──────────────────────────────────────────────────────────

function SlotPickerModal({
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

// ─── AutocompleteInput ────────────────────────────────────────────────────────

function AutocompleteInput({
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

// ─── Consumable section ───────────────────────────────────────────────────────

const MIN_ROWS = 4;
const MIN_BAG_ROWS = 4;

function ConsumableSection({
  items,
  rowColor,
  allItems,
  categoryFilter,
  inputPlaceholder,
  onSelect,
  onChangeQty,
  onRemove,
}: {
  items: ConsumableItem[];
  rowColor: string;
  allItems: CompendiumItem[];
  categoryFilter: (item: CompendiumItem) => boolean;
  inputPlaceholder: string;
  onSelect: (
    name: string,
    weight?: number,
    srdIndex?: string,
    tags?: string[],
  ) => void;
  onChangeQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
}) {
  const emptyCount = Math.max(0, MIN_ROWS - items.length);
  return (
    <div className="space-y-2">
      <div className="h-44 overflow-y-auto space-y-1.5 p-2 rounded-lg bg-black/15 border border-amber-900/25">
        {items.map((item) => (
          <div
            key={item.id}
            className={`px-3 py-2 rounded-lg border text-sm ${rowColor}`}
          >
            <div className="flex items-center justify-between gap-2">
              {item.srdIndex ? (
                <a
                  href={`/objetos?q=${encodeURIComponent(item.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-100 truncate flex-1 hover:text-amber-300 hover:underline"
                >
                  {item.name}
                </a>
              ) : (
                <span
                  className={`truncate flex-1 ${item.tags?.includes("CUSTOM") ? "text-amber-100/80 italic" : "text-amber-100"}`}
                >
                  {item.name}
                </span>
              )}
              <div className="flex items-center gap-1 shrink-0">
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
              </div>
            </div>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.tags.map((t) => (
                  <span
                    key={t}
                    className={`px-1.5 py-0 rounded text-[9px] leading-4 ${
                      t === "CUSTOM"
                        ? "bg-violet-900/60 text-violet-300/90 font-semibold tracking-wide"
                        : "bg-amber-800/40 text-amber-400/90"
                    }`}
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
      <AutocompleteInput
        allItems={allItems}
        categoryFilter={categoryFilter}
        placeholder={inputPlaceholder}
        onSelect={onSelect}
      />
    </div>
  );
}

// ─── Bag section ──────────────────────────────────────────────────────────────

function BagSection({
  items,
  allItems,
  onSelect,
  onChangeQty,
  onRemove,
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
                    <a
                      href={`/objetos?q=${encodeURIComponent(item.name)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-100 truncate block hover:text-amber-300 hover:underline"
                    >
                      {item.name}
                    </a>
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
      <AutocompleteInput
        allItems={allItems}
        categoryFilter={FILTER_ALL}
        placeholder="Busca cualquier objeto del compendio…"
        onSelect={onSelect}
        hideSearchAll
      />
    </div>
  );
}
// ─── Componente principal ─────────────────────────────────────────────────────

export const InventarioScene = () => {
  const { user, session } = useAuth();
  const [inventory, setInventory] = useState<InventoryState>(emptyInventory);
  const [compendiumItems, setCompendiumItems] = useState<CompendiumItem[]>([]);
  const [maxCarryWeight, setMaxCarryWeight] = useState(150);
  const [autoWeight, setAutoWeight] = useState(true);
  const [manualWeightStr, setManualWeightStr] = useState("0.0");

  // ── Character linking ────────────────────────────────────────────────────
  const [characters, setCharacters] = useState<
    { id: string; name: string; race: string; level: number }[]
  >([]);
  const [linkedCharId, setLinkedCharId] = useState<string | null>(null);
  const [linkedCharName, setLinkedCharName] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [charsLoading, setCharsLoading] = useState(false);
  const autoCurrentWeight =
    // Bag items
    inventory.bag.reduce(
      (sum, item) => sum + (item.weight ?? 0) * item.quantity,
      0,
    ) +
    // Equipped items (excluding mount slot)
    Object.entries(inventory.equipped)
      .filter(([key, item]) => key !== "mount" && item !== null)
      .reduce((sum, [, item]) => sum + (item!.weight ?? 0), 0);

  // Mount capacity bonus: parse "480 lb." → 480 (stored directly on EquippedItem)
  const mountCapacity = (() => {
    const cap = inventory.equipped["mount"]?.capacity;
    if (!cap) return 0;
    const n = parseFloat(cap.replace(/[^\d.]/g, ""));
    return isNaN(n) ? 0 : n;
  })();

  const effectiveMax = maxCarryWeight + mountCapacity;
  const currentWeight = autoWeight
    ? autoCurrentWeight
    : parseFloat(manualWeightStr) || 0;

  // Scroll to top + fetch all compendium items via backend (service role, no RLS cap)
  useEffect(() => {
    window.scrollTo({ top: 0 });
    const API_URL = import.meta.env.VITE_API_URL || "";
    fetch(`${API_URL}/api/compendium-items`)
      .then((r) => r.json())
      .then(({ items }) => {
        if (Array.isArray(items)) setCompendiumItems(items as CompendiumItem[]);
      })
      .catch(() => {
        /* silently ignore – dropdown will show empty */
      });
  }, []);

  // ── Fetch characters when user logs in (including cross-tab login via Supabase onAuthStateChange)
  useEffect(() => {
    if (!user) {
      setCharacters([]);
      setLinkedCharId(null);
      setLinkedCharName(null);
      return;
    }
    const token = session?.access_token;
    if (!token) return;
    const API_URL = import.meta.env.VITE_API_URL || "";
    setCharsLoading(true);
    fetch(`${API_URL}/api/character-sheets`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(({ characters: chars }) => {
        if (Array.isArray(chars)) setCharacters(chars);
      })
      .catch(() => {})
      .finally(() => setCharsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Equipment ────────────────────────────────────────────────────────────
  const [openSlot, setOpenSlot] = useState<string | null>(null);

  const clearSlot = (key: string) =>
    setInventory((prev) => ({
      ...prev,
      equipped: { ...prev.equipped, [key]: null },
    }));

  const equipSlot = (
    key: string,
    name: string,
    weight?: number,
    srdIndex?: string,
    tags?: string[],
    capacity?: string,
  ) =>
    setInventory((prev) => ({
      ...prev,
      equipped: {
        ...prev.equipped,
        [key]: {
          id: crypto.randomUUID(),
          name,
          type: srdIndex ?? "custom",
          weight,
          srdIndex,
          tags,
          capacity,
        } as EquippedItem,
      },
    }));

  // ── Currency ─────────────────────────────────────────────────────────────
  const setCurrency = (coin: keyof Currency, value: string) => {
    const num = Math.max(0, parseInt(value) || 0);
    setInventory((prev) => ({
      ...prev,
      currency: { ...prev.currency, [coin]: num },
    }));
  };

  // ── Consumables ──────────────────────────────────────────────────────────
  const addConsumable = (
    field: "potions" | "scrolls" | "ammo",
    name: string,
    _weight?: number,
    srdIndex?: string,
    tags?: string[],
  ) => {
    if (!name.trim()) return;
    setInventory((prev) => ({
      ...prev,
      [field]: [
        ...prev[field],
        {
          id: crypto.randomUUID(),
          name: name.trim(),
          quantity: 1,
          srdIndex,
          tags,
        },
      ],
    }));
  };

  const changeQty = (
    field: "potions" | "scrolls" | "ammo" | "bag",
    id: string,
    delta: number,
  ) =>
    setInventory((prev) => ({
      ...prev,
      [field]: (prev[field] as (ConsumableItem | BagItem)[])
        .map((i) =>
          i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i,
        )
        .filter((i) => i.quantity > 0),
    }));

  const removeItem = (
    field: "potions" | "scrolls" | "ammo" | "bag",
    id: string,
  ) =>
    setInventory((prev) => ({
      ...prev,
      [field]: (prev[field] as (ConsumableItem | BagItem)[]).filter(
        (i) => i.id !== id,
      ),
    }));

  const addBagItem = (
    name: string,
    weight?: number,
    srdIndex?: string,
    tags?: string[],
  ) => {
    if (!name.trim()) return;
    setInventory((prev) => ({
      ...prev,
      bag: [
        ...prev.bag,
        {
          id: crypto.randomUUID(),
          name: name.trim(),
          quantity: 1,
          weight,
          srdIndex,
          tags,
        },
      ],
    }));
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const loadCharInventory = async (id: string, name: string) => {
    const token = session?.access_token;
    if (!token) return;
    const API_URL = import.meta.env.VITE_API_URL || "";
    try {
      const res = await fetch(`${API_URL}/api/character-sheet/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { character } = await res.json();
      if (character?.inventory) {
        const parsed = JSON.parse(character.inventory) as InventoryState;
        setInventory(parsed);
      } else {
        setInventory(emptyInventory);
      }
    } catch {
      /* keep current inventory if load fails */
    }
    setLinkedCharId(id);
    setLinkedCharName(name);
  };

  const handleSave = async () => {
    if (!user) {
      window.open(routes.login, "_blank");
      return;
    }
    if (!linkedCharId) return;
    const token = session?.access_token;
    if (!token) return;
    const API_URL = import.meta.env.VITE_API_URL || "";
    setSaveStatus("saving");
    try {
      const res = await fetch(
        `${API_URL}/api/character-sheet/${linkedCharId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inventory: JSON.stringify(inventory) }),
        },
      );
      if (!res.ok) throw new Error();
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

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

  const weightPct =
    maxCarryWeight > 0 || mountCapacity > 0
      ? Math.min(100, (currentWeight / effectiveMax) * 100)
      : 0;
  const overEncumbered = effectiveMax > 0 && currentWeight > effectiveMax;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
        {/* ── Cabecera ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-amber-200">Inventario</h1>
            <p className="text-amber-400/70 text-sm mt-1">
              Gestiona el equipo, consumibles y monedas de tu personaje
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saveStatus === "saving" || (!!user && !linkedCharId)}
            className="bg-amber-700 hover:bg-amber-600 text-white gap-2 self-start sm:self-auto disabled:opacity-60"
          >
            {saveStatus === "saving" && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {saveStatus === "saved" && (
              <CheckCircle2 className="w-4 h-4 text-green-300" />
            )}
            {saveStatus === "error" && (
              <AlertCircle className="w-4 h-4 text-red-300" />
            )}
            {saveStatus === "idle" &&
              (user ? (
                <Save className="w-4 h-4" />
              ) : (
                <LogIn className="w-4 h-4" />
              ))}
            {saveStatus === "saving"
              ? "Guardando…"
              : saveStatus === "saved"
                ? "¡Guardado!"
                : saveStatus === "error"
                  ? "Error al guardar"
                  : !user
                    ? "Inicia sesión para guardar"
                    : !linkedCharId
                      ? "Elige un personaje"
                      : "Guardar"}
          </Button>
        </div>

        {/* ── Banner invitados ──────────────────────────────────────── */}
        {!user && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-700/40 bg-amber-950/40 px-4 py-3 text-sm text-amber-300">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Puedes explorar el inventario libremente. Para guardar los cambios
              en un personaje,{" "}
              <Link
                to={routes.login}
                className="underline hover:text-amber-100"
              >
                inicia sesión
              </Link>{" "}
              o{" "}
              <Link
                to={routes.register}
                className="underline hover:text-amber-100"
              >
                crea una cuenta
              </Link>
              .
            </span>
          </div>
        )}

        {/* ── Selector de personaje (solo cuando logueado) ──────────── */}
        {user && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-800/40 bg-amber-950/30 px-4 py-3 text-sm">
            <User2 className="w-4 h-4 text-amber-500 shrink-0" />
            {charsLoading ? (
              <span className="text-amber-500 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Cargando personajes…
              </span>
            ) : characters.length === 0 ? (
              <span className="text-amber-600">
                No tienes personajes aún.{" "}
                <Link
                  to={routes.misFichas}
                  className="underline hover:text-amber-400"
                >
                  Crea uno primero
                </Link>
                .
              </span>
            ) : linkedCharId ? (
              <div className="flex items-center gap-3 flex-1 flex-wrap">
                <span className="text-amber-300">
                  Vinculado a:{" "}
                  <strong className="text-amber-200">{linkedCharName}</strong>
                </span>
                <button
                  onClick={() => {
                    setLinkedCharId(null);
                    setLinkedCharName(null);
                  }}
                  className="text-amber-600 hover:text-amber-400 text-xs underline"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1 flex-wrap">
                <span className="text-amber-500 shrink-0">
                  Elige un personaje:
                </span>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    const char = characters.find(
                      (c) => c.id === e.target.value,
                    );
                    if (!char) return;
                    const hasLocal =
                      inventory.bag.length > 0 ||
                      inventory.potions.length > 0 ||
                      inventory.scrolls.length > 0 ||
                      inventory.ammo.length > 0 ||
                      Object.values(inventory.equipped).some(Boolean);
                    if (hasLocal) {
                      const load = window.confirm(
                        `¿Cargar el inventario guardado de "${char.name}"?\n\nAceptar → reemplaza el inventario actual con el del personaje.\nCancelar → mantiene el inventario actual y lo vincula al personaje.`,
                      );
                      if (load) loadCharInventory(char.id, char.name);
                      else {
                        setLinkedCharId(char.id);
                        setLinkedCharName(char.name);
                      }
                    } else {
                      loadCharInventory(char.id, char.name);
                    }
                  }}
                  className="bg-amber-950/60 border border-amber-700/50 rounded px-2 py-1 text-amber-200 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="" disabled>
                    — selecciona —
                  </option>
                  {characters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Nv. {c.level})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* ── Carry Weight ─────────────────────────────────────────── */}
        <div className="rounded-xl border border-amber-800/40 bg-[#2a1204]/70 px-5 py-4 flex flex-wrap items-center gap-6">
          <Scale className="w-6 h-6 text-amber-600 shrink-0" />
          <div className="flex items-center gap-6 flex-wrap flex-1">
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-0.5">
                <p className="text-[10px] uppercase tracking-widest text-amber-600">
                  Peso actual
                </p>
                <button
                  onClick={() => {
                    if (autoWeight)
                      setManualWeightStr(autoCurrentWeight.toFixed(1));
                    setAutoWeight((v) => !v);
                  }}
                  title={
                    autoWeight
                      ? "Introducir manualmente"
                      : "Volver al cálculo automático"
                  }
                  className="text-[9px] px-1.5 py-0.5 rounded border border-amber-800/50 text-amber-600 hover:text-amber-400 hover:border-amber-600/60 transition-colors"
                >
                  {autoWeight ? "manual" : "auto"}
                </button>
              </div>
              {autoWeight ? (
                <p
                  className={`text-2xl font-bold ${overEncumbered ? "text-red-400" : "text-amber-200"}`}
                >
                  {currentWeight.toFixed(1)}
                  <span className="text-sm font-normal text-amber-600 ml-1">
                    lb
                  </span>
                </p>
              ) : (
                <div className="flex items-baseline gap-1 justify-center">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={manualWeightStr}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^\d*\.?\d*$/.test(v)) setManualWeightStr(v);
                    }}
                    onBlur={() => {
                      const n = parseFloat(manualWeightStr);
                      setManualWeightStr(
                        isNaN(n) || manualWeightStr === ""
                          ? "0.0"
                          : Math.max(0, n).toFixed(1),
                      );
                    }}
                    className={`text-2xl font-bold bg-transparent border-b focus:outline-none w-20 text-center ${
                      overEncumbered
                        ? "text-red-400 border-red-700/50 focus:border-red-400"
                        : "text-amber-200 border-amber-700/50 focus:border-amber-400"
                    }`}
                  />
                  <span className="text-sm text-amber-600">lb</span>
                </div>
              )}
            </div>
            <div className="text-amber-800/40 text-xl">|</div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-amber-600 mb-0.5">
                Capacidad máx.
              </p>
              <div className="flex items-baseline gap-1 justify-center">
                <input
                  type="number"
                  min={0}
                  value={maxCarryWeight}
                  onChange={(e) =>
                    setMaxCarryWeight(
                      Math.max(0, parseFloat(e.target.value) || 0),
                    )
                  }
                  className="text-2xl font-bold text-amber-200 bg-transparent border-b border-amber-700/50 focus:border-amber-400 focus:outline-none w-20 text-center"
                />
                <span className="text-sm text-amber-600">lb</span>
              </div>
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
                  item={inventory.equipped[slot.key]}
                  onClear={() => clearSlot(slot.key)}
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
                  equipSlot(openSlot!, name, weight, srdIndex, tags, capacity)
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
              items={inventory.potions}
              rowColor="bg-amber-900/25 border-amber-800/35"
              allItems={compendiumItems}
              categoryFilter={FILTER_POTIONS}
              inputPlaceholder="Busca pociones…"
              onSelect={(name, weight, srdIndex, tags) =>
                addConsumable("potions", name, weight, srdIndex, tags)
              }
              onChangeQty={(id, d) => changeQty("potions", id, d)}
              onRemove={(id) => removeItem("potions", id)}
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
              items={inventory.scrolls}
              rowColor="bg-amber-900/25 border-amber-800/35"
              allItems={compendiumItems}
              categoryFilter={FILTER_SCROLLS}
              inputPlaceholder="Busca pergaminos…"
              onSelect={(name, weight, srdIndex, tags) =>
                addConsumable("scrolls", name, weight, srdIndex, tags)
              }
              onChangeQty={(id, d) => changeQty("scrolls", id, d)}
              onRemove={(id) => removeItem("scrolls", id)}
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
              {inventory.bag.reduce((s, i) => s + i.quantity, 0)} objetos
            </span>
          </div>
          <p className="text-xs text-amber-700/60 mb-3 italic">
            Todos los objetos: equipables no equipados, herramientas,
            consumibles, etc.
          </p>
          <BagSection
            items={inventory.bag}
            allItems={compendiumItems}
            onSelect={addBagItem}
            onChangeQty={(id, d) => changeQty("bag", id, d)}
            onRemove={(id) => removeItem("bag", id)}
          />
        </section>

        {/* ════════════════════════════════════════════════════════════
				    MUNICIÓN + MONEDERO (al mismo nivel)
				════════════════════════════════════════════════════════════ */}
        <section className="rounded-xl border border-amber-800/30 bg-[#2a1204]/70 p-5">
          <h2 className="text-xl font-semibold text-amber-300 mb-1 flex items-center gap-2">
            <Target className="w-5 h-5" /> Munición
          </h2>
          <p className="text-xs text-amber-600/70 mb-3 italic">
            Flechas, virotes, dagas arrojadizas…
          </p>
          <ConsumableSection
            items={inventory.ammo}
            rowColor="bg-amber-900/25 border-amber-800/35"
            allItems={compendiumItems}
            categoryFilter={FILTER_AMMO}
            inputPlaceholder="Busca munición…"
            onSelect={(name, weight, srdIndex, tags) =>
              addConsumable("ammo", name, weight, srdIndex, tags)
            }
            onChangeQty={(id, d) => changeQty("ammo", id, d)}
            onRemove={(id) => removeItem("ammo", id)}
          />
        </section>

        {/* Monedero – ancho reducido y centrado */}
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
                  value={inventory.currency[key]}
                  onChange={(e) => setCurrency(key, e.target.value)}
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

        {/* ── Footer guardar ────────────────────────────────────────── */}
        <div className="pt-2 border-t border-amber-900/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          {!user ? (
            <p className="text-sm text-amber-600 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span>
                <Link
                  to={routes.register}
                  className="underline hover:text-amber-400"
                >
                  Crea una cuenta
                </Link>{" "}
                para guardar tu inventario vinculado a un personaje.
              </span>
            </p>
          ) : !linkedCharId ? (
            <p className="text-sm text-amber-600">
              Vincula un personaje arriba para poder guardar.
            </p>
          ) : saveStatus === "saved" ? (
            <p className="text-sm text-green-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Guardado correctamente en{" "}
              <strong>{linkedCharName}</strong>.
            </p>
          ) : saveStatus === "error" ? (
            <p className="text-sm text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Error al guardar. Inténtalo de
              nuevo.
            </p>
          ) : (
            <p className="text-sm text-amber-700">
              Los cambios no se guardan automáticamente.
            </p>
          )}
          <Button
            onClick={handleSave}
            disabled={saveStatus === "saving" || (!!user && !linkedCharId)}
            className="bg-amber-700 hover:bg-amber-600 text-white gap-2 disabled:opacity-60"
          >
            {saveStatus === "saving" && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {saveStatus === "saved" && (
              <CheckCircle2 className="w-4 h-4 text-green-300" />
            )}
            {saveStatus === "error" && (
              <AlertCircle className="w-4 h-4 text-red-300" />
            )}
            {saveStatus === "idle" &&
              (user ? (
                <Save className="w-4 h-4" />
              ) : (
                <LogIn className="w-4 h-4" />
              ))}
            {saveStatus === "saving"
              ? "Guardando…"
              : saveStatus === "saved"
                ? "¡Guardado!"
                : saveStatus === "error"
                  ? "Error al guardar"
                  : !user
                    ? "Inicia sesión para guardar"
                    : !linkedCharId
                      ? "Elige un personaje"
                      : "Guardar"}
          </Button>
        </div>
      </div>
  );
};

export default InventarioScene;
