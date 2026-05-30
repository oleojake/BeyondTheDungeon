import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PartidaComponent } from "../partida.component";
import type {
  GameSession,
  SessionToken,
  CombatState,
  SessionMember,
  ChapterWithScenes,
  SceneEntityBasic,
  SceneWithEntities,
  CombatParticipantCandidate,
} from "../partida.vm";
import type { BattleMapListItem } from "@/core/api/battle-map.service";

vi.mock("../components/PanelJugadores", () => ({
  PanelJugadores: () => <div data-testid="panel-jugadores" />,
}));

vi.mock("../components/MapaPartida", () => ({
  MapaPartida: () => <div data-testid="mapa-partida" />,
}));

vi.mock("../components/PanelDM", () => ({
  PanelDM: () => <div data-testid="panel-dm" />,
}));

vi.mock("../components/OrdenCombate", () => ({
  OrdenCombate: () => <div data-testid="orden-combate" />,
}));

vi.mock("../components/BarraInferior", () => ({
  BarraInferior: () => <div data-testid="barra-inferior" />,
}));

vi.mock("../components/DadosOverlay", () => ({
  DadosOverlay: () => <div data-testid="dados-overlay" />,
}));

vi.mock("../components/FichaOverlay", () => ({
  FichaOverlay: () => <div data-testid="ficha-overlay" />,
}));

vi.mock("../components/DialogoIniciarCombate", () => ({
  DialogoIniciarCombate: () => <div data-testid="dialogo-combate" />,
}));

const baseProps = {
  campaignId: "camp-1",
  campaignTitle: "Test Campaign",
  session: null,
  isDM: false,
  userId: "user-1",
  members: [] as SessionMember[],
  tokens: [] as SessionToken[],
  combatState: null as CombatState | null,
  mapImageData: null as string | null,
  mapView: { panX: 0, panY: 0, zoom: 1, gridSize: 50, gridColor: "rgba(255,255,255,0.3)", showGrid: true },
  selectedSceneId: null as string | null,
  chapters: [] as ChapterWithScenes[],
  availableMaps: [] as BattleMapListItem[],
  loading: false,
  showDados: false,
  fichaTarget: null as SessionMember | null,
  showCombatDialog: false,
  combatParticipants: [] as CombatParticipantCandidate[],
  onMapViewChange: vi.fn(),
  onTokenMove: vi.fn(),
  onDeployMap: vi.fn(),
  onDeployEntity: vi.fn(),
  onChangeTokenIcon: vi.fn(),
  onUpdateToken: vi.fn(),
  selectedToken: null,
  onTokenSelect: vi.fn(),
  onSelectScene: vi.fn(),
  onGoToScene: vi.fn(),
  onStartCombat: vi.fn(),
  onConfirmCombat: vi.fn(),
  onEndCombat: vi.fn(),
  onReorderInitiative: vi.fn(),
  onEndTurn: vi.fn(),
  onRemoveFromCombat: vi.fn(),
  onEndSession: vi.fn(),
  onOpenDados: vi.fn(),
  onCloseDados: vi.fn(),
  onOpenFicha: vi.fn(),
  onCloseFicha: vi.fn(),
  onSaveFicha: vi.fn(),
  onCancelCombatDialog: vi.fn(),
};

function createMockSession(overrides: Partial<GameSession> = {}): GameSession {
  return {
    id: "session-1",
    campaign_id: "camp-1",
    status: "active",
    session_state: {},
    current_map_id: null,
    current_scene_id: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    ...overrides,
  } as GameSession;
}

// PlayerExitButton inside PartidaComponent calls useNavigate, so renders that
// include an active session need a Router context.
function renderInRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("PartidaComponent", () => {
  it("renders loading spinner when loading is true", () => {
    renderInRouter(<PartidaComponent {...baseProps} loading={true} />);
    expect(screen.getByText("Cargando partida...")).toBeTruthy();
  });

  it("renders waiting message when there is no session", () => {
    renderInRouter(<PartidaComponent {...baseProps} loading={false} session={null} />);
    expect(
      screen.getByText("La sesión aún no ha comenzado."),
    ).toBeTruthy();
    expect(screen.getByText("Espera a que el DM inicie la partida.")).toBeTruthy();
  });

  it("renders main game UI when session is active", () => {
    renderInRouter(
      <PartidaComponent
        {...baseProps}
        loading={false}
        session={createMockSession()}
      />,
    );

    expect(screen.getByTestId("panel-jugadores")).toBeTruthy();
    expect(screen.getByTestId("mapa-partida")).toBeTruthy();
    expect(screen.getByTestId("barra-inferior")).toBeTruthy();
  });

  it("renders DM panel when isDM is true", () => {
    renderInRouter(
      <PartidaComponent
        {...baseProps}
        isDM={true}
        session={createMockSession()}
      />,
    );

    expect(screen.getByTestId("panel-dm")).toBeTruthy();
  });

  it("does not render DM panel when isDM is false", () => {
    renderInRouter(
      <PartidaComponent
        {...baseProps}
        isDM={false}
        session={createMockSession()}
      />,
    );

    expect(screen.queryByTestId("panel-dm")).toBeNull();
  });

  it("renders combat order bar when combat is active", () => {
    const combatState: CombatState = {
      is_active: true,
      initiative_order: [],
      current_turn_index: 0,
      round_number: 1,
      surprise: "none",
    };

    renderInRouter(
      <PartidaComponent
        {...baseProps}
        session={createMockSession()}
        combatState={combatState}
      />,
    );

    expect(screen.getByTestId("orden-combate")).toBeTruthy();
  });

  it("does not render combat order bar when combat is not active", () => {
    renderInRouter(
      <PartidaComponent
        {...baseProps}
        session={createMockSession()}
        combatState={null}
      />,
    );

    expect(screen.queryByTestId("orden-combate")).toBeNull();
  });

  it("renders dados overlay when showDados is true", () => {
    renderInRouter(
      <PartidaComponent
        {...baseProps}
        session={createMockSession()}
        showDados={true}
      />,
    );

    expect(screen.getByTestId("dados-overlay")).toBeTruthy();
  });

  it("renders ficha overlay when fichaTarget is set", () => {
    const member: SessionMember = {
      user_id: "user-1",
      campaign_id: "camp-1",
      role: "player",
      joined_at: "2025-01-01T00:00:00Z",
    };

    renderInRouter(
      <PartidaComponent
        {...baseProps}
        session={createMockSession()}
        fichaTarget={member}
      />,
    );

    expect(screen.getByTestId("ficha-overlay")).toBeTruthy();
  });

  it("renders combat dialog when showCombatDialog is true", () => {
    renderInRouter(
      <PartidaComponent
        {...baseProps}
        session={createMockSession()}
        showCombatDialog={true}
      />,
    );

    expect(screen.getByTestId("dialogo-combate")).toBeTruthy();
  });
});
