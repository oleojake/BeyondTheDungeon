import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchCharacterSheet,
  fetchCharacterSheetById,
  createCharacterSheet,
  updateCharacterSheet,
  listCharacterSheets,
  deleteCharacterSheet,
  uploadCharacterAvatar,
} from "../character-sheet.service";

const mockGetSession = vi.fn();
const mockStorageUpload = vi.fn();
const mockStorageGetPublicUrl = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
    storage: {
      from: vi.fn(() => ({
        upload: (...args: unknown[]) => mockStorageUpload(...args),
        getPublicUrl: (...args: unknown[]) => mockStorageGetPublicUrl(...args),
      })),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const authed = { session: { access_token: "token-123" } };

function mockFetch(data: unknown, ok = true, contentType = "application/json") {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok,
    headers: new Headers({ "content-type": contentType }),
    json: async () => data,
    status: ok ? 200 : 400,
  });
}

const fakeCharacter = {
  id: "char-1",
  name: "Gandalf",
  race: "Human",
  class: [{ name: "Wizard", level: 5 }],
};

describe("fetchCharacterSheet", () => {
  it("returns character sheet", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-123" } },
      error: null,
    });
    mockFetch({ character: fakeCharacter });

    const result = await fetchCharacterSheet();
    expect(result.character).toEqual(fakeCharacter);
  });

  it("throws when not authenticated", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    await expect(fetchCharacterSheet()).rejects.toThrow("No estás autenticado");
  });

  it("throws on non-JSON response", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-123" } },
      error: null,
    });
    mockFetch({}, false, "text/html");

    await expect(fetchCharacterSheet()).rejects.toThrow(
      "El servidor backend no respondió correctamente"
    );
  });
});

describe("fetchCharacterSheetById", () => {
  it("returns character by id", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-123" } },
      error: null,
    });
    mockFetch({ character: fakeCharacter });

    const result = await fetchCharacterSheetById("char-1");
    expect(result.character?.name).toBe("Gandalf");
  });
});

describe("createCharacterSheet", () => {
  it("creates a character via POST", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-123" } },
      error: null,
    });
    mockFetch({ character: fakeCharacter });

    const formData = {
      name: "Gandalf",
      race: "Human",
      classes: [{ name: "Wizard", level: 5 }],
    } as never;

    const result = await createCharacterSheet(formData);
    expect(result.character?.name).toBe("Gandalf");
  });
});

describe("updateCharacterSheet", () => {
  it("updates a character via PUT", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-123" } },
      error: null,
    });
    mockFetch({ character: { ...fakeCharacter, name: "Gandalf the White" } });

    const formData = { name: "Gandalf the White" } as never;
    const result = await updateCharacterSheet("char-1", formData);
    expect(result.character?.name).toBe("Gandalf the White");
  });
});

describe("listCharacterSheets", () => {
  it("returns list of characters", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-123" } },
      error: null,
    });
    mockFetch({ characters: [fakeCharacter] });

    const result = await listCharacterSheets();
    expect(result.characters).toHaveLength(1);
  });
});

describe("deleteCharacterSheet", () => {
  it("deletes via DELETE", async () => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token-123" } },
      error: null,
    });
    mockFetch({});

    await expect(deleteCharacterSheet("char-1")).resolves.toBeUndefined();
  });
});

describe("uploadCharacterAvatar", () => {
  it("uploads file and returns public URL", async () => {
    mockStorageUpload.mockResolvedValue({ error: null });
    mockStorageGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://example.com/avatar.jpg" },
    });

    const file = new File(["data"], "avatar.png", { type: "image/png" });
    const url = await uploadCharacterAvatar("user-1", "char-1", file);

    expect(url).toBe("https://example.com/avatar.jpg");
    expect(mockStorageUpload).toHaveBeenCalledWith(
      "user-1/char-1.png",
      file,
      { upsert: true }
    );
  });
});
