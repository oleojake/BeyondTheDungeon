import { describe, it, expect, vi, beforeEach } from "vitest";
import { listCampaigns, getCampaign, createCampaign } from "../campaign.service";

const mockGetSession = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const authed = { session: { access_token: "token-123" } };

function mockFetch(data: unknown, ok = true) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok,
    json: async () => data,
  });
}

describe("listCampaigns", () => {
  it("returns campaigns list", async () => {
    mockGetSession.mockResolvedValue({ data: authed, error: null });
    mockFetch({ campaigns: [{ id: "1", title: "Campaign 1" }] });

    const result = await listCampaigns();
    expect(result).toEqual([{ id: "1", title: "Campaign 1" }]);
  });

  it("throws when not authenticated", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    await expect(listCampaigns()).rejects.toThrow("No autenticado");
  });
});

describe("getCampaign", () => {
  it("returns single campaign", async () => {
    mockGetSession.mockResolvedValue({ data: authed, error: null });
    mockFetch({ campaign: { id: "1", title: "My Campaign" } });

    const result = await getCampaign("1");
    expect(result).toEqual({ id: "1", title: "My Campaign" });
  });

  it("throws on server error", async () => {
    mockGetSession.mockResolvedValue({ data: authed, error: null });
    mockFetch({ error: "Not found" }, false);

    await expect(getCampaign("999")).rejects.toThrow("Not found");
  });
});

describe("createCampaign", () => {
  it("creates a campaign via POST", async () => {
    mockGetSession.mockResolvedValue({ data: authed, error: null });
    mockFetch({ campaign: { id: "new", title: "New Campaign" } });

    const result = await createCampaign({ title: "New Campaign", description: "Desc" });
    expect(result).toEqual({ id: "new", title: "New Campaign" });
  });
});
