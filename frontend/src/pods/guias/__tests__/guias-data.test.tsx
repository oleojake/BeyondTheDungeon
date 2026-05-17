import { describe, it, expect } from "vitest";

describe("GUIDES data", () => {
  it("exports GUIDES as an array with expected length", async () => {
    const { GUIDES } = await import("../guias-data");
    expect(Array.isArray(GUIDES)).toBe(true);
    expect(GUIDES.length).toBeGreaterThanOrEqual(10);
  });

  it("each guide has required string fields", async () => {
    const { GUIDES } = await import("../guias-data");
    for (const guide of GUIDES) {
      expect(typeof guide.slug).toBe("string");
      expect(guide.slug.length).toBeGreaterThan(0);
      expect(typeof guide.title).toBe("string");
      expect(guide.title.length).toBeGreaterThan(0);
      expect(typeof guide.tagline).toBe("string");
      expect(typeof guide.cardDescription).toBe("string");
      expect(typeof guide.category).toBe("string");
      expect(typeof guide.categoryColor).toBe("string");
      expect(typeof guide.accentClass).toBe("string");
    }
  });

  it("each guide has an Icon component", async () => {
    const { GUIDES } = await import("../guias-data");
    for (const guide of GUIDES) {
      expect(guide.Icon).toBeDefined();
    }
  });

  it("each guide has sections array with title and content", async () => {
    const { GUIDES } = await import("../guias-data");
    for (const guide of GUIDES) {
      expect(Array.isArray(guide.sections)).toBe(true);
      expect(guide.sections.length).toBeGreaterThan(0);
      for (const section of guide.sections) {
        expect(typeof section.title).toBe("string");
        expect(section.title.length).toBeGreaterThan(0);
        expect(section.content).toBeDefined();
      }
    }
  });

  it("all slugs are unique", async () => {
    const { GUIDES } = await import("../guias-data");
    const slugs = GUIDES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has expected guide slugs", async () => {
    const { GUIDES } = await import("../guias-data");
    const slugs = GUIDES.map((g) => g.slug);
    expect(slugs).toContain("primeros-pasos");
    expect(slugs).toContain("fichas-de-personaje");
    expect(slugs).toContain("compendio-hechizos");
    expect(slugs).toContain("bestiario");
    expect(slugs).toContain("compendio-objetos");
    expect(slugs).toContain("inventario");
    expect(slugs).toContain("tirada-de-dados");
    expect(slugs).toContain("mapa-de-batalla");
    expect(slugs).toContain("gestion-de-campanas");
    expect(slugs).toContain("la-partida");
  });

  it("has valid category values", async () => {
    const { GUIDES } = await import("../guias-data");
    const validCategories = ["General", "Herramienta", "Compendio", "Campaña"];
    for (const guide of GUIDES) {
      expect(validCategories).toContain(guide.category);
    }
  });

  it("has categoryColor starting with text-", async () => {
    const { GUIDES } = await import("../guias-data");
    for (const guide of GUIDES) {
      expect(guide.categoryColor).toMatch(/^text-/);
    }
  });

  it("has accentClass starting with from-", async () => {
    const { GUIDES } = await import("../guias-data");
    for (const guide of GUIDES) {
      expect(guide.accentClass).toMatch(/^from-/);
    }
  });
});

describe("getGuideBySlug", () => {
  it("returns the correct guide for a valid slug", async () => {
    const { getGuideBySlug } = await import("../guias-data");
    const guide = getGuideBySlug("primeros-pasos");
    expect(guide).toBeDefined();
    expect(guide!.title).toBe("Primeros Pasos");
  });

  it("returns undefined for an invalid slug", async () => {
    const { getGuideBySlug } = await import("../guias-data");
    const guide = getGuideBySlug("nonexistent-slug");
    expect(guide).toBeUndefined();
  });
});
