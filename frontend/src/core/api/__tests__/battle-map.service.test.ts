import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetSession = vi.fn();
const mockFetch = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: { getSession: (...args: unknown[]) => mockGetSession(...args) },
  },
}));

vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
});

function authedFetch() {
  mockGetSession.mockResolvedValue({
    data: { session: { access_token: "test-token" } },
  });
}

describe("battle-map.service", () => {
  it("listBattleMaps returns maps list", async () => {
    authedFetch();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ maps: [{ id: "1", name: "Map 1" }] }),
    });

    const { listBattleMaps } = await import("../battle-map.service");
    const result = await listBattleMaps();
    expect(result.maps).toHaveLength(1);
  });

  it("listBattleMaps throws when not authenticated", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });

    const { listBattleMaps } = await import("../battle-map.service");
    await expect(listBattleMaps()).rejects.toThrow("No estás autenticado");
  });

  it("listBattleMaps throws on non-JSON response", async () => {
    authedFetch();
    mockFetch.mockResolvedValueOnce({
      ok: false,
      headers: new Headers({ "content-type": "text/html" }),
    });

    const { listBattleMaps } = await import("../battle-map.service");
    await expect(listBattleMaps()).rejects.toThrow(/no respondió correctamente/);
  });

  it("getBattleMap returns a single map", async () => {
    authedFetch();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ map: { id: "1", name: "My Map" } }),
    });

    const { getBattleMap } = await import("../battle-map.service");
    const result = await getBattleMap("1");
    expect(result.map.name).toBe("My Map");
  });

  it("createBattleMap sends POST and returns new map", async () => {
    authedFetch();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ map: { id: "2", name: "New Map" } }),
    });

    const { createBattleMap } = await import("../battle-map.service");
    const result = await createBattleMap({ name: "New Map", image_data: "data", grid_size: 20, grid_color: "#fff" });
    expect(result.map.name).toBe("New Map");
  });

  it("updateBattleMap sends PUT and returns updated map", async () => {
    authedFetch();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({ map: { id: "1", name: "Updated" } }),
    });

    const { updateBattleMap } = await import("../battle-map.service");
    const result = await updateBattleMap("1", { name: "Updated", grid_size: 30, grid_color: "#000" });
    expect(result.map.name).toBe("Updated");
  });

  it("deleteBattleMap sends DELETE", async () => {
    authedFetch();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ "content-type": "application/json" }),
      json: () => Promise.resolve({}),
    });

    const { deleteBattleMap } = await import("../battle-map.service");
    await expect(deleteBattleMap("1")).resolves.toBeUndefined();
  });

  it("wraps fetch TypeError with friendly message", async () => {
    authedFetch();
    mockFetch.mockRejectedValueOnce(new TypeError("failed to fetch"));

    const { listBattleMaps } = await import("../battle-map.service");
    await expect(listBattleMaps()).rejects.toThrow(/No se pudo conectar/);
  });
});
