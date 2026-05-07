import { Link } from "react-router-dom";
import { routes } from "@/router";
import { useTranslation } from "@/i18n";

export const Footer = () => {
	const { t } = useTranslation();
	const fl = t.footer.links;

	return (
		<footer className="bg-stone-100 dark:bg-dark-lighter border-t border-stone-300 dark:border-dark-border py-12 px-6 transition-colors duration-300">
			<div className="container mx-auto max-w-6xl">
				<div className="grid md:grid-cols-5 gap-8 mb-8">
					{/* Brand */}
					<div className="space-y-4">
						<Link to={routes.root} className="flex items-center gap-2">
							<img src="/logo.png" alt="Beyond the Dungeon" className="w-8 h-8 object-contain" />
							<span className="text-stone-800 dark:text-amber-50 font-bold">
								Beyond the Dungeon
							</span>
						</Link>
						<p className="text-stone-600 dark:text-stone-400 text-sm">
							{t.footer.tagline}
						</p>
					</div>

					{/* Compendio */}
					<div>
						<h4 className="text-stone-800 dark:text-amber-50 font-semibold mb-4">
							{t.footer.compendium}
						</h4>
						<ul className="space-y-2 text-stone-600 dark:text-stone-400 text-sm">
							<li>
								<Link to={routes.bestiario} className="hover:text-primary transition-colors">
									{fl.bestiary}
								</Link>
							</li>
							<li>
								<Link to={routes.hechizos} className="hover:text-primary transition-colors">
									{fl.spells}
								</Link>
							</li>
							<li>
								<Link to={routes.objetos} className="hover:text-primary transition-colors">
									{fl.items}
								</Link>
							</li>
						</ul>
					</div>

					{/* Herramientas */}
					<div>
						<h4 className="text-stone-800 dark:text-amber-50 font-semibold mb-4">
							{t.footer.tools}
						</h4>
						<ul className="space-y-2 text-stone-600 dark:text-stone-400 text-sm">
							<li>
								<Link to={routes.fichas} className="hover:text-primary transition-colors">
									{fl.characters}
								</Link>
							</li>
							<li>
								<Link to={routes.dados} className="hover:text-primary transition-colors">
									{fl.dice}
								</Link>
							</li>
							<li>
								<Link to={routes.mapaBatalla} className="hover:text-primary transition-colors">
									{fl.battleMap}
								</Link>
							</li>
							<li>
								<Link to={routes.inventario} className="hover:text-primary transition-colors">
									{fl.inventory}
								</Link>
							</li>
						</ul>
					</div>

					{/* Mi Cuenta */}
					<div>
						<h4 className="text-stone-800 dark:text-amber-50 font-semibold mb-4">
							{t.footer.myAccount}
						</h4>
						<ul className="space-y-2 text-stone-600 dark:text-stone-400 text-sm">
							<li>
								<Link to={routes.profileCampanas} className="hover:text-primary transition-colors">
									{fl.campaigns}
								</Link>
							</li>
							<li>
								<Link to={routes.profileMapas} className="hover:text-primary transition-colors">
									{fl.maps}
								</Link>
							</li>
							<li>
								<Link to={routes.profileSettings} className="hover:text-primary transition-colors">
									{fl.settings}
								</Link>
							</li>
						</ul>
					</div>

					{/* Recursos / Guías */}
					<div>
						<h4 className="text-stone-800 dark:text-amber-50 font-semibold mb-4">
							{t.footer.resources}
						</h4>
						<ul className="space-y-2 text-stone-600 dark:text-stone-400 text-sm">
							<li>
								<Link to="/guias" className="hover:text-primary transition-colors">
									{fl.adventurerGuides}
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom */}
				<div className="border-t border-stone-300 dark:border-dark-border pt-8 flex items-center justify-center">
					<p className="text-stone-600 dark:text-stone-400 text-sm">
						© {new Date().getFullYear()} Beyond the Dungeon. {t.footer.rights}
					</p>
				</div>
			</div>
		</footer>
	);
};
