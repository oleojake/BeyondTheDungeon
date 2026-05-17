import { describe, it, expect, vi, beforeEach } from "vitest";

const mockGetSession = vi.fn();
const mockFetch = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: { auth: { getSession: (...args: unknown[]) => mockGetSession(...args) } },
}));

vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
});

function authed() {
  mockGetSession.mockResolvedValue({ data: { session: { access_token: "tok" } } });
}

describe("scene-entity.service", () => {
  it("listSceneEntities returns entities", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({ entities: [{ id: "e1", entity_name: "Goblin" }] }),
    });
    const { listSceneEntities } = await import("../scene-entity.service");
    const result = await listSceneEntities("scene-1");
    expect(result).toEqual([{ id: "e1", entity_name: "Goblin" }]);
  });

  it("listSceneEntities throws when not authenticated", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const { listSceneEntities } = await import("../scene-entity.service");
    await expect(listSceneEntities("scene-1")).rejects.toThrow("No autenticado");
  });

  it("createSceneEntity sends POST", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({ entity: { id: "e2", entity_name: "Dragon" } }),
    });
    const { createSceneEntity } = await import("../scene-entity.service");
    const result = await createSceneEntity("scene-1", { entity_type: "monster", entity_id: "m-1", entity_name: "Dragon" });
    expect(result.entity_name).toBe("Dragon");
  });

  it("deleteSceneEntity sends DELETE", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { deleteSceneEntity } = await import("../scene-entity.service");
    await expect(deleteSceneEntity("e1")).resolves.toBeUndefined();
  });
});
