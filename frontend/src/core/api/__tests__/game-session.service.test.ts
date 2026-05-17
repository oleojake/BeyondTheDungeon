import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetSession = vi.fn();
const mockChannel = vi.fn();
const mockRemoveChannel = vi.fn();
const mockFetch = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getSession: (...args: unknown[]) => mockGetSession(...args) },
    channel: (...args: unknown[]) => mockChannel(...args),
    removeChannel: (...args: unknown[]) => mockRemoveChannel(...args),
  },
}));

vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
});

function authed() {
  mockGetSession.mockResolvedValue({
    data: { session: { access_token: "tok" } },
  });
}

describe("getCampaignSession", () => {
  it("returns session on success", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ session: { id: "s1", status: "active" } }),
    });
    const { getCampaignSession } = await import("../game-session.service");
    const result = await getCampaignSession("c1");
    expect(result).toEqual({ id: "s1", status: "active" });
  });

  it("returns null on 404", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    const { getCampaignSession } = await import("../game-session.service");
    const result = await getCampaignSession("c1");
    expect(result).toBeNull();
  });

  it("throws on server error", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const { getCampaignSession } = await import("../game-session.service");
    await expect(getCampaignSession("c1")).rejects.toThrow(
      "Error al obtener la sesión"
    );
  });
});

describe("startSession", () => {
  it("returns session on success", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () =>
        Promise.resolve(
          JSON.stringify({ session: { id: "s1", status: "active" } })
        ),
    });
    const { startSession } = await import("../game-session.service");
    const result = await startSession("c1");
    expect(result).toEqual({ id: "s1", status: "active" });
  });

  it("throws with JSON error body", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: () => Promise.resolve(JSON.stringify({ error: "Bad request" })),
    });
    const { startSession } = await import("../game-session.service");
    await expect(startSession("c1")).rejects.toThrow("Bad request");
  });

  it("throws with plain text body", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Server error"),
    });
    const { startSession } = await import("../game-session.service");
    await expect(startSession("c1")).rejects.toThrow("Server error");
  });
});

describe("updateSessionState", () => {
  it("returns updated session", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ session: { id: "s1", current_scene_id: "sc1" } }),
    });
    const { updateSessionState } = await import("../game-session.service");
    const result = await updateSessionState("s1", {
      current_scene_id: "sc1",
    });
    expect(result).toEqual({ id: "s1", current_scene_id: "sc1" });
  });

  it("throws on error", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const { updateSessionState } = await import("../game-session.service");
    await expect(updateSessionState("s1", {})).rejects.toThrow(
      "Error al guardar el estado"
    );
  });
});

describe("endSession", () => {
  it("returns ended session", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ session: { id: "s1", status: "paused" } }),
    });
    const { endSession } = await import("../game-session.service");
    const result = await endSession("s1", {});
    expect(result).toEqual({ id: "s1", status: "paused" });
  });

  it("throws on error", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const { endSession } = await import("../game-session.service");
    await expect(endSession("s1", {})).rejects.toThrow(
      "Error al terminar la sesión"
    );
  });
});

describe("listTokens", () => {
  it("returns tokens list", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          tokens: [{ id: "t1", entity_name: "Goblin" }],
        }),
    });
    const { listTokens } = await import("../game-session.service");
    const result = await listTokens("s1");
    expect(result).toEqual([{ id: "t1", entity_name: "Goblin" }]);
  });

  it("throws on error", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const { listTokens } = await import("../game-session.service");
    await expect(listTokens("s1")).rejects.toThrow("Error al obtener tokens");
  });
});

describe("createToken", () => {
  it("returns created token", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ token: { id: "t1", entity_name: "Orc" } }),
    });
    const { createToken } = await import("../game-session.service");
    const result = await createToken("s1", {
      entity_name: "Orc",
    } as never);
    expect(result).toEqual({ id: "t1", entity_name: "Orc" });
  });

  it("throws on error", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const { createToken } = await import("../game-session.service");
    await expect(createToken("s1", {} as never)).rejects.toThrow(
      "Error al crear token"
    );
  });
});

describe("updateToken", () => {
  it("returns updated token", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ token: { id: "t1", x: 10, y: 20 } }),
    });
    const { updateToken } = await import("../game-session.service");
    const result = await updateToken("s1", "t1", { x: 10, y: 20 });
    expect(result).toEqual({ id: "t1", x: 10, y: 20 });
  });

  it("throws on error", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const { updateToken } = await import("../game-session.service");
    await expect(updateToken("s1", "t1", {})).rejects.toThrow(
      "Error al actualizar token"
    );
  });
});

describe("deleteToken", () => {
  it("resolves on success", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });
    const { deleteToken } = await import("../game-session.service");
    await expect(deleteToken("s1", "t1")).resolves.toBeUndefined();
  });

  it("throws on error", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const { deleteToken } = await import("../game-session.service");
    await expect(deleteToken("s1", "t1")).rejects.toThrow(
      "Error al eliminar token"
    );
  });
});

describe("getCombatState", () => {
  it("returns combat state", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ combat: { id: "c1", is_active: true } }),
    });
    const { getCombatState } = await import("../game-session.service");
    const result = await getCombatState("s1");
    expect(result).toEqual({ id: "c1", is_active: true });
  });

  it("throws on error", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const { getCombatState } = await import("../game-session.service");
    await expect(getCombatState("s1")).rejects.toThrow(
      "Error al obtener combate"
    );
  });
});

describe("updateCombatState", () => {
  it("returns updated combat state", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          combat: { id: "c1", is_active: true, round_number: 2 },
        }),
    });
    const { updateCombatState } = await import("../game-session.service");
    const result = await updateCombatState("s1", { is_active: true });
    expect(result).toEqual({
      id: "c1",
      is_active: true,
      round_number: 2,
    });
  });

  it("throws on error", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const { updateCombatState } = await import("../game-session.service");
    await expect(updateCombatState("s1", {})).rejects.toThrow(
      "Error al actualizar combate"
    );
  });
});

describe("getCampaignMembersWithCharacters", () => {
  it("returns members list", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          members: [{ user_id: "u1", role: "player" }],
        }),
    });
    const { getCampaignMembersWithCharacters } = await import(
      "../game-session.service"
    );
    const result = await getCampaignMembersWithCharacters("c1");
    expect(result).toEqual([{ user_id: "u1", role: "player" }]);
  });

  it("throws on error", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    const { getCampaignMembersWithCharacters } = await import(
      "../game-session.service"
    );
    await expect(
      getCampaignMembersWithCharacters("c1")
    ).rejects.toThrow("Error al obtener miembros");
  });
});

describe("subscribeToTokens", () => {
  it("creates channel with correct filters and returns unsubscribe", async () => {
    const mockChannelObj = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    };
    mockChannel.mockReturnValue(mockChannelObj);

    const onUpdate = vi.fn();
    const onDelete = vi.fn();
    const { subscribeToTokens } = await import("../game-session.service");
    const unsubscribe = subscribeToTokens("s1", onUpdate, onDelete);

    expect(mockChannel).toHaveBeenCalledWith("session_tokens:s1");
    expect(mockChannelObj.on).toHaveBeenCalledTimes(3);
    expect(mockChannelObj.on).toHaveBeenCalledWith(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "session_tokens",
        filter: "session_id=eq.s1",
      },
      expect.any(Function)
    );
    expect(mockChannelObj.on).toHaveBeenCalledWith(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "session_tokens",
        filter: "session_id=eq.s1",
      },
      expect.any(Function)
    );
    expect(mockChannelObj.on).toHaveBeenCalledWith(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "session_tokens",
        filter: "session_id=eq.s1",
      },
      expect.any(Function)
    );
    expect(mockChannelObj.subscribe).toHaveBeenCalledOnce();

    unsubscribe();
    expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannelObj);
  });
});

describe("subscribeToCombat", () => {
  it("creates channel with correct filters and returns unsubscribe", async () => {
    const mockChannelObj = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    };
    mockChannel.mockReturnValue(mockChannelObj);

    const onUpdate = vi.fn();
    const { subscribeToCombat } = await import("../game-session.service");
    const unsubscribe = subscribeToCombat("s1", onUpdate);

    expect(mockChannel).toHaveBeenCalledWith("combat_state:s1");
    expect(mockChannelObj.on).toHaveBeenCalledTimes(1);
    expect(mockChannelObj.on).toHaveBeenCalledWith(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "combat_state",
        filter: "session_id=eq.s1",
      },
      expect.any(Function)
    );
    expect(mockChannelObj.subscribe).toHaveBeenCalledOnce();

    unsubscribe();
    expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannelObj);
  });
});

describe("subscribeToSession", () => {
  it("creates channel with correct filters and returns unsubscribe", async () => {
    const mockChannelObj = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    };
    mockChannel.mockReturnValue(mockChannelObj);

    const onUpdate = vi.fn();
    const { subscribeToSession } = await import("../game-session.service");
    const unsubscribe = subscribeToSession("c1", onUpdate);

    expect(mockChannel).toHaveBeenCalledWith("game_sessions:c1");
    expect(mockChannelObj.on).toHaveBeenCalledTimes(2);
    expect(mockChannelObj.on).toHaveBeenCalledWith(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "game_sessions",
        filter: "campaign_id=eq.c1",
      },
      expect.any(Function)
    );
    expect(mockChannelObj.on).toHaveBeenCalledWith(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "game_sessions",
        filter: "campaign_id=eq.c1",
      },
      expect.any(Function)
    );
    expect(mockChannelObj.subscribe).toHaveBeenCalledOnce();

    unsubscribe();
    expect(mockRemoveChannel).toHaveBeenCalledWith(mockChannelObj);
  });
});
