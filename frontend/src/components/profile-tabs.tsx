import { Link, useLocation } from "react-router-dom";
import { Swords, Map, Settings, UserCircle, Shield } from "lucide-react";
import { switchRoutes } from "@/router/routes";
import { cn } from "@/lib/utils";
import { useAuth } from "@/core/auth/useAuth";

const PROFILE_TABS = [
	{ label: "Campañas", to: switchRoutes.profileCampanas, icon: Swords, adminOnly: false },
	{ label: "Fichas", to: switchRoutes.fichas, icon: UserCircle, adminOnly: false },
	{ label: "Mapas", to: switchRoutes.profileMapas, icon: Map, adminOnly: false },
	{ label: "Ajustes", to: switchRoutes.profileSettings, icon: Settings, adminOnly: false },
	{ label: "Admin", to: switchRoutes.admin, icon: Shield, adminOnly: true },
];

export const ProfileTabs = () => {
	const { pathname } = useLocation();
	const { isAdmin } = useAuth();

	const visibleTabs = PROFILE_TABS.filter((t) => !t.adminOnly || isAdmin);

	return (
		<nav className="flex gap-1 border-b border-stone-200 dark:border-dark-border mb-6">
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
	);
};

