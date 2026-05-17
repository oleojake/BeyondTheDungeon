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

describe("scene.service", () => {
  it("listScenes returns scenes", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({ scenes: [{ id: "s1", title: "Scene 1" }] }),
    });
    const { listScenes } = await import("../scene.service");
    const result = await listScenes("ch-1");
    expect(result).toEqual([{ id: "s1", title: "Scene 1" }]);
  });

  it("listScenes throws when not authenticated", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const { listScenes } = await import("../scene.service");
    await expect(listScenes("ch-1")).rejects.toThrow("No autenticado");
  });

  it("createScene sends POST", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({ scene: { id: "s2", title: "New" } }),
    });
    const { createScene } = await import("../scene.service");
    const result = await createScene("ch-1", { title: "New" });
    expect(result.title).toBe("New");
  });

  it("updateScene sends PUT", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({ scene: { id: "s1", title: "Updated" } }),
    });
    const { updateScene } = await import("../scene.service");
    const result = await updateScene("s1", { title: "Updated" });
    expect(result.title).toBe("Updated");
  });

  it("deleteScene sends DELETE", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { deleteScene } = await import("../scene.service");
    await expect(deleteScene("s1")).resolves.toBeUndefined();
  });
});
