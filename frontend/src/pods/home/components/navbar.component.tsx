import { Link } from "react-router";
import { routes } from "@/router";

export const Navbar = () => {
	return (
		<nav className="fixed top-0 w-full bg-dark/80 backdrop-blur-md border-b border-dark-border z-50">
			<div className="container mx-auto px-6 py-4">
				<div className="flex items-center justify-between">
					{/* Logo */}
					<Link to={routes.root} className="flex items-center gap-2">
						<div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
							<span className="text-white font-bold text-xl">🎲</span>
						</div>
						<span className="text-white font-bold text-xl">
							Beyond the Dungeon
						</span>
					</Link>

					{/* Desktop Menu */}
					<div className="hidden md:flex items-center gap-8">
						<a
							href="#herramientas"
							className="text-gray-300 hover:text-white transition-colors"
						>
							Herramientas
						</a>
						<a
							href="#campanas"
							className="text-gray-300 hover:text-white transition-colors"
						>
							Campañas
						</a>
						<a
							href="#comunidad"
							className="text-gray-300 hover:text-white transition-colors"
						>
							Comunidad
						</a>
					</div>

					{/* Auth Buttons */}
					<div className="flex items-center gap-3">
						<Link
							to={routes.login}
							className="hidden md:block px-4 py-2 text-white hover:text-primary transition-colors"
						>
							Iniciar Sesión
						</Link>
						<Link
							to={routes.register}
							className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all hover:scale-105"
						>
							Crear Cuenta
						</Link>
					</div>
				</div>
			</div>
		</nav>
	);
};
