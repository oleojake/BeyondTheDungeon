import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("@/i18n", () => ({
  useTranslation: () => ({
    locale: "es",
    t: {
      cta: {
        heading: "CTA Heading",
        body: "CTA Body",
        createFree: "Create Free",
        viewDemo: "View Demo",
        disclaimer: "Disclaimer",
      },
      features: {
        heading: "Features",
        headingHighlight: "Highlight",
        subheading: "Subheading",
        toolsHeading: "Tools",
        toolsSubheading: "Tools Sub",
        viewAll: "View All",
        cards: {
          campaigns: { title: "Campaigns", description: "Campaigns desc" },
          characters: { title: "Characters", description: "Characters desc" },
          dice: { title: "Dice", description: "Dice desc" },
          battleMaps: { title: "Battle Maps", description: "Battle Maps desc" },
          bestiary: { title: "Bestiary", description: "Bestiary desc" },
          spells: { title: "Spells", description: "Spells desc" },
          items: { title: "Items", description: "Items desc" },
          inventory: { title: "Inventory", description: "Inventory desc" },
        },
      },
      footer: {
        tagline: "Tagline",
        compendium: "Compendio",
        tools: "Herramientas",
        myAccount: "Mi Cuenta",
        resources: "Recursos",
        rights: "Todos los derechos reservados.",
        links: {
          bestiary: "Bestiario",
          spells: "Hechizos",
          items: "Objetos",
          characters: "Personajes",
          dice: "Dados",
          battleMap: "Mapa de Batalla",
          inventory: "Inventario",
          campaigns: "Campañas",
          maps: "Mapas",
          settings: "Ajustes",
          adventurerGuides: "Guías de Aventurero",
        },
      },
      hero: {
        cta: "Comenzar ahora",
        explore: "Explorar herramientas",
      },
      nav: {
        compendium: "Compendio",
        tools: "Herramientas",
        guides: "Guías",
        forum: "Foro",
        login: "Iniciar sesión",
        createAccount: "Crear cuenta",
        myPanel: "Mi Panel",
        logout: "Cerrar sesión",
        openMenu: "Abrir menú",
        closeMenu: "Cerrar menú",
        others: "Otros",
        compendiumLinks: {
          bestiary: { label: "Bestiario", desc: "Descripción del bestiario" },
          spells: { label: "Hechizos", desc: "Descripción de hechizos" },
          items: { label: "Objetos", desc: "Descripción de objetos" },
        },
        toolLinks: {
          characters: { label: "Personajes", desc: "Descripción de personajes" },
          dice: { label: "Dados", desc: "Descripción de dados" },
          battleMap: { label: "Mapa de Batalla", desc: "Descripción del mapa" },
          inventory: { label: "Inventario", desc: "Descripción del inventario" },
        },
      },
    },
    setLocale: vi.fn(),
    toggleLocale: vi.fn(),
  }),
}));

vi.mock("@/router", () => ({
  routes: {
    root: "/",
    login: "/login",
    register: "/registro",
    profileCampanas: "/profile/campanas",
    profileMapas: "/profile/mapas",
    profileSettings: "/profile/settings",
    fichas: "/fichas",
    fichaNueva: "/fichas/nueva",
    bestiario: "/bestiario",
    hechizos: "/hechizos",
    objetos: "/objetos",
    dados: "/dados",
    inventario: "/inventario",
    mapaBatalla: "/mapa-batalla",
    guias: "/guias",
    foro: "/foro",
  },
}));

vi.mock("@/core/auth/useAuth", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    logout: vi.fn(),
  }),
}));

vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <div data-testid="mock-theme-toggle" />,
}));

vi.mock("@/components/language-switcher", () => ({
  LanguageSwitcher: () => <div data-testid="mock-language-switcher" />,
}));

import { CTA } from "../components/cta.component";
import { Features } from "../components/features.component";
import { Footer } from "../components/footer.component";
import { Hero } from "../components/hero.component";
import { Navbar } from "../components/navbar.component";

import {
  createMemoryRouter as createRRRouter,
  RouterProvider as RRRouterProvider,
} from "react-router";

import {
  createMemoryRouter as createRRDomRouter,
  RouterProvider as RRDomRouterProvider,
} from "react-router-dom";

function renderRR(Component: React.ComponentType) {
  const router = createRRRouter([
    { path: "/", element: <Component /> },
    { path: "/registro", element: <div>Register</div> },
    { path: "/login", element: <div>Login</div> },
    { path: "/profile/campanas", element: <div>Campaigns</div> },
    { path: "/bestiario", element: <div>Bestiario</div> },
    { path: "/hechizos", element: <div>Hechizos</div> },
    { path: "/objetos", element: <div>Objetos</div> },
    { path: "/fichas", element: <div>Fichas</div> },
    { path: "/dados", element: <div>Dados</div> },
    { path: "/mapa-batalla", element: <div>Mapa</div> },
    { path: "/inventario", element: <div>Inventario</div> },
    { path: "/profile/mapas", element: <div>Mapas</div> },
    { path: "/profile/settings", element: <div>Settings</div> },
    { path: "/guias", element: <div>Guias</div> },
    { path: "/foro", element: <div>Foro</div> },
  ], { initialEntries: ["/"] });
  return render(<RRRouterProvider router={router} />);
}

function renderRRDom(Component: React.ComponentType) {
  const router = createRRDomRouter([
    { path: "/", element: <Component /> },
    { path: "/registro", element: <div>Register</div> },
    { path: "/bestiario", element: <div>Bestiario</div> },
    { path: "/hechizos", element: <div>Hechizos</div> },
    { path: "/objetos", element: <div>Objetos</div> },
    { path: "/fichas", element: <div>Fichas</div> },
    { path: "/dados", element: <div>Dados</div> },
    { path: "/mapa-batalla", element: <div>Mapa</div> },
    { path: "/inventario", element: <div>Inventario</div> },
    { path: "/profile/campanas", element: <div>Campaigns</div> },
    { path: "/profile/mapas", element: <div>Mapas</div> },
    { path: "/profile/settings", element: <div>Settings</div> },
    { path: "/guias", element: <div>Guias</div> },
    { path: "/foro", element: <div>Foro</div> },
  ], { initialEntries: ["/"] });
  return render(<RRDomRouterProvider router={router} />);
}

describe("CTA", () => {
  it("renders heading and action buttons", () => {
    renderRR(CTA);
    expect(screen.getByText("CTA Heading")).toBeTruthy();
    expect(screen.getByText("Create Free")).toBeTruthy();
    expect(screen.getByText("View Demo")).toBeTruthy();
    expect(screen.getByText("Disclaimer")).toBeTruthy();
  });
});

describe("Features", () => {
  it("renders heading, subheading and feature cards", () => {
    renderRRDom(Features);
    expect(screen.getByText("Features")).toBeTruthy();
    expect(screen.getByText("Highlight")).toBeTruthy();
    expect(screen.getByText("Tools")).toBeTruthy();
    expect(screen.getByText("Campaigns")).toBeTruthy();
    expect(screen.getByText("Characters")).toBeTruthy();
    expect(screen.getByText("View All")).toBeTruthy();
  });
});

describe("Hero", () => {
  it("renders CTA buttons", () => {
    renderRR(Hero);
    expect(screen.getByText("Comenzar ahora")).toBeTruthy();
    expect(screen.getByText("Explorar herramientas")).toBeTruthy();
  });
});

describe("Footer", () => {
  it("renders brand, links and copyright", () => {
    renderRRDom(Footer);
    expect(screen.getByText("Beyond the Dungeon")).toBeTruthy();
    expect(screen.getByText("Compendio")).toBeTruthy();
    expect(screen.getByText("Herramientas")).toBeTruthy();
    expect(screen.getByText("Mi Cuenta")).toBeTruthy();
    expect(screen.getByText("Recursos")).toBeTruthy();
    expect(screen.getByText(/Todos los derechos reservados/)).toBeTruthy();
  });
});

describe("Navbar", () => {
  it("renders logo, nav links and auth buttons", () => {
    renderRR(Navbar);
    expect(screen.getByText("Beyond the Dungeon")).toBeTruthy();
    expect(screen.getByText("Compendio")).toBeTruthy();
    expect(screen.getByText("Herramientas")).toBeTruthy();
    expect(screen.getByText("Guías")).toBeTruthy();
    expect(screen.getByText("Foro")).toBeTruthy();
    expect(screen.getByText("Iniciar sesión")).toBeTruthy();
    expect(screen.getByText("Crear cuenta")).toBeTruthy();
  });

  it("renders theme toggle and language switcher", () => {
    renderRR(Navbar);
    expect(screen.getByTestId("mock-theme-toggle")).toBeTruthy();
    expect(screen.getByTestId("mock-language-switcher")).toBeTruthy();
  });
});
