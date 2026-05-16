import { describe, it, expect } from "vitest";

describe("PRESET_AVATARS", () => {
  it("contains a list of 5 preset avatars with expected properties", async () => {
    const { PRESET_AVATARS } = await import("@/constants/avatars");
    expect(PRESET_AVATARS).toHaveLength(5);
    expect(PRESET_AVATARS[0].id).toBe("warrior");
    expect(PRESET_AVATARS[0].name).toBe("Guerrero");
    expect(PRESET_AVATARS[0].url).toContain("dicebear.com");
  });

  it("each avatar has id, name, and url", async () => {
    const { PRESET_AVATARS } = await import("@/constants/avatars");
    for (const avatar of PRESET_AVATARS) {
      expect(avatar.id).toBeDefined();
      expect(avatar.name).toBeDefined();
      expect(avatar.url).toContain("dicebear.com");
    }
  });
});
