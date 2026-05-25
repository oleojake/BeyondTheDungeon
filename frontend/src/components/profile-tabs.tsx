import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Swords, Map, Settings, UserCircle, Shield, Menu, X } from "lucide-react";
import { switchRoutes } from "@/router/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/core/auth/useAuth";
import { useTranslation } from "@/i18n";

export const ProfileTabs = () => {
	const { pathname } = useLocation();
	const { isAdmin } = useAuth();
	const { t } = useTranslation();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const PROFILE_TABS = [
		{ label: t.profileTabs.campaigns, to: switchRoutes.profileCampanas, icon: Swords, adminOnly: false },
		{ label: t.profileTabs.characters, to: switchRoutes.fichas, icon: UserCircle, adminOnly: false },
		{ label: t.profileTabs.maps, to: switchRoutes.profileMapas, icon: Map, adminOnly: false },
		{ label: t.profileTabs.settings, to: switchRoutes.profileSettings, icon: Settings, adminOnly: false },
		{ label: t.profileTabs.admin, to: switchRoutes.admin, icon: Shield, adminOnly: true },
	];

	const visibleTabs = PROFILE_TABS.filter((tab) => !tab.adminOnly || isAdmin);

	const activeTab = visibleTabs.find(
		({ to }) => pathname === to || pathname.startsWith(to + "/")
	);

	return (
		<>
			{/* ── Desktop nav (md+): horizontal tabs ── */}
			<nav className="hidden md:flex gap-1 border-b border-stone-200 dark:border-dark-border mb-6">
				{visibleTabs.map(({ label, to, icon: Icon, adminOnly }) => {
					const active = pathname === to;
					return (
						<Link
							key={to}
							to={to}
							className={cn(
								"flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
								active
									? adminOnly
										? "border-purple-500 text-purple-500"
										: "border-amber-500 text-amber-500"
									: "border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:border-stone-300 dark:hover:border-stone-600"
							)}
						>
							<Icon className="w-4 h-4" />
							{label}
						</Link>
					);
				})}
			</nav>

			{/* ── Mobile nav (<md): hamburger menu ── */}
			<div className="md:hidden mb-6">
				{/* Trigger bar */}
				<button
					onClick={() => setMobileMenuOpen((prev) => !prev)}
					className={cn(
						"flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-colors",
						"bg-stone-900/60 border-stone-700 text-amber-200 hover:border-amber-600/60 hover:text-amber-100",
						mobileMenuOpen && "border-amber-600/60 rounded-b-none"
					)}
					aria-expanded={mobileMenuOpen}
					aria-label="Abrir menú de navegación"
				>
					<span className="flex items-center gap-2 text-sm font-medium">
						{activeTab ? (
							<>
								<activeTab.icon className="w-4 h-4" />
								{activeTab.label}
							</>
						) : (
							<span>Navegación</span>
						)}
					</span>
					{mobileMenuOpen ? (
						<X className="w-5 h-5 shrink-0" />
					) : (
						<Menu className="w-5 h-5 shrink-0" />
					)}
				</button>

				{/* Dropdown items */}
				{mobileMenuOpen && (
					<nav className="flex flex-col border border-t-0 border-stone-700 rounded-b-xl overflow-hidden bg-stone-900/80 backdrop-blur-sm">
						{visibleTabs.map(({ label, to, icon: Icon, adminOnly }) => {
							const active = pathname === to;
							return (
								<Link
									key={to}
									to={to}
									onClick={() => setMobileMenuOpen(false)}
									className={cn(
										"flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-4",
										active
											? adminOnly
												? "border-purple-500 text-purple-400 bg-purple-900/20"
												: "border-amber-500 text-amber-400 bg-amber-900/20"
											: "border-transparent text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 hover:border-stone-500"
									)}
								>
									<Icon className="w-4 h-4 shrink-0" />
									{label}
								</Link>
							);
						})}
					</nav>
				)}
			</div>
		</>
	);
};
