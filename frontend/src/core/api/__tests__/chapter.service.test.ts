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

describe("chapter.service", () => {
  it("listChapters returns chapters", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({ chapters: [{ id: "c1", title: "Ch1" }] }),
    });
    const { listChapters } = await import("../chapter.service");
    expect(await listChapters("camp-1")).toEqual([{ id: "c1", title: "Ch1" }]);
  });

  it("listChapters throws when not authenticated", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    const { listChapters } = await import("../chapter.service");
    await expect(listChapters("camp-1")).rejects.toThrow("No autenticado");
  });

  it("createChapter sends POST and returns chapter", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({ chapter: { id: "c2", title: "New" } }),
    });
    const { createChapter } = await import("../chapter.service");
    const result = await createChapter("camp-1", { title: "New" });
    expect(result.title).toBe("New");
  });

  it("updateChapter sends PUT", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({
      ok: true, json: () => Promise.resolve({ chapter: { id: "c1", title: "Updated" } }),
    });
    const { updateChapter } = await import("../chapter.service");
    const result = await updateChapter("c1", { title: "Updated" });
    expect(result.title).toBe("Updated");
  });

  it("deleteChapter sends DELETE", async () => {
    authed();
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    const { deleteChapter } = await import("../chapter.service");
    await expect(deleteChapter("c1")).resolves.toBeUndefined();
  });
});
