import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "@/test/test-utils";

// ─── Mock pod containers (thin wrappers) ──────────────────────────────────────
vi.mock("@/pods/home", () => ({
  HomeContainer: () => <div data-testid="home-container" />,
}));
vi.mock("@/pods/login/login.container", () => ({
  LoginContainer: () => <div data-testid="login-container" />,
}));
vi.mock("@/pods/register/register.container", () => ({
  RegisterContainer: () => <div data-testid="register-container" />,
}));
vi.mock("@/pods/partida", () => ({
  PartidaContainer: () => <div data-testid="partida-container" />,
}));

// ─── Mock layout ──────────────────────────────────────────────────────────────
vi.mock("@/layout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

// ─── Mock ProfileTabs ─────────────────────────────────────────────────────────
vi.mock("@/components/profile-tabs", () => ({
  ProfileTabs: () => <div data-testid="profile-tabs" />,
}));

// ─── Mock supabase ────────────────────────────────────────────────────────────
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
    },
  },
}));

// ─── Mock API services ────────────────────────────────────────────────────────
vi.mock("@/core/api/campaign.service", () => ({
  listCampaigns: vi.fn().mockRejectedValue(new Error("no-conn")),
  createCampaign: vi.fn(),
  deleteCampaign: vi.fn(),
  getCampaign: vi.fn().mockResolvedValue({ id: "1", title: "Test", description: "", notes: "", dm_id: "other" }),
  updateCampaign: vi.fn(),
  listCampaignMembers: vi.fn().mockResolvedValue([]),
  removeCampaignMember: vi.fn(),
}));
vi.mock("@/core/api/chapter.service", () => ({
  listChapters: vi.fn().mockResolvedValue([]),
  createChapter: vi.fn(),
  updateChapter: vi.fn(),
  deleteChapter: vi.fn(),
}));
vi.mock("@/core/api/scene.service", () => ({
  listScenes: vi.fn().mockResolvedValue([]),
  createScene: vi.fn(),
  updateScene: vi.fn(),
  deleteScene: vi.fn(),
}));
vi.mock("@/core/api/scene-entity.service", () => ({
  listSceneEntities: vi.fn().mockResolvedValue([]),
  createSceneEntity: vi.fn(),
  deleteSceneEntity: vi.fn(),
}));
vi.mock("@/core/api/campaign-invitation.service", () => ({
  listUserInvitations: vi.fn().mockRejectedValue(new Error("no-conn")),
  acceptInvitation: vi.fn(),
  rejectInvitation: vi.fn(),
  createInvitation: vi.fn(),
}));
vi.mock("@/core/api/game-session.service", () => ({
  getCampaignSession: vi.fn().mockRejectedValue(new Error("no-conn")),
  startSession: vi.fn(),
}));
vi.mock("@/core/api/character-sheet.service", () => ({
  listCharacterSheets: vi.fn().mockRejectedValue(new Error("no-conn")),
  deleteCharacterSheet: vi.fn(),
  fetchCharacterSheet: vi.fn(),
  fetchCharacterSheetById: vi.fn(),
  createCharacterSheet: vi.fn(),
  updateCharacterSheet: vi.fn(),
  uploadCharacterAvatar: vi.fn(),
}));
vi.mock("@/core/api/battle-map.service", () => ({
  listBattleMaps: vi.fn().mockRejectedValue(new Error("no-conn")),
  deleteBattleMap: vi.fn(),
  createBattleMap: vi.fn(),
  getBattleMap: vi.fn(),
}));
vi.mock("@/core/api/backend.service", () => ({
  fetchBestiary: vi.fn().mockRejectedValue(new Error("no-conn")),
  fetchMonsterById: vi.fn().mockRejectedValue(new Error("no-conn")),
  fetchSpells: vi.fn().mockRejectedValue(new Error("no-conn")),
  fetchSpellById: vi.fn().mockRejectedValue(new Error("no-conn")),
  fetchItems: vi.fn().mockRejectedValue(new Error("no-conn")),
  fetchItemById: vi.fn().mockRejectedValue(new Error("no-conn")),
}));
vi.mock("@/core/api/forum.service", () => ({
  listThreads: vi.fn().mockRejectedValue(new Error("no-conn")),
  createThread: vi.fn(),
  getThread: vi.fn(),
  createPost: vi.fn(),
  deletePost: vi.fn(),
  deleteThread: vi.fn(),
  uploadForumImage: vi.fn(),
}));
vi.mock("@/core/api/profile.service", () => ({
  getProfile: vi.fn().mockRejectedValue(new Error("no-conn")),
  updateAvatar: vi.fn(),
  uploadAvatarFile: vi.fn(),
  updateUsername: vi.fn(),
  updateEmail: vi.fn(),
  updatePassword: vi.fn(),
}));

// ─── Mock hooks ───────────────────────────────────────────────────────────────
vi.mock("@/hooks/use-compendium-filters", () => ({
  useCompendiumFilters: () => ({
    searchTerm: "",
    setSearchTerm: vi.fn(),
    currentPage: 1,
    setCurrentPage: vi.fn(),
    itemsPerPage: 25,
    setItemsPerPage: vi.fn(),
    hasActiveFilters: false,
    clearFilters: vi.fn(),
    filterValues: [],
    toggleFilter: vi.fn(),
    isFilterActive: () => false,
  }),
}));

// ─── Mock InventoryManager ────────────────────────────────────────────────────
vi.mock("@/pods/partida/components/inventory/InventoryManager", () => ({
  InventoryManager: () => <div data-testid="inventory-manager" />,
}));

// ─── Mock react-router-dom's useNavigate ──────────────────────────────────────
// (vi.mock is auto-hoisted; we just let MemoryRouter from renderWithProviders handle routing)

// ─── Thin wrapper scenes ────────────────────────────────────────────────────

describe("HomeScene", () => {
  it("renders HomeContainer", async () => {
    const { HomeScene } = await import("../home.scene");
    renderWithProviders(<HomeScene />);
    expect(screen.getByTestId("home-container")).toBeTruthy();
  });
});

describe("LoginScene", () => {
  it("renders AppLayout with LoginContainer", async () => {
    const { LoginScene } = await import("../login.scene");
    renderWithProviders(<LoginScene />);
    expect(screen.getByTestId("app-layout")).toBeTruthy();
    expect(screen.getByTestId("login-container")).toBeTruthy();
  });
});

describe("RegisterScene", () => {
  it("renders AppLayout with RegisterContainer", async () => {
    const { RegisterScene } = await import("../register.scene");
    renderWithProviders(<RegisterScene />);
    expect(screen.getByTestId("app-layout")).toBeTruthy();
    expect(screen.getByTestId("register-container")).toBeTruthy();
  });
});

describe("PartidaScene", () => {
  it("shows loading on mount when no user", async () => {
    const { PartidaScene } = await import("../partida.scene");
    renderWithProviders(
      <Routes>
        <Route path="/partida/:id" element={<PartidaScene />} />
      </Routes>,
      { initialEntries: ["/partida/123"] }
    );
    expect(await screen.findByTestId("partida-container")).toBeTruthy();
  });
});

// ─── Profile scenes ─────────────────────────────────────────────────────────

describe("ProfileScene", () => {
  it("renders header text and loading state", async () => {
    const { ProfileScene } = await import("../profile.scene");
    renderWithProviders(<ProfileScene />);
    expect(screen.getByText("Mis Campañas")).toBeTruthy();
  });
});

describe("ProfileSettingsScene", () => {
  it("renders ProfileTabs and settings header", async () => {
    const { ProfileSettingsScene } = await import("../profile-settings.scene");
    renderWithProviders(<ProfileSettingsScene />);
    expect(screen.getByTestId("profile-tabs")).toBeTruthy();
  });
});

describe("MisCampanasScene", () => {
  it("renders ProfileTabs and header", async () => {
    const { MisCampanasScene } = await import("../mis-campanas.scene");
    renderWithProviders(<MisCampanasScene />);
    expect(screen.getByTestId("profile-tabs")).toBeTruthy();
  });
});

describe("MisFichasScene", () => {
  it("renders without user and shows guest banner", async () => {
    const { MisFichasScene } = await import("../mis-fichas.scene");
    renderWithProviders(<MisFichasScene />);
    expect(screen.getByText("Fichas de Personajes")).toBeTruthy();
  });
});

describe("MisMapasScene", () => {
  it("renders ProfileTabs and header", async () => {
    const { MisMapasScene } = await import("../mis-mapas.scene");
    renderWithProviders(<MisMapasScene />);
    expect(screen.getByTestId("profile-tabs")).toBeTruthy();
  });
});

// ─── Compendium scenes ─────────────────────────────────────────────────────

describe("BestiarioScene", () => {
  it("renders header and loading state", async () => {
    const { BestiarioScene } = await import("../bestiario.scene");
    renderWithProviders(<BestiarioScene />);
    expect(screen.getByText("Compendio del Bestiario")).toBeTruthy();
    expect(screen.getByText("Cargando bestiario...")).toBeTruthy();
  });
});

describe("BestiarioDetalleScene", () => {
  it("renders loading state on mount", async () => {
    const { BestiarioDetalleScene } = await import("../bestiario-detalle.scene");
    renderWithProviders(<BestiarioDetalleScene />, {
      initialEntries: ["/bestiario/1"],
    });
    expect(screen.getByText("Cargando criatura...")).toBeTruthy();
  });
});

describe("HechizosScene", () => {
  it("renders header and loading state", async () => {
    const { HechizosScene } = await import("../hechizos.scene");
    renderWithProviders(<HechizosScene />);
    expect(screen.getByText("Compendio de Hechizos")).toBeTruthy();
    expect(screen.getByText("Cargando hechizos...")).toBeTruthy();
  });
});

describe("HechizosDetalleScene", () => {
  it("renders loading state on mount", async () => {
    const { HechizosDetalleScene } = await import("../hechizos-detalle.scene");
    renderWithProviders(<HechizosDetalleScene />, {
      initialEntries: ["/hechizos/1"],
    });
    expect(screen.getByText("Cargando hechizo...")).toBeTruthy();
  });
});

describe("ObjetosScene", () => {
  it("renders header and loading state", async () => {
    const { ObjetosScene } = await import("../objetos.scene");
    renderWithProviders(<ObjetosScene />);
    expect(screen.getByText("Compendio de Objetos")).toBeTruthy();
    expect(screen.getByText("Cargando objetos...")).toBeTruthy();
  });
});

describe("ObjetosDetalleScene", () => {
  it("renders loading state on mount", async () => {
    const { default: ObjetosDetalleScene } = await import("../objetos-detalle.scene");
    renderWithProviders(<ObjetosDetalleScene />, {
      initialEntries: ["/objetos/1"],
    });
    expect(screen.getByText("Cargando objeto...")).toBeTruthy();
  });
});

// ─── Other scenes ──────────────────────────────────────────────────────────

describe("InventarioScene", () => {
  it("renders header", async () => {
    const { InventarioScene } = await import("../inventario.scene");
    renderWithProviders(<InventarioScene />);
    expect(screen.getAllByText("Inventario").length).toBeGreaterThanOrEqual(1);
  });
});

describe("DadosScene", () => {
  it("renders header", async () => {
    const { DadosScene } = await import("../dados.scene");
    renderWithProviders(<DadosScene />);
    expect(screen.getByText("Lanzador de Dados")).toBeTruthy();
  });
});

describe("ForoScene", () => {
  it("renders header and loading state", async () => {
    const { default: ForoScene } = await import("../foro.scene");
    renderWithProviders(<ForoScene />);
    expect(screen.getByText("Foro de la Comunidad")).toBeTruthy();
  });
});

describe("ForoHiloScene", () => {
  it("renders loading state on mount", async () => {
    const { default: ForoHiloScene } = await import("../foro-hilo.scene");
    renderWithProviders(<ForoHiloScene />, {
      initialEntries: ["/foro/1"],
    });
    expect(screen.getByTestId("foro-hilo-loader")).toBeTruthy();
  });
});

describe("GuiasScene", () => {
  it("renders header", async () => {
    const { GuiasScene } = await import("../guias.scene");
    renderWithProviders(<GuiasScene />);
    expect(screen.getByText("Guías del Aventurero")).toBeTruthy();
  });
});

describe("GuiaDetalleScene", () => {
  it("renders not found for invalid slug", async () => {
    const { GuiaDetalleScene } = await import("../guia-detalle.scene");
    renderWithProviders(<GuiaDetalleScene />, {
      initialEntries: ["/guias/nonexistent"],
    });
    expect(screen.getByText("Guía no encontrada")).toBeTruthy();
  });
});

describe("MapaBatallaScene", () => {
  it("renders the editor sidebar", async () => {
    const { MapaBatallaScene } = await import("../mapa-batalla.scene");
    renderWithProviders(<MapaBatallaScene />);
    expect(screen.getByText("Mapa de Batalla")).toBeTruthy();
  });
});

describe("AdminDashboardScene", () => {
  it("renders ProfileTabs", async () => {
    const { AdminDashboardScene } = await import("../admin-dashboard.scene");
    renderWithProviders(<AdminDashboardScene />);
    expect(screen.getByTestId("profile-tabs")).toBeTruthy();
  });
});

describe("AuthCallbackScene", () => {
  it("shows loading on mount", async () => {
    const { AuthCallbackScene } = await import("../auth-callback.scene");
    renderWithProviders(<AuthCallbackScene />);
    expect(screen.getByText("Autenticación")).toBeTruthy();
  });
});

describe("MiFichaScene", () => {
  it("renders without user and shows guest banner", async () => {
    const { MiFichaScene } = await import("../mi-ficha.scene");
    renderWithProviders(<MiFichaScene />);
    expect(screen.getByText("Ficha de Personaje")).toBeTruthy();
  });
});

describe("EditarCampanaScene", () => {
  it("renders no access when not authenticated", async () => {
    const { EditarCampanaScene } = await import("../editar-campana.scene");
    renderWithProviders(
      <Routes>
        <Route path="/editar-campana/:id" element={<EditarCampanaScene />} />
      </Routes>,
      { initialEntries: ["/editar-campana/1"] }
    );
    expect(await screen.findByText("No tienes acceso a esta campaña")).toBeTruthy();
  });
});
