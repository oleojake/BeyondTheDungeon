import { describe, it, expect } from "vitest";

describe("partida VM types", () => {
  it("exports types", async () => {
    const mod = await import("../partida.vm");
    expect(mod).toBeDefined();
  });
});
