import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/scenes", () => ({
  HomeScene: () => <div data-testid="home-scene" />,
  AuthCallbackScene: () => <div data-testid="auth-callback-scene" />,
  MapaBatallaScene: () => <div data-testid="mapa-batalla-scene" />,
  MisMapasScene: () => <div data-testid="mis-mapas-scene" />,
  MisCampanasScene: () => <div data-testid="mis-campanas-scene" />,
  EditarCampanaScene: () => <div data-testid="editar-campana-scene" />,
  PartidaScene: () => <div data-testid="partida-scene" />,
  GuiasScene: () => <div data-testid="guias-scene" />,
  GuiaDetalleScene: () => <div data-testid="guia-detalle-scene" />,
  ProfileSettingsScene: () => <div data-testid="profile-settings-scene" />,
  MiFichaScene: () => <div data-testid="mi-ficha-scene" />,
  MisFichasScene: () => <div data-testid="mis-fichas-scene" />,
  DadosScene: () => <div data-testid="dados-scene" />,
  HechizosScene: () => <div data-testid="hechizos-scene" />,
  HechizosDetalleScene: () => <div data-testid="hechizos-detalle-scene" />,
  InventarioScene: () => <div data-testid="inventario-scene" />,
  BestiarioScene: () => <div data-testid="bestiario-scene" />,
  BestiarioDetalleScene: () => <div data-testid="bestiario-detalle-scene" />,
  ObjetosScene: () => <div data-testid="objetos-scene" />,
  ObjetosDetalleScene: () => <div data-testid="objetos-detalle-scene" />,
  ForoScene: () => <div data-testid="foro-scene" />,
  ForoHiloScene: () => <div data-testid="foro-hilo-scene" />,
  AdminDashboardScene: () => <div data-testid="admin-dashboard-scene" />,
}));

vi.mock("@/scenes/login.scene", () => ({
  LoginScene: () => <div data-testid="login-scene" />,
}));

vi.mock("@/scenes/register.scene", () => ({
  RegisterScene: () => <div data-testid="register-scene" />,
}));

vi.mock("@/scenes/profile-settings.scene", () => ({
  default: () => <div data-testid="profile-settings-scene" />,
}));

vi.mock("@/scenes/mi-ficha.scene", () => ({
  default: () => <div data-testid="mi-ficha-scene" />,
}));

vi.mock("@/scenes/mis-fichas.scene", () => ({
  MisFichasScene: () => <div data-testid="mis-fichas-scene" />,
}));

vi.mock("@/scenes/dados.scene", () => ({
  default: () => <div data-testid="dados-scene" />,
}));

vi.mock("@/scenes/hechizos.scene", () => ({
  default: () => <div data-testid="hechizos-scene" />,
}));

vi.mock("@/scenes/hechizos-detalle.scene", () => ({
  default: () => <div data-testid="hechizos-detalle-scene" />,
}));

vi.mock("@/scenes/inventario.scene", () => ({
  default: () => <div data-testid="inventario-scene" />,
}));

vi.mock("@/scenes/bestiario.scene", () => ({
  default: () => <div data-testid="bestiario-scene" />,
}));

vi.mock("@/scenes/bestiario-detalle.scene", () => ({
  default: () => <div data-testid="bestiario-detalle-scene" />,
}));

vi.mock("@/scenes/objetos.scene", () => ({
  default: () => <div data-testid="objetos-scene" />,
}));

vi.mock("@/scenes/objetos-detalle.scene", () => ({
  default: () => <div data-testid="objetos-detalle-scene" />,
}));

vi.mock("@/scenes/foro.scene", () => ({
  default: () => <div data-testid="foro-scene" />,
}));

vi.mock("@/scenes/foro-hilo.scene", () => ({
  default: () => <div data-testid="foro-hilo-scene" />,
}));

vi.mock("@/scenes/admin-dashboard.scene", () => ({
  AdminDashboardScene: () => <div data-testid="admin-dashboard-scene" />,
}));

vi.mock("@/core/auth/ProtectedRoute", () => ({
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

vi.mock("@/core/auth/AdminRoute", () => ({
  AdminRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-route">{children}</div>
  ),
}));

vi.mock("@/layout/app.layout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

vi.mock("@/layout/tool.layout", () => ({
  FullscreenToolLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="fullscreen-tool-layout">{children}</div>
  ),
}));

vi.mock("@/router/routes", () => ({
  switchRoutes: {
    root: "/",
    login: "/login",
    register: "/registro",
    authCallback: "/auth/callback",
    hechizos: "/hechizos",
    hechizosDetalle: "/hechizos/:id",
    bestiario: "/bestiario",
    bestiarioDetalle: "/bestiario/:id",
    objetos: "/objetos",
    objetosDetalle: "/objetos/:id",
    guias: "/guias",
    guiaDetalle: "/guias/:slug",
    dados: "/dados",
    inventario: "/inventario",
    fichas: "/fichas",
    fichaNueva: "/fichas/nueva",
    foro: "/foro",
    foroHilo: "/foro/:id",
    mapaBatalla: "/mapa-batalla",
    profile: "/profile",
    profileSettings: "/profile/settings",
    profileCampanas: "/profile/campanas",
    profileMapas: "/profile/mapas",
    editarCampana: "/editar-campana/:id",
    partida: "/partida/:id",
    admin: "/admin",
  },
}));

import { AppRouter } from "../app.router";

describe("AppRouter", () => {
  it("exports AppRouter as a function/component", () => {
    expect(AppRouter).toBeDefined();
    expect(typeof AppRouter).toBe("function");
  });

  it("renders without crashing", () => {
    const { container } = render(<AppRouter />);
    expect(container).toBeTruthy();
  });

  it("renders the home route", () => {
    render(<AppRouter />);
    expect(screen.getByTestId("home-scene")).toBeTruthy();
  });
});
