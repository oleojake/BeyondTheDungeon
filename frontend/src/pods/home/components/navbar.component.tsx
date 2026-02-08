import { Link } from "react-router";
import { routes } from "@/router";
import { useAuth } from "@/core/auth/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";

export const Navbar = () => {
	const { user, loading, logout } = useAuth();

	return (
		<nav className="fixed top-0 w-full bg-amber-50/95 dark:bg-dark/95 backdrop-blur-md border-b border-stone-300 dark:border-dark-border z-50 transition-colors duration-300">
			<div className="container mx-auto px-6 py-4">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<Link to={routes.root} className="flex items-center gap-2">
						<div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-md">
							<span className="text-white font-bold text-xl">
								<img src="/logo.png" alt="" />
							</span>
						</div>
						<span className="text-stone-800 dark:text-amber-50 font-bold text-xl">
							Beyond the Dungeon
						</span>
					</Link>

					{/* Desktop Menu */}
					<div className="hidden md:flex items-center gap-8">
						<a
							href="#herramientas"
							className="text-stone-700 dark:text-stone-300 hover:text-primary dark:hover:text-accent transition-colors font-medium"
						>
							Herramientas
						</a>
						<Link
							to={routes.bestiario}
							className="text-stone-700 dark:text-stone-300 hover:text-primary dark:hover:text-accent transition-colors font-medium"
						>
							Bestiario
						</Link>
						<Link
							to={routes.hechizos}
							className="text-stone-700 dark:text-stone-300 hover:text-primary dark:hover:text-accent transition-colors font-medium"
						>
							Hechizos
						</Link>
						<Link
							to={routes.dados}
							className="text-stone-700 dark:text-stone-300 hover:text-primary dark:hover:text-accent transition-colors font-medium"
						>
							Dados
						</Link>
					</div>

					{/* Auth Buttons */}
					<div className="flex items-center gap-3">
						<ThemeToggle />
						{/* mientras carga la sesión, evita parpadeos */}
						{loading ? null : user ? (
							<>
								<Link
									to={routes.profile}
									className="px-4 py-2 text-stone-800 dark:text-amber-50 hover:text-primary transition-colors font-medium"
								>
									Mi Perfil
								</Link>

								<button
									onClick={() => logout()}
									className="px-6 py-2 bg-amber-100 dark:bg-dark-card border border-stone-300 dark:border-dark-border text-stone-800 dark:text-amber-50 font-semibold rounded-lg hover:border-primary transition-all"
								>
									Salir
								</button>
							</>
						) : (
							<>
								<Link
									to={routes.login}
									className="hidden md:block px-4 py-2 text-stone-800 dark:text-amber-50 hover:text-primary transition-colors font-medium"
								>
									Iniciar Sesión
								</Link>
								<Link
									to={routes.register}
									className="px-6 py-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-md hover:shadow-lg"
								>
									Crear Cuenta
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};
