import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronDown, Menu, X } from "lucide-react";
import { routes } from "@/router";
import { useAuth } from "@/core/auth/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslation } from "@/i18n";

function NavDropdown({
	label,
	links,
	onClose,
}: {
	label: string;
	links: { label: string; to: string; desc: string }[];
	onClose?: () => void;
}) {
	return (
		<div className="relative group">
			<button className="flex items-center gap-1 text-stone-700 dark:text-stone-300 hover:text-primary dark:hover:text-accent transition-colors font-medium py-1">
				{label}
				<ChevronDown className="w-3.5 h-3.5 opacity-60 transition-transform duration-200 group-hover:rotate-180" />
			</button>
			{/* pt-2 buffer so the dropdown doesn't vanish on mouse movement */}
			<div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-52 z-50">
				<div className="hidden group-hover:block border border-stone-200 dark:border-dark-border rounded-xl bg-amber-50/98 dark:bg-dark-card backdrop-blur-md shadow-xl overflow-hidden">
					{links.map(({ label, to, desc }) => (
						<Link
							key={to}
							to={to}
							onClick={onClose}
							className="flex flex-col px-4 py-2.5 hover:bg-amber-100/80 dark:hover:bg-amber-900/20 transition-colors border-b border-stone-100 dark:border-dark-border last:border-0"
						>
							<span className="text-sm font-medium text-stone-800 dark:text-amber-100">{label}</span>
							<span className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{desc}</span>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}

export const Navbar = () => {
	const { user, loading, logout } = useAuth();
	const navigate = useNavigate();
	const [mobileOpen, setMobileOpen] = useState(false);
	const { t } = useTranslation();

	const COMPENDIO_LINKS = [
		{ label: t.nav.compendiumLinks.bestiary.label, to: routes.bestiario, desc: t.nav.compendiumLinks.bestiary.desc },
		{ label: t.nav.compendiumLinks.spells.label, to: routes.hechizos, desc: t.nav.compendiumLinks.spells.desc },
		{ label: t.nav.compendiumLinks.items.label, to: routes.objetos, desc: t.nav.compendiumLinks.items.desc },
	];

	const HERRAMIENTAS_LINKS = [
		{ label: t.nav.toolLinks.characters.label, to: routes.fichas, desc: t.nav.toolLinks.characters.desc },
		{ label: t.nav.toolLinks.dice.label, to: routes.dados, desc: t.nav.toolLinks.dice.desc },
		{ label: t.nav.toolLinks.battleMap.label, to: routes.mapaBatalla, desc: t.nav.toolLinks.battleMap.desc },
		{ label: t.nav.toolLinks.inventory.label, to: routes.inventario, desc: t.nav.toolLinks.inventory.desc },
	];

	const handleLogout = () => {
		logout();
		navigate("/");
		setMobileOpen(false);
	};

	return (
		<nav className="fixed top-0 w-full bg-amber-50/95 dark:bg-dark/95 backdrop-blur-md border-b border-stone-300 dark:border-dark-border z-50 transition-colors duration-300">
			<div className="container mx-auto px-6 py-4">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<Link
						to={routes.root}
						onClick={() => setMobileOpen(false)}
						className="flex items-center gap-2 shrink-0"
					>
						<img src="/logo.png" alt="Beyond the Dungeon" className="w-8 h-8 object-contain" />
						<span className="text-stone-800 dark:text-amber-50 font-bold text-xl hidden sm:block">
							Beyond the Dungeon
						</span>
					</Link>

					{/* Desktop nav — grouped dropdowns */}
					<div className="hidden md:flex items-center gap-7">
						<NavDropdown label={t.nav.compendium} links={COMPENDIO_LINKS} />
						<NavDropdown label={t.nav.tools} links={HERRAMIENTAS_LINKS} />
						<Link
							to="/guias"
							className="text-stone-700 dark:text-stone-300 hover:text-primary dark:hover:text-accent transition-colors font-medium text-sm py-1"
						>
							{t.nav.guides}
						</Link>
						<Link
							to={routes.foro}
							className="text-stone-700 dark:text-stone-300 hover:text-primary dark:hover:text-accent transition-colors font-medium text-sm py-1"
						>
							{t.nav.forum}
						</Link>
					</div>

				{/* Right side */}
				<div className="flex items-center gap-2">
					<LanguageSwitcher />
					<ThemeToggle />
					{loading ? null : user ? (						<>								<Link
									to={routes.profileCampanas}
									className="hidden md:block px-4 py-2 text-stone-800 dark:text-amber-50 hover:text-primary dark:hover:text-amber-300 transition-colors font-medium text-sm"
								>
									{t.nav.myPanel}
								</Link>
								<button
									onClick={handleLogout}
									className="hidden md:block px-4 py-2 bg-amber-100 dark:bg-dark-card border border-stone-300 dark:border-dark-border text-stone-800 dark:text-amber-50 font-semibold rounded-lg hover:border-primary transition-all text-sm"
								>
									{t.nav.logout}
								</button>
							</>
						) : (
							<>
								<Link
									to={routes.login}
									className="hidden md:block px-4 py-2 text-stone-800 dark:text-amber-50 hover:text-primary transition-colors font-medium text-sm"
								>
									{t.nav.login}
								</Link>
								<Link
									to={routes.register}
									className="hidden md:block px-5 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-md hover:shadow-lg text-sm"
								>
									{t.nav.createAccount}
								</Link>
							</>
						)}

						{/* Mobile hamburger */}
						<button
							className="md:hidden p-2 rounded-lg hover:bg-stone-200 dark:hover:bg-dark-card transition-colors"
							onClick={() => setMobileOpen((o) => !o)}
							aria-label={mobileOpen ? t.nav.closeMenu : t.nav.openMenu}
						>
							{mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			{mobileOpen && (
				<div className="md:hidden border-t border-stone-200 dark:border-dark-border bg-amber-50/98 dark:bg-dark/98 px-6 py-4 flex flex-col gap-1">
					<p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">
						{t.nav.compendium}
					</p>
					{COMPENDIO_LINKS.map(({ label, to }) => (
						<Link
							key={to}
							to={to}
							onClick={() => setMobileOpen(false)}
							className="pl-2 py-2 text-stone-700 dark:text-stone-300 hover:text-primary transition-colors font-medium text-sm"
						>
							{label}
						</Link>
					))}

					<p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mt-3 mb-1">
						{t.nav.tools}
					</p>
					{HERRAMIENTAS_LINKS.map(({ label, to }) => (
						<Link
							key={to}
							to={to}
							onClick={() => setMobileOpen(false)}
							className="pl-2 py-2 text-stone-700 dark:text-stone-300 hover:text-primary transition-colors font-medium text-sm"
						>
							{label}
						</Link>
					))}

					<p className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mt-3 mb-1">
						{t.nav.others}
					</p>
					<Link
						to="/guias"
						onClick={() => setMobileOpen(false)}
						className="pl-2 py-2 text-stone-700 dark:text-stone-300 hover:text-primary transition-colors font-medium text-sm"
					>
						{t.nav.guides}
					</Link>
					<Link
						to={routes.foro}
						onClick={() => setMobileOpen(false)}
						className="pl-2 py-2 text-stone-700 dark:text-stone-300 hover:text-primary transition-colors font-medium text-sm"
					>
						{t.nav.forum}
					</Link>

					<div className="border-t border-stone-200 dark:border-dark-border mt-3 pt-3 flex flex-col gap-2">
						{user ? (
							<>
								<Link
									to={routes.profileCampanas}
									onClick={() => setMobileOpen(false)}
									className="pl-2 py-2 text-stone-700 dark:text-stone-300 hover:text-primary transition-colors font-medium text-sm"
								>
									{t.nav.myPanel}
								</Link>
								<button
									onClick={handleLogout}
									className="text-left pl-2 py-2 text-stone-700 dark:text-stone-300 hover:text-primary transition-colors font-medium text-sm"
								>
									{t.nav.logout}
								</button>
							</>
						) : (
							<>
								<Link
									to={routes.login}
									onClick={() => setMobileOpen(false)}
									className="pl-2 py-2 text-stone-700 dark:text-stone-300 font-medium text-sm"
								>
									{t.nav.login}
								</Link>
								<Link
									to={routes.register}
									onClick={() => setMobileOpen(false)}
									className="py-2 px-4 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-lg text-center text-sm"
								>
									{t.nav.createAccount}
								</Link>
							</>
						)}
						{/* Language switcher in mobile menu */}
						<div className="pl-2 pt-2">
							<LanguageSwitcher />
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};
