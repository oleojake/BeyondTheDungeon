import { Link, useLocation } from "react-router-dom";
import { Swords, Map, Settings, UserCircle } from "lucide-react";
import { switchRoutes } from "@/router/routes";
import { cn } from "@/lib/utils";

const PROFILE_TABS = [
	{ label: "Campañas", to: switchRoutes.profileCampanas, icon: Swords },
	{ label: "Fichas", to: switchRoutes.fichas, icon: UserCircle },
	{ label: "Mapas", to: switchRoutes.profileMapas, icon: Map },
	{ label: "Ajustes", to: switchRoutes.profileSettings, icon: Settings },
];

export const ProfileTabs = () => {
	const { pathname } = useLocation();

	return (
		<nav className="flex gap-1 border-b border-stone-200 dark:border-dark-border mb-6">
			{PROFILE_TABS.map(({ label, to, icon: Icon }) => {
				const active = pathname === to;
				return (
					<Link
						key={to}
						to={to}
						className={cn(
							"flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
							active
								? "border-amber-500 text-amber-500"
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
