import { describe, it, expect, vi, beforeEach } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("backend.service", () => {
  it("fetchBestiary returns monsters list", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ characters: [{ id: "1", name: "Goblin" }], count: 1 }),
    });

    const { fetchBestiary } = await import("../backend.service");
    const result = await fetchBestiary();
    expect(result.characters).toHaveLength(1);
    expect(result.characters[0].name).toBe("Goblin");
  });

  it("fetchBestiary throws on error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: "Server Error" });

    const { fetchBestiary } = await import("../backend.service");
    await expect(fetchBestiary()).rejects.toThrow("Error 500");
  });

  it("fetchMonsterById returns a single monster", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "m-1", name: "Dragon" }),
    });

    const { fetchMonsterById } = await import("../backend.service");
    const result = await fetchMonsterById("m-1");
    expect(result.name).toBe("Dragon");
  });

  it("fetchItems returns items list", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ items: [{ id: "i-1", name: "Espada" }], count: 1 }),
    });

    const { fetchItems } = await import("../backend.service");
    const result = await fetchItems();
    expect(result.items).toHaveLength(1);
  });

  it("fetchItemById returns a single item", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "i-1", name: "Escudo" }),
    });

    const { fetchItemById } = await import("../backend.service");
    const result = await fetchItemById("i-1");
    expect(result.name).toBe("Escudo");
  });

  it("fetchSpells returns spells list", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ spells: [{ id: "s-1", name: "Bola de Fuego" }], count: 1 }),
    });

    const { fetchSpells } = await import("../backend.service");
    const result = await fetchSpells();
    expect(result.spells).toHaveLength(1);
  });

  it("fetchSpellById returns a single spell", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: "s-1", name: "Curar Heridas" }),
    });

    const { fetchSpellById } = await import("../backend.service");
    const result = await fetchSpellById("s-1");
    expect(result.name).toBe("Curar Heridas");
  });

  it("checkSupabaseStatus calls backend endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ status: "ok" }),
    });

    const { checkSupabaseStatus } = await import("../backend.service");
    const result = await checkSupabaseStatus();
    expect(result).toEqual({ status: "ok" });
  });

  it("pingBackend returns ping response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "pong" }),
    });

    const { pingBackend } = await import("../backend.service");
    const result = await pingBackend();
    expect(result).toEqual({ message: "pong" });
  });
});
