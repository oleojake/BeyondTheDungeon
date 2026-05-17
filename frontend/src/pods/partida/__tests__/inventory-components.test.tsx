import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// ─── Global UI Mocks ─────────────────────────────────────────────────────────

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

// ─── Mock inventory utils for component tests that import them ─────────────

vi.mock("../components/inventory/utils/itemTags", () => ({
  getItemTags: () => [],
}));

vi.mock("../components/inventory/utils/itemFilters", () => ({
  FILTER_POTIONS: () => true,
  FILTER_SCROLLS: () => true,
  FILTER_AMMO: () => true,
  FILTER_ALL: () => true,
  getSlotFilter: () => () => true,
}));

// ─── Mock child inventory components barrel (used by InventoryManager) ─────

vi.mock("../components/inventory/components", () => ({
  Silhouette: () => <div data-testid="mock-silhouette" />,
  EquipSlot: ({ slot, item, onClear, onOpen, readOnly }: any) => (
    <div data-testid="mock-equip-slot" data-slot-key={slot?.key}>
      {item?.name || "empty"}
    </div>
  ),
  SlotPickerModal: ({ slotLabel, onClose }: any) => (
    <div data-testid="mock-slot-picker-modal">{slotLabel}</div>
  ),
  AutocompleteInput: ({ onSelect, placeholder }: any) => (
    <input
      data-testid="mock-autocomplete"
      placeholder={placeholder}
      onChange={(e) =>
        onSelect?.(e.target.value, undefined, undefined, [])
      }
    />
  ),
  ConsumableSection: ({ items }: any) => (
    <div data-testid="mock-consumable-section">
      {items.length} items
    </div>
  ),
  BagSection: ({ items }: any) => (
    <div data-testid="mock-bag-section">{items.length} items</div>
  ),
  NotesSection: ({ value, onChange, readOnly }: any) => (
    <textarea
      data-testid="mock-notes-section"
      value={value}
      readOnly={readOnly}
      onChange={onChange}
    />
  ),
}));

// ─── Mock useInventoryState (used by InventoryManager) ─────────────────────

vi.mock("../components/inventory/hooks/useInventoryState", () => ({
  useInventoryState: () => ({
    inventory: {
      equipped: {},
      potions: [],
      scrolls: [],
      ammo: [],
      bag: [],
      currency: { pp: 0, po: 0, pe: 0, pa: 0, pc: 0 },
    },
    handlers: {
      equipSlot: vi.fn(),
      clearSlot: vi.fn(),
      addConsumable: vi.fn(),
      changeQty: vi.fn(),
      removeItem: vi.fn(),
      addBagItem: vi.fn(),
      changeBagItemQty: vi.fn(),
      removeBagItem: vi.fn(),
      setCurrency: vi.fn(),
    },
  }),
}));

// ─── Imports ──────────────────────────────────────────────────────────────────

import { InventoryManager } from "../components/inventory/InventoryManager";
import { AutocompleteInput } from "../components/inventory/components/AutocompleteInput";
import { BagSection } from "../components/inventory/components/BagSection";
import { ConsumableSection } from "../components/inventory/components/ConsumableSection";
import { EquipSlot } from "../components/inventory/components/EquipSlot";
import { NotesSection } from "../components/inventory/components/NotesSection";
import { Silhouette } from "../components/inventory/components/Silhouette";
import { SlotPickerModal } from "../components/inventory/components/SlotPickerModal";

import { EQUIPMENT_SLOTS } from "../components/inventory/utils/slotConfig";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const compendiumItems = [
  {
    id: "1",
    name: "Poción de curación",
    type: "Potion",
    weight: "0.5",
    rarity: "Common",
    stats: {},
  },
  {
    id: "2",
    name: "Espada larga",
    type: "Weapon",
    weight: "3",
    rarity: "Common",
    stats: {},
  },
];

// ─── 1. InventoryManager ─────────────────────────────────────────────────────

describe("InventoryManager", () => {
  it("renders carry weight section", () => {
    render(
      <InventoryManager
        inventory='{"equipped":{},"potions":[],"scrolls":[],"ammo":[],"bag":[],"currency":{"pp":0,"po":0,"pe":0,"pa":0,"pc":0}}'
        onInventoryChange={vi.fn()}
        compendiumItems={compendiumItems}
      />,
    );
    expect(screen.getByText("Peso actual")).toBeTruthy();
    expect(screen.getByText("Capacidad máx.")).toBeTruthy();
  });

  it("renders equipped equipment section", () => {
    render(
      <InventoryManager
        inventory='{"equipped":{},"potions":[],"scrolls":[],"ammo":[],"bag":[],"currency":{"pp":0,"po":0,"pe":0,"pa":0,"pc":0}}'
        onInventoryChange={vi.fn()}
        compendiumItems={compendiumItems}
      />,
    );
    expect(screen.getByText("Equipo equipado")).toBeTruthy();
    expect(screen.getByTestId("mock-silhouette")).toBeTruthy();
  });

  it("renders potions and scrolls sections", () => {
    render(
      <InventoryManager
        inventory='{"equipped":{},"potions":[],"scrolls":[],"ammo":[],"bag":[],"currency":{"pp":0,"po":0,"pe":0,"pa":0,"pc":0}}'
        onInventoryChange={vi.fn()}
        compendiumItems={compendiumItems}
      />,
    );
    expect(screen.getByText("Pociones")).toBeTruthy();
    expect(screen.getByText("Pergaminos")).toBeTruthy();
  });

  it("renders ammo, bag and currency sections", () => {
    render(
      <InventoryManager
        inventory='{"equipped":{},"potions":[],"scrolls":[],"ammo":[],"bag":[],"currency":{"pp":0,"po":0,"pe":0,"pa":0,"pc":0}}'
        onInventoryChange={vi.fn()}
        compendiumItems={compendiumItems}
      />,
    );
    expect(screen.getByText("Munición")).toBeTruthy();
    expect(screen.getByText("Inventario")).toBeTruthy();
    expect(screen.getByText("Monedero")).toBeTruthy();
  });

  it("shows NotesSection when showNotes is true", () => {
    render(
      <InventoryManager
        inventory='{"equipped":{},"potions":[],"scrolls":[],"ammo":[],"bag":[],"currency":{"pp":0,"po":0,"pe":0,"pa":0,"pc":0}}'
        onInventoryChange={vi.fn()}
        compendiumItems={compendiumItems}
        showNotes
        notes="Test notes"
        onNotesChange={vi.fn()}
      />,
    );
    expect(screen.getByTestId("mock-notes-section")).toBeTruthy();
    expect(screen.getByTestId("mock-notes-section")).toHaveValue("Test notes");
  });
});

// ─── 2. AutocompleteInput ────────────────────────────────────────────────────

describe("AutocompleteInput", () => {
  it("renders input and add button", () => {
    render(
      <AutocompleteInput
        allItems={compendiumItems}
        categoryFilter={() => true}
        placeholder="Buscar..."
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByPlaceholderText("Buscar...")).toBeTruthy();
    expect(screen.getByText("+")).toBeTruthy();
  });

  it("shows suggestions on focus", () => {
    render(
      <AutocompleteInput
        allItems={compendiumItems}
        categoryFilter={() => true}
        placeholder="Buscar..."
        onSelect={vi.fn()}
      />,
    );
    const input = screen.getByPlaceholderText("Buscar...");
    fireEvent.focus(input);
    expect(screen.getByText("Poción de curación")).toBeTruthy();
    expect(screen.getByText("Espada larga")).toBeTruthy();
  });

  it("filters suggestions as user types", () => {
    render(
      <AutocompleteInput
        allItems={compendiumItems}
        categoryFilter={() => true}
        placeholder="Buscar..."
        onSelect={vi.fn()}
      />,
    );
    const input = screen.getByPlaceholderText("Buscar...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "poci" } });
    expect(screen.getByText("Poción de curación")).toBeTruthy();
    expect(screen.queryByText("Espada larga")).toBeNull();
  });

  it("shows 'no results' when nothing matches", () => {
    render(
      <AutocompleteInput
        allItems={compendiumItems}
        categoryFilter={() => true}
        placeholder="Buscar..."
        onSelect={vi.fn()}
      />,
    );
    const input = screen.getByPlaceholderText("Buscar...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "zzzzz" } });
    expect(
      screen.getByText(/Sin resultados/),
    ).toBeTruthy();
  });

  it("calls onSelect when + button is clicked", () => {
    const onSelect = vi.fn();
    render(
      <AutocompleteInput
        allItems={compendiumItems}
        categoryFilter={() => true}
        placeholder="Buscar..."
        onSelect={onSelect}
      />,
    );
    const input = screen.getByPlaceholderText("Buscar...");
    fireEvent.change(input, { target: { value: "Objeto custom" } });
    fireEvent.click(screen.getByText("+"));
    expect(onSelect).toHaveBeenCalledWith(
      "Objeto custom",
      undefined,
      undefined,
      ["CUSTOM"],
    );
  });

  it("shows 'Cargando compendio' when allItems is empty", () => {
    render(
      <AutocompleteInput
        allItems={[]}
        categoryFilter={() => true}
        placeholder="Buscar..."
        onSelect={vi.fn()}
      />,
    );
    const input = screen.getByPlaceholderText("Buscar...");
    fireEvent.focus(input);
    expect(screen.getByText("Cargando compendio…")).toBeTruthy();
  });
});

// ─── 3. BagSection ────────────────────────────────────────────────────────────

describe("BagSection", () => {
  it("renders bag items with quantity controls", () => {
    const items = [
      { id: "b1", name: "Cuerda", quantity: 2, weight: 5 },
    ];
    render(
      <MemoryRouter>
        <BagSection
          items={items}
          allItems={compendiumItems}
          onSelect={vi.fn()}
          onChangeQty={vi.fn()}
          onRemove={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("Cuerda")).toBeTruthy();
    expect(screen.getByText("2")).toBeTruthy();
    expect(screen.getByText("5 lb")).toBeTruthy();
  });

  it("renders empty slots when there are few items", () => {
    render(
      <MemoryRouter>
        <BagSection
          items={[]}
          allItems={compendiumItems}
          onSelect={vi.fn()}
          onChangeQty={vi.fn()}
          onRemove={vi.fn()}
        />
      </MemoryRouter>,
    );
    const emptySlots = screen.getAllByText("— vacío —");
    expect(emptySlots.length).toBeGreaterThanOrEqual(8);
  });

  it("renders with autocomplete input", () => {
    render(
      <MemoryRouter>
        <BagSection
          items={[]}
          allItems={compendiumItems}
          onSelect={vi.fn()}
          onChangeQty={vi.fn()}
          onRemove={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(
      screen.getByPlaceholderText("Busca cualquier objeto del compendio…"),
    ).toBeTruthy();
  });
});

// ─── 4. ConsumableSection ─────────────────────────────────────────────────────

describe("ConsumableSection", () => {
  it("renders consumable items with quantity controls", () => {
    const items = [
      { id: "c1", name: "Poción de curación", quantity: 3 },
    ];
    render(
      <MemoryRouter>
        <ConsumableSection
          items={items}
          rowColor="bg-amber-900/25 border-amber-800/35"
          allItems={compendiumItems}
          categoryFilter={() => true}
          inputPlaceholder="Busca pociones…"
          onSelect={vi.fn()}
          onChangeQty={vi.fn()}
          onRemove={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("Poción de curación")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
  });

  it("renders empty placeholders when items are few", () => {
    render(
      <MemoryRouter>
        <ConsumableSection
          items={[]}
          rowColor="bg-amber-900/25 border-amber-800/35"
          allItems={compendiumItems}
          categoryFilter={() => true}
          inputPlaceholder="Busca…"
          onSelect={vi.fn()}
          onChangeQty={vi.fn()}
          onRemove={vi.fn()}
        />
      </MemoryRouter>,
    );
    const empties = screen.getAllByText("— vacío —");
    expect(empties.length).toBe(4);
  });

  it("shows autocomplete input", () => {
    render(
      <MemoryRouter>
        <ConsumableSection
          items={[]}
          rowColor="bg-amber-900/25 border-amber-800/35"
          allItems={compendiumItems}
          categoryFilter={() => true}
          inputPlaceholder="Busca pociones…"
          onSelect={vi.fn()}
          onChangeQty={vi.fn()}
          onRemove={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(screen.getByPlaceholderText("Busca pociones…")).toBeTruthy();
  });
});

// ─── 5. EquipSlot ─────────────────────────────────────────────────────────────

describe("EquipSlot", () => {
  it("renders empty slot with icon and label", () => {
    const slot = EQUIPMENT_SLOTS[0];
    render(
      <EquipSlot
        slot={slot}
        item={null}
        onClear={vi.fn()}
        onOpen={vi.fn()}
      />,
    );
    expect(screen.getByText(slot.label)).toBeTruthy();
  });

  it("renders equipped item name", () => {
    const slot = EQUIPMENT_SLOTS[0];
    const item = {
      id: "e1",
      name: "Yelmo de hierro",
      type: "armor",
    };
    render(
      <EquipSlot
        slot={slot}
        item={item}
        onClear={vi.fn()}
        onOpen={vi.fn()}
      />,
    );
    expect(screen.getByText("Yelmo de hierro")).toBeTruthy();
  });

  it("shows clear button on hover when item is equipped", () => {
    const slot = EQUIPMENT_SLOTS[0];
    const item = {
      id: "e1",
      name: "Yelmo",
      type: "armor",
    };
    render(
      <EquipSlot
        slot={slot}
        item={item}
        onClear={vi.fn()}
        onOpen={vi.fn()}
      />,
    );
    const clearBtn = screen.getByText("×");
    expect(clearBtn).toBeTruthy();
  });
});

// ─── 6. NotesSection ──────────────────────────────────────────────────────────

describe("NotesSection", () => {
  it("renders with provided value", () => {
    render(
      <NotesSection value="My note" onChange={vi.fn()} />,
    );
    expect(screen.getByText("Notas")).toBeTruthy();
    expect(screen.getByDisplayValue("My note")).toBeTruthy();
  });

  it("calls onChange when text changes", () => {
    const onChange = vi.fn();
    render(
      <NotesSection value="" onChange={onChange} />,
    );
    const textarea = screen.getByPlaceholderText(
      "Añade notas sobre tu personaje, equipo o campañas...",
    );
    fireEvent.change(textarea, { target: { value: "new note" } });
    expect(onChange).toHaveBeenCalledWith("new note");
  });

  it("renders readOnly textarea when readOnly is true", () => {
    render(
      <NotesSection value="Read only" onChange={vi.fn()} readOnly />,
    );
    const textarea = screen.getByDisplayValue("Read only");
    expect(textarea).toHaveAttribute("readOnly");
  });
});

// ─── 7. Silhouette ────────────────────────────────────────────────────────────

describe("Silhouette", () => {
  it("renders an SVG element", () => {
    const { container } = render(<Silhouette />);
    const svg = container.querySelector("svg");
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute("viewBox")).toBe("0 0 100 230");
  });
});

// ─── 8. SlotPickerModal ───────────────────────────────────────────────────────

describe("SlotPickerModal", () => {
  it("renders modal with slot label", () => {
    render(
      <SlotPickerModal
        slotLabel="Casco"
        slotKey="helmet"
        allItems={compendiumItems}
        onEquip={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/Equipar/)).toBeTruthy();
    expect(screen.getByText("Casco")).toBeTruthy();
  });

  it("shows search input focused", () => {
    render(
      <SlotPickerModal
        slotLabel="Casco"
        slotKey="helmet"
        allItems={compendiumItems}
        onEquip={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const input = screen.getByPlaceholderText("Busca casco…");
    expect(input).toBeTruthy();
    expect(document.activeElement).toBe(input);
  });

  it("renders items filtered by slot", () => {
    render(
      <SlotPickerModal
        slotLabel="Casco"
        slotKey="helmet"
        allItems={compendiumItems}
        onEquip={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Poción de curación")).toBeTruthy();
    expect(screen.getByText("Espada larga")).toBeTruthy();
  });

  it("calls onEquip and onClose when an item is clicked", () => {
    const onEquip = vi.fn();
    const onClose = vi.fn();
    render(
      <SlotPickerModal
        slotLabel="Casco"
        slotKey="helmet"
        allItems={compendiumItems}
        onEquip={onEquip}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByText("Espada larga"));
    expect(onEquip).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when backdrop is clicked", () => {
    const onClose = vi.fn();
    const { container } = render(
      <SlotPickerModal
        slotLabel="Casco"
        slotKey="helmet"
        allItems={compendiumItems}
        onEquip={vi.fn()}
        onClose={onClose}
      />,
    );
    const backdrop = container.querySelector(".fixed.inset-0");
    fireEvent.mouseDown(backdrop!);
    expect(onClose).toHaveBeenCalled();
  });

  it("shows empty state when allItems is empty", () => {
    render(
      <SlotPickerModal
        slotLabel="Casco"
        slotKey="helmet"
        allItems={[]}
        onEquip={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Cargando compendio…")).toBeTruthy();
  });
});
