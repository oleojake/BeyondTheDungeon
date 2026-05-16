import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  listUserInvitations,
  createInvitation,
  acceptInvitation,
  rejectInvitation,
  deleteInvitation,
} from "../campaign-invitation.service";

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

const authedSession = { session: { access_token: "token-123" } };

function mockFetchOnce(data: unknown, ok = true) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok,
    json: async () => data,
  });
}

describe("listUserInvitations", () => {
  it("fetches and returns invitations", async () => {
    mockGetSession.mockResolvedValue({ data: authedSession, error: null });
    mockFetchOnce({ invitations: [{ id: "1", status: "pending" }] });

    const result = await listUserInvitations();
    expect(result).toEqual([{ id: "1", status: "pending" }]);
  });

  it("throws when not authenticated", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    await expect(listUserInvitations()).rejects.toThrow("No autenticado");
  });

  it("throws on fetch error", async () => {
    mockGetSession.mockResolvedValue({ data: authedSession, error: null });
    mockFetchOnce({ error: "Server error" }, false);
    await expect(listUserInvitations()).rejects.toThrow("Server error");
  });
});

describe("createInvitation", () => {
  it("sends POST and returns invitation", async () => {
    mockGetSession.mockResolvedValue({ data: authedSession, error: null });
    mockFetchOnce({ invitation: { id: "1", email: "test@test.com" } });

    const result = await createInvitation("campaign-1", { username: "player1" });
    expect(result).toEqual({ id: "1", email: "test@test.com" });
  });

  it("throws when not authenticated", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    await expect(createInvitation("c1", { username: "u" })).rejects.toThrow("No autenticado");
  });
});

describe("acceptInvitation", () => {
  it("sends PUT and succeeds", async () => {
    mockGetSession.mockResolvedValue({ data: authedSession, error: null });
    mockFetchOnce({});
    await expect(acceptInvitation("token-abc")).resolves.toBeUndefined();
  });
});

describe("rejectInvitation", () => {
  it("sends PUT and succeeds", async () => {
    mockGetSession.mockResolvedValue({ data: authedSession, error: null });
    mockFetchOnce({});
    await expect(rejectInvitation("token-xyz")).resolves.toBeUndefined();
  });
});

describe("deleteInvitation", () => {
  it("sends DELETE and succeeds", async () => {
    mockGetSession.mockResolvedValue({ data: authedSession, error: null });
    mockFetchOnce({});
    await expect(deleteInvitation("inv-1")).resolves.toBeUndefined();
  });
});
