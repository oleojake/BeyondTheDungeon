import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PartidaContainer } from "../partida.container";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ campaignId: "camp-1" }),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: "user-1" } },
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: "token" } },
      }),
    },
  },
}));

vi.mock("@/core/api/game-session.service", () => ({
  getCampaignSession: vi.fn().mockResolvedValue({
    id: "session-1",
    campaign_id: "camp-1",
    status: "active",
    session_state: {},
    current_map_id: null,
    current_scene_id: null,
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  }),
  startSession: vi.fn(),
  endSession: vi.fn(),
  listTokens: vi.fn().mockResolvedValue([]),
  createToken: vi.fn().mockResolvedValue({
    id: "token-1",
    token_type: "player",
  }),
  updateToken: vi.fn(),
  deleteToken: vi.fn(),
  getCombatState: vi.fn().mockResolvedValue(null),
  updateCombatState: vi.fn(),
  updateSessionState: vi.fn(),
  getCampaignMembersWithCharacters: vi.fn().mockResolvedValue([]),
  subscribeToTokens: vi.fn().mockReturnValue(() => {}),
  subscribeToCombat: vi.fn().mockReturnValue(() => {}),
  subscribeToSession: vi.fn().mockReturnValue(() => {}),
}));

vi.mock("@/core/api/battle-map.service", () => ({
  getBattleMap: vi.fn(),
  listBattleMaps: vi.fn().mockResolvedValue({ maps: [] }),
}));

vi.mock("@/core/api/chapter.service", () => ({
  listChapters: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/core/api/scene.service", () => ({
  listScenes: vi.fn().mockResolvedValue([]),
}));

vi.mock("@/core/api/scene-entity.service", () => ({
  listSceneEntities: vi.fn().mockResolvedValue([]),
}));

vi.mock("../partida.component", () => ({
  PartidaComponent: () => <div data-testid="partida-component" />,
}));

describe("PartidaContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders PartidaComponent after loading", async () => {
    render(<PartidaContainer campaignId="camp-1" campaignTitle="Test" isDM={false} />);

    const component = await screen.findByTestId("partida-component");
    expect(component).toBeTruthy();
  });
});
