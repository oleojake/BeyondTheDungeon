import { type PropsWithChildren, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppSidebar } from "@/components/app-sidebar";
import { NavUser } from "@/components/nav-user";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useAuth } from "@/core/auth/useAuth";

const useRouteLabels = () => {
  const { t } = useTranslation();

  return [
    { prefix: "/mis-campanas",     label: t('routes.myCampaigns') },
    { prefix: "/inventario",       label: t('routes.inventory') },
    { prefix: "/mis-fichas",       label: t('routes.myCharacterSheets') },
    { prefix: "/mi-ficha",         label: t('routes.myCharacterSheet') },
    { prefix: "/mis-mapas",        label: t('routes.myMaps') },
    { prefix: "/mapa-batalla",     label: t('routes.battleMap') },
    { prefix: "/dados",            label: t('routes.diceRoller') },
    { prefix: "/profile/settings", label: t('routes.settings') },
    { prefix: "/editar-campana",   label: t('routes.editCampaign') },
    { prefix: "/partida",          label: t('routes.session') },
  ];
};

export const ProfileLayout = ({ children }: PropsWithChildren) => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const ROUTE_LABELS = useRouteLabels();

  // Dashboard siempre en dark mode (colores fijos de dungeon)
  useEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains("dark");
    html.classList.add("dark");
    return () => {
      if (!wasDark) html.classList.remove("dark");
    };
  }, []);

  const displayName = user?.email ? user.email.split("@")[0] : t('common.guest');

  const currentLabel =
    ROUTE_LABELS.find(
      (r) => pathname === r.prefix || pathname.startsWith(r.prefix + "/")
    )?.label ?? t("routes.dashboard");

  return (
    <div
      className="min-h-screen bg-[#1a0e06] text-amber-100 transition-colors duration-300"
      style={{ fontFamily: "'Cinzel Decorative', 'Uncial Antiqua', serif" }}
    >
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-[#1a0e06]">
          <header className="flex items-center justify-between px-6 py-4 border-b border-amber-900/30 bg-[#2b1608] transition-colors duration-300">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="-ml-1 text-amber-300 hover:text-amber-100" />
              <Breadcrumb>
                <BreadcrumbList className="text-sm text-amber-400">
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      asChild
                      className="hover:text-amber-200 transition-colors"
                    >
                      <Link to="/">{t("nav.home")}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="text-amber-700" />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="text-amber-200 font-semibold">
                      {currentLabel}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <NavUser
              fallbackUser={{
                name: displayName,
                email: user?.email || "",
                avatar: "",
              }}
            />
          </header>

          <main className="px-6 py-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
};
