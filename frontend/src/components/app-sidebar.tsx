import * as React from "react";
import { Settings, ScrollText, Map, Scroll, Dices } from "lucide-react";
import { Link } from "react-router-dom";

import { NavMain } from "@/components/nav-main";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar-context";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// Opciones de gestión de cuenta/perfil con subtítulos y badges opcionales
const navMain = [
  {
    title: "Mis Campañas",
    url: "/mis-campanas",
    icon: Scroll,
    subtitle: "Gestiona tus aventuras y jugadores",
    isActive: true,
  },
  {
    title: "Mis Fichas",
    url: "/mis-fichas",
    icon: ScrollText,
    subtitle: "Lista de personajes creados",
  },
  {
    title: "Mis Mapas",
    url: "/mis-mapas",
    icon: Map,
    subtitle: "Mapas y escenarios de batalla",
  },
  {
    title: "Tirada de Dados",
    url: "/dados",
    icon: Dices,
    subtitle: "Lanza dados y genera tiradas",
  },
  {
    title: "Configuración",
    url: "/profile/settings",
    icon: Settings,
    subtitle: "Ajustes de cuenta y preferencias",
  },
];

function SidebarBrand() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Link
      to="/"
      className="flex items-center gap-3 hover:opacity-80 transition-opacity"
    >
      <div>
        <img
          src="/logo.png"
          alt="Beyond the Dungeon"
          className={cn(
            "object-contain transition-all duration-200",
            isCollapsed ? "h-10 w-10" : "h-16 w-16",
          )}
          loading="lazy"
        />
      </div>
      {!isCollapsed && (
        <div className="flex flex-col">
          <span className="brand-title text-lg font-semibold tracking-tight bg-gradient-to-r from-orange-200 via-amber-200 to-yellow-200 bg-clip-text text-transparent">
            Beyond the Dungeon
          </span>
        </div>
      )}
    </Link>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className={cn("custom-sidebar-bg", props.className)}
    >
      <style>{`
          .custom-sidebar-bg [data-sidebar="sidebar"] {
            background-color: #fff7ed;
            border-right: 1px solid rgba(147,74,22,0.12);
          }
          .dark .custom-sidebar-bg [data-sidebar="sidebar"] {
            background-color: #2b1608;
            box-shadow: inset 0 1px 0 rgba(255,180,90,0.03);
          }

          /* Brand title: decorative font + subtle flame flicker */
          .custom-sidebar-bg .brand-title {
            font-family: 'Cinzel Decorative', 'Uncial Antiqua', serif;
            animation: flameFlicker 2.4s ease-in-out infinite;
          }

          @keyframes flameFlicker {
            0% { text-shadow: 0 0 8px rgba(255,120,40,0.6), 0 0 16px rgba(255,80,20,0.4); }
            25% { text-shadow: 0 0 10px rgba(255,150,60,0.8), 0 0 20px rgba(255,110,30,0.6); }
            50% { text-shadow: 0 0 12px rgba(255,180,90,0.9), 0 0 24px rgba(255,140,40,0.7); }
            75% { text-shadow: 0 0 10px rgba(255,140,50,0.8), 0 0 18px rgba(255,100,30,0.6); }
            100% { text-shadow: 0 0 8px rgba(255,120,40,0.6), 0 0 16px rgba(255,80,20,0.4); }
          }
        `}</style>
      <SidebarHeader>
        <SidebarBrand />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
