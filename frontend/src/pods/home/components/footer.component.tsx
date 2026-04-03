import { Link } from "react-router-dom";
import { routes } from "@/router";

export const Footer = () => {
	return (
		<footer className="bg-stone-100 dark:bg-dark-lighter border-t border-stone-300 dark:border-dark-border py-12 px-6 transition-colors duration-300">
			<div className="container mx-auto max-w-6xl">
				<div className="grid md:grid-cols-4 gap-8 mb-8">
					{/* Brand */}
					<div className="space-y-4">
						<Link to={routes.root} className="flex items-center gap-2">
							<img src="/logo.png" alt="Beyond the Dungeon" className="w-8 h-8 object-contain" />
							<span className="text-stone-800 dark:text-amber-50 font-bold">
								Beyond the Dungeon
							</span>
						</Link>
						<p className="text-stone-600 dark:text-stone-400 text-sm">
							Las herramientas que tu mesa necesita.
						</p>
					</div>

					{/* Compendio */}
					<div>
						<h4 className="text-stone-800 dark:text-amber-50 font-semibold mb-4">
							Compendio
						</h4>
						<ul className="space-y-2 text-stone-600 dark:text-stone-400 text-sm">
							<li>
								<Link to={routes.bestiario} className="hover:text-primary transition-colors">
									Bestiario
								</Link>
							</li>
							<li>
								<Link to={routes.hechizos} className="hover:text-primary transition-colors">
									Hechizos
								</Link>
							</li>
							<li>
								<Link to={routes.objetos} className="hover:text-primary transition-colors">
									Objetos
								</Link>
							</li>
						</ul>
					</div>

					{/* Herramientas */}
					<div>
						<h4 className="text-stone-800 dark:text-amber-50 font-semibold mb-4">
							Herramientas
						</h4>
						<ul className="space-y-2 text-stone-600 dark:text-stone-400 text-sm">
							<li>
								<Link to={routes.fichas} className="hover:text-primary transition-colors">
									Fichas de Personaje
								</Link>
							</li>
							<li>
								<Link to={routes.dados} className="hover:text-primary transition-colors">
									Tirada de Dados
								</Link>
							</li>
							<li>
								<Link to={routes.mapaBatalla} className="hover:text-primary transition-colors">
									Mapa de Batalla
								</Link>
							</li>
							<li>
								<Link to={routes.inventario} className="hover:text-primary transition-colors">
									Inventario
								</Link>
							</li>
						</ul>
					</div>

					{/* Mi Cuenta */}
					<div>
						<h4 className="text-stone-800 dark:text-amber-50 font-semibold mb-4">
							Mi Cuenta
						</h4>
						<ul className="space-y-2 text-stone-600 dark:text-stone-400 text-sm">
							<li>
								<Link to={routes.profileCampanas} className="hover:text-primary transition-colors">
									Mis Campañas
								</Link>
							</li>
							<li>
								<Link to={routes.profileMapas} className="hover:text-primary transition-colors">
									Mis Mapas
								</Link>
							</li>
							<li>
								<Link to={routes.profileSettings} className="hover:text-primary transition-colors">
									Ajustes
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom */}
				<div className="border-t border-stone-300 dark:border-dark-border pt-8 flex items-center justify-center">
					<p className="text-stone-600 dark:text-stone-400 text-sm">
						© {new Date().getFullYear()} Beyond the Dungeon. Todos los derechos reservados.
					</p>
				</div>
			</div>
		</footer>
	);
};
