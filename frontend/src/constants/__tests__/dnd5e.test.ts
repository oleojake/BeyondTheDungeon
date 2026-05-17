import { describe, it, expect } from "vitest";

describe("DND_RACES", () => {
  it("contains all expected races", async () => {
    const { DND_RACES } = await import("@/constants/dnd5e");
    expect(DND_RACES).toContain("Humano");
    expect(DND_RACES).toContain("Elfo");
    expect(DND_RACES).toContain("Enano");
    expect(DND_RACES).toContain("Draconido");
    expect(DND_RACES).toContain("Tiefling");
    expect(DND_RACES).toContain("Semiorco");
    expect(DND_RACES.length).toBeGreaterThanOrEqual(16);
  });
});

describe("DND_CLASSES", () => {
  it("contains all 12 core classes", async () => {
    const { DND_CLASSES } = await import("@/constants/dnd5e");
    expect(DND_CLASSES).toContain("Bárbaro");
    expect(DND_CLASSES).toContain("Mago");
    expect(DND_CLASSES).toContain("Pícaro");
    expect(DND_CLASSES).toContain("Clérigo");
    expect(DND_CLASSES.length).toBe(12);
  });
});

describe("DND_ALIGNMENTS", () => {
  it("contains all 9 alignments", async () => {
    const { DND_ALIGNMENTS } = await import("@/constants/dnd5e");
    expect(DND_ALIGNMENTS).toContain("Legal Bueno");
    expect(DND_ALIGNMENTS).toContain("Caótico Neutral");
    expect(DND_ALIGNMENTS).toContain("Caótico Malvado");
    expect(DND_ALIGNMENTS.length).toBe(9);
  });
});

describe("DND_BACKGROUNDS", () => {
  it("contains common backgrounds", async () => {
    const { DND_BACKGROUNDS } = await import("@/constants/dnd5e");
    expect(DND_BACKGROUNDS).toContain("Acólito");
    expect(DND_BACKGROUNDS).toContain("Soldado");
    expect(DND_BACKGROUNDS).toContain("Noble");
    expect(DND_BACKGROUNDS.length).toBeGreaterThanOrEqual(12);
  });
});

describe("DND_SKILLS", () => {
  it("has expected skills with Spanish translations", async () => {
    const { DND_SKILLS } = await import("@/constants/dnd5e");
    expect(DND_SKILLS.acrobatics).toBe("Acrobacias");
    expect(DND_SKILLS.stealth).toBe("Sigilo");
    expect(DND_SKILLS.perception).toBe("Percepción");
    expect(DND_SKILLS.persuasion).toBe("Persuasión");
    expect(Object.keys(DND_SKILLS).length).toBe(18);
  });
});

describe("DND_ABILITIES", () => {
  it("has 6 abilities with Spanish translations", async () => {
    const { DND_ABILITIES } = await import("@/constants/dnd5e");
    expect(DND_ABILITIES.strength).toBe("Fuerza");
    expect(DND_ABILITIES.dexterity).toBe("Destreza");
    expect(DND_ABILITIES.constitution).toBe("Constitución");
    expect(DND_ABILITIES.intelligence).toBe("Inteligencia");
    expect(DND_ABILITIES.wisdom).toBe("Sabiduría");
    expect(DND_ABILITIES.charisma).toBe("Carisma");
    expect(Object.keys(DND_ABILITIES).length).toBe(6);
  });
});

describe("DND_PROFICIENCIES", () => {
  it("contains weapon, armor, and tool proficiencies", async () => {
    const { DND_PROFICIENCIES } = await import("@/constants/dnd5e");
    expect(DND_PROFICIENCIES).toContain("Armas simples");
    expect(DND_PROFICIENCIES).toContain("Armaduras ligeras");
    expect(DND_PROFICIENCIES).toContain("Herramientas de ladrón");
    expect(DND_PROFICIENCIES.length).toBeGreaterThan(40);
  });
});
