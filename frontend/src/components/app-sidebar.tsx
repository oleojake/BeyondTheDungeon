import * as React from "react";
import { Settings, User, ScrollText } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar-context";
import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";

// Opciones de gestión de cuenta/perfil
const navMain = [
	{ title: "Mis Campañas", url: "/profile", icon: User },
	{ title: "Mis Fichas", url: "/mis-fichas", icon: ScrollText },
	{ title: "Configuración", url: "/profile/settings", icon: Settings },
];

function SidebarBrand() {
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

	return (
		<div className="flex items-center gap-3">
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
					<span
						className="text-lg font-semibold tracking-tight bg-gradient-to-r from-orange-200 via-amber-200 to-yellow-200 bg-clip-text text-transparent"
						style={{ animation: "flameFlicker 2.4s ease-in-out infinite" }}
					>
						Beyond the Dungeon
					</span>
				</div>
			)}
		</div>
	);
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar
			collapsible="icon"
			{...props}
			className={cn("custom-sidebar-bg", props.className)}
		>
			<style>
				{`
          .custom-sidebar-bg [data-sidebar="sidebar"] {
            background-color: #f9fafb;
          }
          .dark .custom-sidebar-bg [data-sidebar="sidebar"] {
            background-color: #0d0813;
          }
          @keyframes flameFlicker {
            0% { text-shadow: 0 0 8px rgba(255,120,40,0.6), 0 0 16px rgba(255,80,20,0.4); }
            25% { text-shadow: 0 0 10px rgba(255,150,60,0.8), 0 0 20px rgba(255,110,30,0.6); }
            50% { text-shadow: 0 0 12px rgba(255,180,90,0.9), 0 0 24px rgba(255,140,40,0.7); }
            75% { text-shadow: 0 0 10px rgba(255,140,50,0.8), 0 0 18px rgba(255,100,30,0.6); }
            100% { text-shadow: 0 0 8px rgba(255,120,40,0.6), 0 0 16px rgba(255,80,20,0.4); }
          }
        `}
			</style>
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
