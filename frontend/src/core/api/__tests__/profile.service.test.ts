import { describe, it, expect, vi, beforeEach } from "vitest";

const mockQueryBuilder = {
  eq: vi.fn(() => mockQueryBuilder),
  single: vi.fn(() => Promise.resolve({ data: { username: "testuser", avatar_url: null }, error: null })),
  select: vi.fn(() => mockQueryBuilder),
  update: vi.fn(() => mockQueryBuilder),
};

const mockSupabase = {
  from: vi.fn(() => mockQueryBuilder),
  auth: {
    updateUser: vi.fn(() => Promise.resolve({ error: null })),
  },
  storage: {
    from: vi.fn(() => ({
      upload: vi.fn(() => Promise.resolve({ error: null })),
      getPublicUrl: vi.fn(() => ({ data: { publicUrl: "https://example.com/avatar.jpg" } })),
    })),
  },
};

vi.mock("@/lib/supabase", () => ({
  supabase: mockSupabase,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("profile.service", () => {
  it("getProfile returns user profile", async () => {
    const { getProfile } = await import("../profile.service");
    const result = await getProfile("user-1");
    expect(result).toEqual({ username: "testuser", avatar_url: null });
  });

  it("getProfile throws on error", async () => {
    mockQueryBuilder.single.mockResolvedValueOnce({ data: null, error: { message: "Not found" } });
    const { getProfile } = await import("../profile.service");
    await expect(getProfile("bad-id")).rejects.toThrow("Not found");
  });

  it("updateAvatar updates avatar_url", async () => {
    const { updateAvatar } = await import("../profile.service");
    await expect(updateAvatar("user-1", "new-avatar-url")).resolves.toBeUndefined();
  });

  it("updateUsername updates username", async () => {
    const { updateUsername } = await import("../profile.service");
    await expect(updateUsername("user-1", "new-name")).resolves.toBeUndefined();
  });

  it("uploadAvatarFile uploads and returns public URL", async () => {
    const { uploadAvatarFile } = await import("../profile.service");
    const file = new File(["dummy"], "avatar.png", { type: "image/png" });
    const url = await uploadAvatarFile("user-1", file);
    expect(url).toBe("https://example.com/avatar.jpg");
  });

  it("updateEmail calls auth.updateUser with email", async () => {
    const { updateEmail } = await import("../profile.service");
    await updateEmail("new@test.com");
    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ email: "new@test.com" });
  });

  it("updatePassword calls auth.updateUser with password", async () => {
    const { updatePassword } = await import("../profile.service");
    await updatePassword("new-pass-123");
    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({ password: "new-pass-123" });
  });
});
