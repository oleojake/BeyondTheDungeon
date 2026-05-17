import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { LucideProps } from "lucide-react";
import type {
  CombatState,
  SessionToken,
  SessionMember,
} from "../partida.vm";
import type { CombatParticipantCandidate, ChapterWithScenes, SceneWithEntities, SceneEntityBasic } from "../partida.vm";
import type { BattleMapListItem } from "@/core/api/battle-map.service";

// ─── Global UI Mocks ─────────────────────────────────────────────────────────

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, className, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: any) => <div data-testid="dialog" data-open={open}>{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogFooter: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("@/components/ui/checkbox", () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input type="checkbox" checked={checked} onChange={onCheckedChange} data-testid="checkbox" />
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)} data-testid="select">{children}</select>
  ),
  SelectContent: ({ children }: any) => <>{children}</>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <>{children}</>,
  SelectValue: () => <></>,
}));

vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} data-testid="input" />,
}));

vi.mock("@/components/ui/textarea", () => ({
  Textarea: (props: any) => <textarea {...props} data-testid="textarea" />,
}));

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children, defaultValue }: any) => <div data-testid="tabs" data-default={defaultValue}>{children}</div>,
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: any) => <button data-testid="tab-trigger" data-value={value}>{children}</button>,
  TabsContent: ({ children, value }: any) => <div data-testid="tab-content" data-value={value}>{children}</div>,
}));

vi.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
}));

vi.mock("../components/inventory/components", () => ({
  Silhouette: () => <div data-testid="silhouette" />,
  EquipSlot: ({ slot, item, onClear, onOpen, readOnly }: any) => (
    <div data-testid="equip-slot" data-slot-key={slot.key}>{item?.name || "empty"}</div>
  ),
  SlotPickerModal: ({ slotLabel, onClose }: any) => (
    <div data-testid="slot-picker-modal">{slotLabel}</div>
  ),
  AutocompleteInput: ({ onSelect }: any) => (
    <input data-testid="autocomplete" onChange={(e) => onSelect?.(e.target.value)} />
  ),
  ConsumableSection: ({ items }: any) => <div data-testid="consumable-section">{items.length} items</div>,
  BagSection: ({ items }: any) => <div data-testid="bag-section">{items.length} items</div>,
  NotesSection: ({ value, onChange, readOnly }: any) => (
    <textarea data-testid="notes-section" value={value} readOnly={readOnly} onChange={onChange} />
  ),
}));

vi.mock("../components/InventoryManager", () => ({
  InventoryManager: ({ inventory, notes }: any) => (
    <div data-testid="inventory-manager">{inventory}{notes}</div>
  ),
}));

// ─── Imports (after mocks) ───────────────────────────────────────────────────

import { BarraInferior } from "../components/BarraInferior";
import { DadosOverlay } from "../components/DadosOverlay";
import { DialogoIniciarCombate } from "../components/DialogoIniciarCombate";
import { FichaOverlay } from "../components/FichaOverlay";
import { InventoryDisplay } from "../components/InventoryDisplay";
import { InventoryViewer } from "../components/InventoryViewer";
import { MapaPartida } from "../components/MapaPartida";
import { OrdenCombate } from "../components/OrdenCombate";
import { PanelDM } from "../components/PanelDM";
import { PanelJugadores } from "../components/PanelJugadores";

// Bring in real InventoryManager via actual import
const { InventoryManager: RealInventoryManager } = await vi.importActual("../components/InventoryManager");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createToken(overrides: Partial<SessionToken> = {}): SessionToken {
  return {
    id: "token-1",
    session_id: "session-1",
    token_type: "player",
    character_id: null,
    user_id: "user-1",
    entity_ref_id: null,
    entity_name: "Test Token",
    entity_image: null,
    x: 100,
    y: 200,
    current_hp: 10,
    max_hp: 20,
    initiative_value: 15,
    is_on_map: true,
    token_color: null,
    token_size: "M" as const,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

function createCombatState(overrides: Partial<CombatState> = {}): CombatState {
  return {
    id: "combat-1",
    session_id: "session-1",
    is_active: true,
    current_turn_index: 0,
    round_number: 1,
    initiative_order: ["token-1"],
    surprise: "none",
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. BarraInferior
// ═══════════════════════════════════════════════════════════════════════════════

describe("BarraInferior", () => {
  beforeEach(() => {
    vi.spyOn(window, "open").mockImplementation(() => null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the campaign title", () => {
    render(<BarraInferior onOpenDados={vi.fn()} campaignTitle="My Campaign" />);
    expect(screen.getByText("My Campaign")).toBeTruthy();
  });

  it("has all four buttons", () => {
    render(<BarraInferior onOpenDados={vi.fn()} campaignTitle="Test" />);
    expect(screen.getByText("Dados")).toBeTruthy();
    expect(screen.getByText("Bestiario")).toBeTruthy();
    expect(screen.getByText("Hechizos")).toBeTruthy();
    expect(screen.getByText("Objetos")).toBeTruthy();
  });

  it("calls onOpenDados when Dados button is clicked", () => {
    const onOpenDados = vi.fn();
    render(<BarraInferior onOpenDados={onOpenDados} campaignTitle="Test" />);
    fireEvent.click(screen.getByText("Dados"));
    expect(onOpenDados).toHaveBeenCalledTimes(1);
  });

  it("calls window.open for Bestiario", () => {
    render(<BarraInferior onOpenDados={vi.fn()} campaignTitle="Test" />);
    fireEvent.click(screen.getByText("Bestiario"));
    expect(window.open).toHaveBeenCalledWith("/bestiario", "_blank");
  });

  it("calls window.open for Hechizos", () => {
    render(<BarraInferior onOpenDados={vi.fn()} campaignTitle="Test" />);
    fireEvent.click(screen.getByText("Hechizos"));
    expect(window.open).toHaveBeenCalledWith("/hechizos", "_blank");
  });

  it("calls window.open for Objetos", () => {
    render(<BarraInferior onOpenDados={vi.fn()} campaignTitle="Test" />);
    fireEvent.click(screen.getByText("Objetos"));
    expect(window.open).toHaveBeenCalledWith("/objetos", "_blank");
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. DadosOverlay
// ═══════════════════════════════════════════════════════════════════════════════

describe("DadosOverlay", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(1700000000000);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the overlay with title", () => {
    render(<DadosOverlay onClose={vi.fn()} />);
    expect(screen.getByText("Tirada de Dados")).toBeTruthy();
  });

  it("shows all dice buttons", () => {
    render(<DadosOverlay onClose={vi.fn()} />);
    const expected = ["d4", "d6", "d8", "d10", "d12", "d20", "d100"];
    expected.forEach((label) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
  });

  it("shows placeholder when no results", () => {
    render(<DadosOverlay onClose={vi.fn()} />);
    expect(screen.getByText("¡Pulsa un dado para tirar!")).toBeTruthy();
  });

  it("adds a result when clicking a dice button", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    render(<DadosOverlay onClose={vi.fn()} />);
    fireEvent.click(screen.getByText("d20"));
    expect(screen.queryByText("¡Pulsa un dado para tirar!")).toBeNull();
    expect(screen.getByText("1d20")).toBeTruthy();
    vi.restoreAllMocks();
  });

  it("calls onClose when X button is clicked", () => {
    const onClose = vi.fn();
    render(<DadosOverlay onClose={onClose} />);
    const xButtons = screen.getAllByRole("button");
    const closeBtn = xButtons.find((b) => b.querySelector("svg"));
    if (closeBtn) fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("increments quantity with + button", () => {
    render(<DadosOverlay onClose={vi.fn()} />);
    const plusBtns = screen.getAllByText("+");
    fireEvent.click(plusBtns[0]);
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("decrements quantity with - button", () => {
    render(<DadosOverlay onClose={vi.fn()} />);
    const minusBtns = screen.getAllByText("-");
    fireEvent.click(minusBtns[0]);
    expect(screen.getByText("1")).toBeTruthy();
  });

  it("increments modifier with + button", () => {
    render(<DadosOverlay onClose={vi.fn()} />);
    const plusBtns = screen.getAllByText("+");
    fireEvent.click(plusBtns[1]);
    expect(screen.getByText("+1")).toBeTruthy();
  });

  it("decrements modifier with - button", () => {
    render(<DadosOverlay onClose={vi.fn()} />);
    const minusBtns = screen.getAllByText("-");
    fireEvent.click(minusBtns[1]);
    expect(screen.getByText("-1")).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. DialogoIniciarCombate
// ═══════════════════════════════════════════════════════════════════════════════

describe("DialogoIniciarCombate", () => {
  const baseParticipants: CombatParticipantCandidate[] = [
    { id: "p1", label: "Hero One", tokenType: "player", image: null },
    { id: "p2", label: "Hero Two", tokenType: "player", image: "http://img.com/hero.png" },
    { id: "e1", label: "Goblin", tokenType: "enemy", image: null },
    { id: "n1", label: "Old Man", tokenType: "npc", image: null },
  ];

  it("renders participants grouped by type", () => {
    render(
      <DialogoIniciarCombate
        open={true}
        participants={baseParticipants}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText("Héroes")).toBeTruthy();
    expect(screen.getByText("Enemigos")).toBeTruthy();
    expect(screen.getByText("NPCs")).toBeTruthy();
    expect(screen.getByText("Hero One")).toBeTruthy();
    expect(screen.getByText("Goblin")).toBeTruthy();
    expect(screen.getByText("Old Man")).toBeTruthy();
  });

  it("shows empty message when no participants", () => {
    render(
      <DialogoIniciarCombate
        open={true}
        participants={[]}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    expect(screen.getByText(/No hay participantes/)).toBeTruthy();
  });

  it("selects all participants by default", () => {
    render(
      <DialogoIniciarCombate
        open={true}
        participants={baseParticipants}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const checkboxes = screen.getAllByTestId("checkbox") as HTMLInputElement[];
    checkboxes.forEach((cb) => {
      expect(cb.checked).toBe(true);
    });
  });

  it("can toggle a participant checkbox", () => {
    render(
      <DialogoIniciarCombate
        open={true}
        participants={baseParticipants}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const checkboxes = screen.getAllByTestId("checkbox") as HTMLInputElement[];
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0].checked).toBe(false);
  });

  it("has surprise select with correct options", () => {
    render(
      <DialogoIniciarCombate
        open={true}
        participants={baseParticipants}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );
    const select = screen.getByTestId("select");
    expect(select).toBeTruthy();
    expect(screen.getByText("Sin sorpresa")).toBeTruthy();
  });

  it("calls onConfirm with selected IDs and surprise when clicking confirm", () => {
    const onConfirm = vi.fn();
    render(
      <DialogoIniciarCombate
        open={true}
        participants={baseParticipants}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );
    fireEvent.click(screen.getByText("¡Comenzar!"));
    expect(onConfirm).toHaveBeenCalledWith(
      expect.arrayContaining(["p1", "p2", "e1", "n1"]),
      "none"
    );
  });

  it("calls onCancel when Cancel button is clicked", () => {
    const onCancel = vi.fn();
    render(
      <DialogoIniciarCombate
        open={true}
        participants={baseParticipants}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );
    fireEvent.click(screen.getByText("Cancelar"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. FichaOverlay
// ═══════════════════════════════════════════════════════════════════════════════

describe("FichaOverlay", () => {
  const baseMember: SessionMember = {
    user_id: "user-1",
    role: "player",
    profile: {
      id: "prof-1",
      display_name: "PlayerOne",
      username: "player1",
      avatar_url: null,
      email: null,
    },
    character: {
      id: "char-1",
      user_id: "user-1",
      name: "Aragorn",
      avatar_url: null,
      stats: { strength: 15, dexterity: 12, constitution: 14 },
      classes: [{ name: "Ranger", level: 5 }],
      race: "Human",
      inventory: '{"equipped":{},"potions":[],"scrolls":[],"ammo":[],"bag":[],"currency":{"pp":0,"po":0,"pe":0,"pa":0,"pc":0}}',
      spells_known: "",
      equipment: "",
      notes: "Some notes",
      experience_points: 6500,
    },
  };

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ items: [] }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders character name when char exists", () => {
    render(
      <FichaOverlay member={baseMember} canEdit={false} onClose={vi.fn()} onSave={vi.fn()} />
    );
    expect(screen.getByText("Aragorn")).toBeTruthy();
  });

  it("shows no-character message when char is null", () => {
    const memberNoChar: SessionMember = { ...baseMember, character: null };
    render(
      <FichaOverlay member={memberNoChar} canEdit={false} onClose={vi.fn()} onSave={vi.fn()} />
    );
    expect(screen.getByText("Este jugador no tiene ficha en esta campaña.")).toBeTruthy();
  });

  it("shows Save button when canEdit is true", () => {
    render(
      <FichaOverlay member={baseMember} canEdit={true} onClose={vi.fn()} onSave={vi.fn()} />
    );
    expect(screen.getByText("Guardar")).toBeTruthy();
  });

  it("does not show Save button when canEdit is false", () => {
    render(
      <FichaOverlay member={baseMember} canEdit={false} onClose={vi.fn()} onSave={vi.fn()} />
    );
    expect(screen.queryByText("Guardar")).toBeNull();
  });

  it("renders tabs: Stats, Combate, Inventario", () => {
    render(
      <FichaOverlay member={baseMember} canEdit={false} onClose={vi.fn()} onSave={vi.fn()} />
    );
    expect(screen.getByText("Stats")).toBeTruthy();
    expect(screen.getByText("Combate")).toBeTruthy();
    expect(screen.getByText("Inventario")).toBeTruthy();
  });

  it("renders InventoryManager inside inventario tab", () => {
    render(
      <FichaOverlay member={baseMember} canEdit={true} onClose={vi.fn()} onSave={vi.fn()} />
    );
    expect(screen.getByTestId("inventory-manager")).toBeTruthy();
  });

  it("calls onSave when Save button is clicked", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <FichaOverlay member={baseMember} canEdit={true} onClose={vi.fn()} onSave={onSave} />
    );
    fireEvent.click(screen.getByText("Guardar"));
    await vi.waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });
    expect(onSave).toHaveBeenCalledWith(
      "user-1",
      "char-1",
      expect.objectContaining({
        experience_points: 6500,
        notes: "Some notes",
      })
    );
  });

  it("shows close confirmation when has unsaved changes", () => {
    const onClose = vi.fn();
    const { baseElement } = render(
      <FichaOverlay member={baseMember} canEdit={true} onClose={onClose} onSave={vi.fn()} />
    );
    const inputs = screen.getAllByTestId("input") as HTMLInputElement[];
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: "16" } });
    }
    const xButtons = baseElement.querySelectorAll("button");
    const closeBtn = Array.from(xButtons).find(
      (b) => b.querySelector(".lucide-x")
    );
    expect(closeBtn).toBeTruthy();
    if (closeBtn) fireEvent.click(closeBtn);
    expect(screen.getByText("Cambios sin guardar")).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. InventoryDisplay
// ═══════════════════════════════════════════════════════════════════════════════

describe("InventoryDisplay", () => {
  const validInventory = JSON.stringify({
    equipped: {
      helmet: { id: "h1", name: "Iron Helm" },
      armor: { id: "a1", name: "Chain Mail" },
      mainhand: { id: "w1", name: "Longsword" },
    },
    potions: [{ id: "p1", name: "Health Potion", quantity: 2 }],
    scrolls: [{ id: "s1", name: "Fireball Scroll", quantity: 1 }],
    ammo: [{ id: "am1", name: "Arrow", quantity: 20 }],
    bag: [
      { id: "b1", name: "Rope", quantity: 1, weight: 5 },
      { id: "b2", name: "Torch", quantity: 3, weight: 1 },
    ],
    currency: { pp: 0, po: 50, pe: 0, pa: 100, pc: 25 },
  });

  it("renders equipped items from valid JSON", () => {
    render(<InventoryDisplay inventory={validInventory} />);
    expect(screen.getByText("Iron Helm")).toBeTruthy();
    expect(screen.getByText("Chain Mail")).toBeTruthy();
    expect(screen.getByText("Longsword")).toBeTruthy();
  });

  it("renders potions, scrolls, ammo sections", () => {
    render(<InventoryDisplay inventory={validInventory} />);
    expect(screen.getByText((c) => c.includes("Pociones") && c.includes("2"))).toBeTruthy();
    expect(screen.getByText("Fireball Scroll")).toBeTruthy();
    expect(screen.getByText("Arrow")).toBeTruthy();
  });

  it("renders bag items and currency", () => {
    render(<InventoryDisplay inventory={validInventory} />);
    expect(screen.getByText("Rope")).toBeTruthy();
    expect(screen.getByText("50")).toBeTruthy();
  });

  it("shows all equipment slots as empty by default", () => {
    render(<InventoryDisplay inventory='{"equipped":{},"potions":[],"scrolls":[],"ammo":[],"bag":[],"currency":{"pp":0,"po":0,"pe":0,"pa":0,"pc":0}}' />);
    const dashEl = screen.getAllByText(/—|\u2014/);
    expect(dashEl.length).toBeGreaterThan(0);
    expect(screen.getByText("Monedas")).toBeTruthy();
  });

  it("shows error message for invalid JSON", () => {
    render(<InventoryDisplay inventory={'{"invalid json:}'} />);
    expect(screen.getByText(/No es un inventario estructurado/)).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. InventoryManager
// ═══════════════════════════════════════════════════════════════════════════════

describe("InventoryManager", () => {
  const emptyInventoryJson = '{"equipped":{},"potions":[],"scrolls":[],"ammo":[],"bag":[],"currency":{"pp":0,"po":0,"pe":0,"pa":0,"pc":0}}';

  it("renders with sections when given empty inventory", () => {
    render(
      <RealInventoryManager
        inventory={emptyInventoryJson}
        onInventoryChange={vi.fn()}
        compendiumItems={[]}
      />
    );
    expect(screen.getByText(/Equipo Equipado/)).toBeTruthy();
    expect(screen.getAllByText(/Pociones/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Pergaminos/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Munición/)).toBeTruthy();
    expect(screen.getByText(/Inventario/)).toBeTruthy();
    expect(screen.getAllByText(/Peso/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Monedas/)).toBeTruthy();
  });

  it("renders equip slots from Silhouette component", () => {
    render(
      <RealInventoryManager
        inventory={emptyInventoryJson}
        onInventoryChange={vi.fn()}
        compendiumItems={[]}
      />
    );
    const slots = screen.getAllByTestId("equip-slot");
    expect(slots.length).toBeGreaterThan(0);
  });

  it("syncs inventory changes to parent", () => {
    const onChange = vi.fn();
    render(
      <RealInventoryManager
        inventory={emptyInventoryJson}
        onInventoryChange={onChange}
        compendiumItems={[]}
      />
    );
    expect(onChange).toHaveBeenCalled();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. InventoryViewer
// ═══════════════════════════════════════════════════════════════════════════════

describe("InventoryViewer", () => {
  const validInventory = JSON.stringify({
    equipped: {
      mainhand: { id: "w1", name: "Longsword" },
      armor: { id: "a1", name: "Leather Armor" },
    },
    potions: [{ id: "p1", name: "Healing", quantity: 3 }],
    scrolls: [],
    ammo: [],
    bag: [
      { id: "b1", name: "Rations", quantity: 5 },
      { id: "b2", name: "Torch", quantity: 2 },
    ],
    currency: { pp: 0, po: 25, pe: 0, pa: 10, pc: 0 },
  });

  it("shows equipped count", () => {
    render(<InventoryViewer inventory={validInventory} />);
    expect(screen.getByText("2")).toBeTruthy();
  });

  it("shows currency summary", () => {
    render(<InventoryViewer inventory={validInventory} />);
    expect(screen.getByText(/25po/)).toBeTruthy();
  });

  it("shows equipped item names", () => {
    render(<InventoryViewer inventory={validInventory} />);
    expect(screen.getByText("Longsword")).toBeTruthy();
    expect(screen.getByText("Leather Armor")).toBeTruthy();
  });

  it("shows bag items count", () => {
    render(<InventoryViewer inventory={validInventory} />);
    expect(screen.getByText("7")).toBeTruthy();
  });

  it("toggles available items section", () => {
    render(<InventoryViewer inventory={validInventory} />);
    const toggleBtn = screen.getByText(/Items disponibles/);
    fireEvent.click(toggleBtn);
    expect(screen.getByText("Rations")).toBeTruthy();
    expect(screen.getByText("x5")).toBeTruthy();
  });

  it("shows fallback for non-structured inventory", () => {
    render(<InventoryViewer inventory="some text" />);
    expect(screen.getByText(/No es un inventario/)).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. MapaPartida
// ═══════════════════════════════════════════════════════════════════════════════

describe("MapaPartida", () => {
  const mapView = {
    panX: 0,
    panY: 0,
    zoom: 1,
    gridSize: 50,
    gridColor: "rgba(255,255,255,0.3)",
    showGrid: true,
  };

  it("renders canvas element", () => {
    const { container } = render(
      <MapaPartida
        mapImageData={null}
        mapView={mapView}
        tokens={[]}
        combatState={null}
        isDM={false}
        currentUserId="user-1"
        onViewChange={vi.fn()}
        onTokenMove={vi.fn()}
      />
    );
    expect(container.querySelector("canvas")).toBeTruthy();
  });

  it("renders tokens on the map", () => {
    const token = createToken();
    render(
      <MapaPartida
        mapImageData={null}
        mapView={mapView}
        tokens={[token]}
        combatState={null}
        isDM={false}
        currentUserId="user-1"
        onViewChange={vi.fn()}
        onTokenMove={vi.fn()}
      />
    );
    expect(screen.getByText("Test Token")).toBeTruthy();
  });

  it("shows DM controls when isDM is true", () => {
    render(
      <MapaPartida
        mapImageData={null}
        mapView={mapView}
        tokens={[]}
        combatState={null}
        isDM={true}
        currentUserId="user-1"
        onViewChange={vi.fn()}
        onTokenMove={vi.fn()}
      />
    );
    expect(screen.getByText("Cuadrícula")).toBeTruthy();
    expect(screen.getByText("Tamaño")).toBeTruthy();
    expect(screen.getByText("Color")).toBeTruthy();
  });

  it("hides DM controls when isDM is false", () => {
    render(
      <MapaPartida
        mapImageData={null}
        mapView={mapView}
        tokens={[]}
        combatState={null}
        isDM={false}
        currentUserId="user-1"
        onViewChange={vi.fn()}
        onTokenMove={vi.fn()}
      />
    );
    expect(screen.queryByText("Cuadrícula")).toBeNull();
  });

  it("renders HP bars on tokens", () => {
    const token = createToken({ current_hp: 10, max_hp: 20 });
    render(
      <MapaPartida
        mapImageData={null}
        mapView={mapView}
        tokens={[token]}
        combatState={null}
        isDM={false}
        currentUserId="user-1"
        onViewChange={vi.fn()}
        onTokenMove={vi.fn()}
      />
    );
    expect(screen.getByText("10/20")).toBeTruthy();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. OrdenCombate
// ═══════════════════════════════════════════════════════════════════════════════

describe("OrdenCombate", () => {
  const token1 = createToken({ id: "t1", entity_name: "Aragorn", current_hp: 15, max_hp: 20, user_id: "user-1" });
  const token2 = createToken({ id: "t2", entity_name: "Goblin", current_hp: 5, max_hp: 7, token_type: "enemy", user_id: "user-2" });
  const combatState = createCombatState({
    initiative_order: ["t1", "t2"],
    current_turn_index: 0,
    round_number: 2,
  });

  it("renders round number", () => {
    render(
      <OrdenCombate
        tokens={[token1, token2]}
        combatState={combatState}
        isDM={false}
        currentUserId="user-1"
        onReorder={vi.fn()}
        onRemove={vi.fn()}
        onEndTurn={vi.fn()}
      />
    );
    expect(screen.getByText(/Ronda 2/)).toBeTruthy();
  });

  it("renders tokens in initiative order", () => {
    render(
      <OrdenCombate
        tokens={[token1, token2]}
        combatState={combatState}
        isDM={false}
        currentUserId="user-1"
        onReorder={vi.fn()}
        onRemove={vi.fn()}
        onEndTurn={vi.fn()}
      />
    );
    expect(screen.getByText("Aragorn")).toBeTruthy();
    expect(screen.getByText("Goblin")).toBeTruthy();
  });

  it("shows end turn button for current player", () => {
    render(
      <OrdenCombate
        tokens={[token1, token2]}
        combatState={combatState}
        isDM={false}
        currentUserId="user-1"
        onReorder={vi.fn()}
        onRemove={vi.fn()}
        onEndTurn={vi.fn()}
      />
    );
    expect(screen.getByText("Terminar turno")).toBeTruthy();
  });

  it("calls onEndTurn when end turn button clicked", () => {
    const onEndTurn = vi.fn();
    render(
      <OrdenCombate
        tokens={[token1, token2]}
        combatState={combatState}
        isDM={false}
        currentUserId="user-1"
        onReorder={vi.fn()}
        onRemove={vi.fn()}
        onEndTurn={onEndTurn}
      />
    );
    fireEvent.click(screen.getByText("Terminar turno"));
    expect(onEndTurn).toHaveBeenCalledTimes(1);
  });

  it("shows remove buttons when isDM is true", () => {
    render(
      <OrdenCombate
        tokens={[token1, token2]}
        combatState={combatState}
        isDM={true}
        currentUserId="user-1"
        onReorder={vi.fn()}
        onRemove={vi.fn()}
        onEndTurn={vi.fn()}
      />
    );
    const removeBtns = screen.getAllByTitle("Quitar del combate");
    expect(removeBtns.length).toBe(2);
  });

  it("calls onRemove when DM clicks remove", () => {
    const onRemove = vi.fn();
    render(
      <OrdenCombate
        tokens={[token1, token2]}
        combatState={combatState}
        isDM={true}
        currentUserId="user-1"
        onReorder={vi.fn()}
        onRemove={onRemove}
        onEndTurn={vi.fn()}
      />
    );
    const removeBtns = screen.getAllByTitle("Quitar del combate");
    fireEvent.click(removeBtns[0]);
    expect(onRemove).toHaveBeenCalledWith("t1");
  });

  it("hides remove buttons when isDM is false", () => {
    render(
      <OrdenCombate
        tokens={[token1, token2]}
        combatState={combatState}
        isDM={false}
        currentUserId="user-1"
        onReorder={vi.fn()}
        onRemove={vi.fn()}
        onEndTurn={vi.fn()}
      />
    );
    expect(screen.queryByTitle("Quitar del combate")).toBeNull();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. PanelDM
// ═══════════════════════════════════════════════════════════════════════════════

describe("PanelDM", () => {
  const baseProps = {
    chapters: [] as ChapterWithScenes[],
    selectedSceneId: null as string | null,
    currentMapId: null as string | null,
    availableMaps: [] as BattleMapListItem[],
    tokens: [] as SessionToken[],
    combatState: null as CombatState | null,
    isSessionActive: true,
    selectedToken: null as SessionToken | null,
    onSelectScene: vi.fn(),
    onGoToScene: vi.fn(),
    onDeployMap: vi.fn(),
    onDeployEntity: vi.fn(),
    onChangeTokenIcon: vi.fn(),
    onUpdateToken: vi.fn(),
    onStartCombat: vi.fn(),
    onEndCombat: vi.fn(),
    onEndSession: vi.fn(),
  };

  it("renders session control buttons", () => {
    render(<PanelDM {...baseProps} />);
    expect(screen.getByText("Comenzar enfrentamiento")).toBeTruthy();
    expect(screen.getByText("Terminar sesión")).toBeTruthy();
  });

  it("shows Terminar enfrentamiento when combat is active", () => {
    const combatState = createCombatState({ is_active: true });
    render(<PanelDM {...baseProps} combatState={combatState} />);
    expect(screen.getByText("Terminar enfrentamiento")).toBeTruthy();
    expect(screen.queryByText("Comenzar enfrentamiento")).toBeNull();
  });

  it("renders chapters tree", () => {
    const chapters: ChapterWithScenes[] = [
      {
        id: "ch1",
        title: "Chapter 1",
        content: "",
        order_index: 0,
        scenes: [
          { id: "sc1", title: "Scene 1", content: "", narration_text: "", dm_notes: "", battle_map_id: null, order_index: 0, entities: [] },
        ],
      },
    ];
    render(<PanelDM {...baseProps} chapters={chapters} />);
    expect(screen.getByText("Chapter 1")).toBeTruthy();
  });

  it("expands chapter and shows scenes on click", () => {
    const chapters: ChapterWithScenes[] = [
      {
        id: "ch1",
        title: "Chapter 1",
        content: "",
        order_index: 0,
        scenes: [
          { id: "sc1", title: "Scene 1", content: "", narration_text: "", dm_notes: "", battle_map_id: null, order_index: 0, entities: [] },
        ],
      },
    ];
    render(<PanelDM {...baseProps} chapters={chapters} />);
    fireEvent.click(screen.getByText("Chapter 1"));
    expect(screen.getByText("Scene 1")).toBeTruthy();
  });

  it("shows no chapters message when empty", () => {
    render(<PanelDM {...baseProps} />);
    expect(screen.getByText("Sin capítulos.")).toBeTruthy();
  });

  it("renders selected scene details with entity tabs", () => {
    const chapters: ChapterWithScenes[] = [
      {
        id: "ch1",
        title: "Ch1",
        content: "",
        order_index: 0,
        scenes: [
          {
            id: "sc1", title: "Forest", content: "", narration_text: "A dark forest",
            dm_notes: "Watch for traps", battle_map_id: null, order_index: 0,
            entities: [
              { id: "e1", entity_type: "monster", entity_id: "m1", entity_name: "Goblin", entity_data: null },
            ],
          },
        ],
      },
    ];
    render(
      <PanelDM
        {...baseProps}
        chapters={chapters}
        selectedSceneId="sc1"
        selectedToken={null}
      />
    );
    expect(screen.getByText("Forest")).toBeTruthy();
    expect(screen.getByText("A dark forest")).toBeTruthy();
    expect(screen.getByText("Watch for traps")).toBeTruthy();
    expect(screen.getByText("Enemigos")).toBeTruthy();
    fireEvent.click(screen.getByText("Enemigos"));
    expect(screen.getByText("Goblin")).toBeTruthy();
  });

  it("renders token customization when a token is selected", () => {
    const token = createToken({ entity_image: null });
    render(<PanelDM {...baseProps} selectedToken={token} />);
    expect(screen.getByText(token.entity_name)).toBeTruthy();
    expect(screen.getByText("Tamaño")).toBeTruthy();
    const sizeOptions = ["S", "M", "L", "XL"];
    sizeOptions.forEach((s) => {
      expect(screen.getByText(s)).toBeTruthy();
    });
  });

  it("calls onStartCombat when combat button is clicked", () => {
    const onStartCombat = vi.fn();
    render(<PanelDM {...baseProps} onStartCombat={onStartCombat} />);
    fireEvent.click(screen.getByText("Comenzar enfrentamiento"));
    expect(onStartCombat).toHaveBeenCalledTimes(1);
  });

  it("calls onEndSession when terminar sesión is clicked", () => {
    const onEndSession = vi.fn();
    render(<PanelDM {...baseProps} onEndSession={onEndSession} />);
    fireEvent.click(screen.getByText("Terminar sesión"));
    expect(onEndSession).toHaveBeenCalledTimes(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. PanelJugadores
// ═══════════════════════════════════════════════════════════════════════════════

describe("PanelJugadores", () => {
  const player1: SessionMember = {
    user_id: "user-1",
    role: "player",
    profile: { id: "p1", display_name: "PlayerOne", username: "player1", avatar_url: null, email: null },
    character: null,
  };
  const player2: SessionMember = {
    user_id: "user-2",
    role: "player",
    profile: { id: "p2", display_name: "PlayerTwo", username: "player2", avatar_url: null, email: null },
    character: null,
  };
  const dmMember: SessionMember = {
    user_id: "dm-1",
    role: "dm",
    profile: { id: "dm", display_name: "DM", username: "dm", avatar_url: null, email: null },
    character: null,
  };

  it("renders player names", () => {
    render(
      <PanelJugadores
        members={[player1, player2, dmMember]}
        tokens={[]}
        isDM={false}
        currentUserId="user-1"
        onOpenFicha={vi.fn()}
      />
    );
    expect(screen.getByText("PlayerOne")).toBeTruthy();
    expect(screen.getByText("PlayerTwo")).toBeTruthy();
  });

  it("filters out DM from the list", () => {
    render(
      <PanelJugadores
        members={[player1, dmMember]}
        tokens={[]}
        isDM={false}
        currentUserId="user-1"
        onOpenFicha={vi.fn()}
      />
    );
    expect(screen.queryByText("DM")).toBeNull();
  });

  it("shows HP when token exists for a player", () => {
    const token = createToken({ user_id: "user-1", current_hp: 15, max_hp: 20 });
    render(
      <PanelJugadores
        members={[player1]}
        tokens={[token]}
        isDM={false}
        currentUserId="user-1"
        onOpenFicha={vi.fn()}
      />
    );
    expect(screen.getByText("15")).toBeTruthy();
    expect(screen.getByText("/20")).toBeTruthy();
  });

  it("player can open their own ficha", () => {
    const onOpenFicha = vi.fn();
    render(
      <PanelJugadores
        members={[player1]}
        tokens={[]}
        isDM={false}
        currentUserId="user-1"
        onOpenFicha={onOpenFicha}
      />
    );
    fireEvent.click(screen.getByText("PlayerOne"));
    expect(onOpenFicha).toHaveBeenCalledWith(player1);
  });

  it("DM can open any player's ficha", () => {
    const onOpenFicha = vi.fn();
    render(
      <PanelJugadores
        members={[player2]}
        tokens={[]}
        isDM={true}
        currentUserId="dm-1"
        onOpenFicha={onOpenFicha}
      />
    );
    fireEvent.click(screen.getByText("PlayerTwo"));
    expect(onOpenFicha).toHaveBeenCalledWith(player2);
  });

  it("player cannot open another player's ficha", () => {
    const onOpenFicha = vi.fn();
    render(
      <PanelJugadores
        members={[player2]}
        tokens={[]}
        isDM={false}
        currentUserId="user-1"
        onOpenFicha={onOpenFicha}
      />
    );
    fireEvent.click(screen.getByText("PlayerTwo"));
    expect(onOpenFicha).not.toHaveBeenCalled();
  });
});
