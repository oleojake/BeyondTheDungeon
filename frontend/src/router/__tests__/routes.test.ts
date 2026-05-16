import { describe, it, expect } from "vitest";

describe("switchRoutes", () => {
  it("has root route", async () => {
    const { switchRoutes } = await import("@/router/routes");
    expect(switchRoutes.root).toBe("/");
  });

  it("has auth routes", async () => {
    const { switchRoutes } = await import("@/router/routes");
    expect(switchRoutes.login).toBe("/login");
    expect(switchRoutes.register).toBe("/registro");
    expect(switchRoutes.authCallback).toBe("/auth/callback");
  });

  it("has profile routes", async () => {
    const { switchRoutes } = await import("@/router/routes");
    expect(switchRoutes.profile).toBe("/profile");
    expect(switchRoutes.profileSettings).toBe("/profile/settings");
    expect(switchRoutes.profileCampanas).toBe("/profile/campanas");
    expect(switchRoutes.profileMapas).toBe("/profile/mapas");
  });

  it("has compendium routes", async () => {
    const { switchRoutes } = await import("@/router/routes");
    expect(switchRoutes.hechizos).toBe("/hechizos");
    expect(switchRoutes.hechizosDetalle).toBe("/hechizos/:id");
    expect(switchRoutes.bestiario).toBe("/bestiario");
    expect(switchRoutes.bestiarioDetalle).toBe("/bestiario/:id");
    expect(switchRoutes.objetos).toBe("/objetos");
    expect(switchRoutes.objetosDetalle).toBe("/objetos/:id");
  });

  it("has character and campaign routes", async () => {
    const { switchRoutes } = await import("@/router/routes");
    expect(switchRoutes.fichas).toBe("/fichas");
    expect(switchRoutes.fichaNueva).toBe("/fichas/nueva");
    expect(switchRoutes.mapaBatalla).toBe("/mapa-batalla");
    expect(switchRoutes.editarCampana).toBe("/editar-campana/:id");
    expect(switchRoutes.partida).toBe("/partida/:id");
  });

  it("has utility routes", async () => {
    const { switchRoutes } = await import("@/router/routes");
    expect(switchRoutes.dados).toBe("/dados");
    expect(switchRoutes.inventario).toBe("/inventario");
    expect(switchRoutes.admin).toBe("/admin");
    expect(switchRoutes.guias).toBe("/guias");
    expect(switchRoutes.guiaDetalle).toBe("/guias/:slug");
    expect(switchRoutes.foro).toBe("/foro");
    expect(switchRoutes.foroHilo).toBe("/foro/:id");
  });
});

describe("routes", () => {
  it("is a copy of switchRoutes", async () => {
    const { routes, switchRoutes } = await import("@/router/routes");
    expect(routes).toEqual(switchRoutes);
  });
});
