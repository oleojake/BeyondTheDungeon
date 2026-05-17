import { describe, it, expect } from "vitest";

describe("character module", () => {
  it("exports defaultCharacterStats runtime constant", async () => {
    const char = await import("../character");
    expect(char.defaultCharacterStats).toBeDefined();
  });

  it("exports defaultCharacter runtime constant", async () => {
    const char = await import("../character");
    expect(char.defaultCharacter).toBeDefined();
  });

  it("defaultCharacterStats has correct default values", async () => {
    const { defaultCharacterStats } = await import("../character");
    expect(defaultCharacterStats.strength).toBe(10);
    expect(defaultCharacterStats.dexterity).toBe(10);
    expect(defaultCharacterStats.constitution).toBe(10);
    expect(defaultCharacterStats.intelligence).toBe(10);
    expect(defaultCharacterStats.wisdom).toBe(10);
    expect(defaultCharacterStats.charisma).toBe(10);
    expect(defaultCharacterStats.max_hp).toBe(10);
    expect(defaultCharacterStats.current_hp).toBe(10);
    expect(defaultCharacterStats.temp_hp).toBe(0);
    expect(defaultCharacterStats.armor_class).toBe(10);
    expect(defaultCharacterStats.initiative).toBe(0);
    expect(defaultCharacterStats.speed).toBe(30);
    expect(defaultCharacterStats.proficiency_bonus).toBe(2);
    expect(defaultCharacterStats.hit_dice).toBe("1d8");
    expect(defaultCharacterStats.max_carry_weight).toBe(150);
  });

  it("defaultCharacterStats has all saving throws defaulting to false", async () => {
    const { defaultCharacterStats } = await import("../character");
    const st = defaultCharacterStats.saving_throws;
    expect(st.strength).toBe(false);
    expect(st.dexterity).toBe(false);
    expect(st.constitution).toBe(false);
    expect(st.intelligence).toBe(false);
    expect(st.wisdom).toBe(false);
    expect(st.charisma).toBe(false);
  });

  it("defaultCharacterStats has all 18 skills defaulting to false", async () => {
    const { defaultCharacterStats } = await import("../character");
    const skills = defaultCharacterStats.skills;
    const skillKeys = Object.keys(skills);
    expect(skillKeys.length).toBe(18);
    for (const val of Object.values(skills)) {
      expect(val).toBe(false);
    }
  });

  it("defaultCharacterStats has death saves with successes and failures at 0", async () => {
    const { defaultCharacterStats } = await import("../character");
    expect(defaultCharacterStats.death_saves.successes).toBe(0);
    expect(defaultCharacterStats.death_saves.failures).toBe(0);
  });

  it("defaultCharacter has expected initial values", async () => {
    const { defaultCharacter } = await import("../character");
    expect(defaultCharacter.name).toBe("");
    expect(defaultCharacter.race).toBe("");
    expect(defaultCharacter.experience_points).toBe(0);
    expect(defaultCharacter.is_npc).toBe(false);
    expect(defaultCharacter.is_public).toBe(false);
    expect(defaultCharacter.classes).toEqual([{ name: "", level: 1 }]);
  });
});

describe("forms module", () => {
  it("module can be imported without errors", async () => {
    const forms = await import("../forms");
    expect(forms).toBeDefined();
  });
});

describe("registerProps module", () => {
  it("module can be imported without errors", async () => {
    const reg = await import("../registerProps");
    expect(reg).toBeDefined();
  });
});
