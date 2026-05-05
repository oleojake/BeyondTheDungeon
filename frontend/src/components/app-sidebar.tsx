import * as React from "react";
import { Settings, ScrollText, Map, Scroll, Dices, Home, Package } from "lucide-react";
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
import { useTranslation } from "@/i18n";

function SidebarBrand() {
	const { state } = useSidebar();
	const isCollapsed = state === "collapsed";

	return (
		<Link
			to="/"
			className="brand-link flex items-center gap-3 hover:opacity-90 transition-opacity group"
		>
			<div>
				<img
					src="/logo.png"
					alt="Beyond the Dungeon"
					className={cn(
						"object-contain transition-all duration-200 brand-logo",
						isCollapsed ? "size-16" : "size-16",
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
	const { t } = useTranslation();

	// Opciones de gestión de cuenta/perfil con subtítulos
	const navMain = [
		{
			title: t.sidebar.home.title,
			url: "/",
			icon: Home,
			subtitle: t.sidebar.home.subtitle,
		},
		{
			title: t.sidebar.campaigns.title,
			url: "/mis-campanas",
			icon: Scroll,
			subtitle: t.sidebar.campaigns.subtitle,
			isActive: true,
		},
		{
			title: t.sidebar.inventory.title,
			url: "/inventario",
			icon: Package,
			subtitle: t.sidebar.inventory.subtitle,
		},
		{
			title: t.sidebar.characters.title,
			url: "/mis-fichas",
			icon: ScrollText,
			subtitle: t.sidebar.characters.subtitle,
		},
		{
			title: t.sidebar.maps.title,
			url: "/mis-mapas",
			icon: Map,
			subtitle: t.sidebar.maps.subtitle,
		},
		{
			title: t.sidebar.dice.title,
			url: "/dados",
			icon: Dices,
			subtitle: t.sidebar.dice.subtitle,
		},
		{
			title: t.sidebar.settings.title,
			url: "/profile/settings",
			icon: Settings,
			subtitle: t.sidebar.settings.subtitle,
		},
	];

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
            border-right: 1px solid rgba(255,180,90,0.08);
          }

          /* Brand title: decorative font + intensified flame flicker */
          .custom-sidebar-bg .brand-title {
            font-family: 'Cinzel Decorative', 'Uncial Antiqua', serif;
            animation: flameFlicker 2.2s ease-in-out infinite;
            color: transparent;
            -webkit-background-clip: text;
            background-clip: text;
            background-image: linear-gradient(90deg, rgba(255,200,120,1), rgba(255,150,50,1));
            text-shadow: 0 0 10px rgba(255,150,60,0.85);
          }

          @keyframes flameFlicker {
            0% { text-shadow: 0 0 10px rgba(255,120,40,0.6), 0 0 22px rgba(255,90,30,0.35); transform: translateY(0); }
            30% { text-shadow: 0 0 18px rgba(255,170,70,0.95), 0 0 36px rgba(255,120,50,0.6); transform: translateY(-1px); }
            60% { text-shadow: 0 0 22px rgba(255,200,90,1), 0 0 44px rgba(255,150,60,0.75); transform: translateY(0); }
            100% { text-shadow: 0 0 10px rgba(255,120,40,0.6), 0 0 22px rgba(255,90,30,0.35); transform: translateY(0); }
          }

          /* Brand enhancements: logo frame */
          .brand-link { display: flex; align-items:center; gap:0.75rem; }

          .brand-logo-wrap {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.28rem;
            border-radius: 9999px;
            background: linear-gradient(135deg, rgba(255,247,237,0.98), rgba(255,244,230,0.92));
            box-shadow: 0 8px 24px rgba(43,22,8,0.10);
            transition: transform .28s ease, box-shadow .28s ease;
            position: relative;
            overflow: hidden;
          }

          /* halo pulse */
          @keyframes haloPulse {
            0% { transform: scale(0.98); opacity: 0.9; }
            50% { transform: scale(1.03); opacity: 1; }
            100% { transform: scale(0.98); opacity: 0.9; }
          }

          .brand-link.group:hover .brand-logo-wrap {
            transform: translateY(-6px) rotate(-6deg) scale(1.06);
            box-shadow: 0 28px 64px rgba(43,22,8,0.16);
          }

          /* removed halo ::before for a cleaner appearance */

          /* run small continuous animations to draw attention */
          .brand-logo-wrap { animation: haloPulse 4.5s ease-in-out infinite; }


          .brand-link.group:hover .brand-title::after { transform: translateX(0%); }

          /* subtle float for title */
          .brand-link.group:hover .brand-title { animation: floatUp .9s ease-in-out; }
          @keyframes floatUp { 0% { transform: translateY(0) } 50% { transform: translateY(-3px) } 100% { transform: translateY(0) } }
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
