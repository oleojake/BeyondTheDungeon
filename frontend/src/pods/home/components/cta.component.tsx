import { Link } from "react-router";
import { routes } from "@/router";

export const CTA = () => {
	return (
		<section className="py-20 px-6">
			<div className="container mx-auto max-w-4xl">
				<div className="relative bg-gradient-to-r from-primary via-accent to-secondary rounded-2xl p-1">
					<div className="bg-dark rounded-2xl p-12 text-center space-y-6">
						<h2 className="text-4xl font-bold text-white">
							¿Listo para comenzar tu aventura?
						</h2>
						<p className="text-gray-400 text-lg max-w-2xl mx-auto">
							Únete a más de 1,000 masters que ya usan Beyond The Dungeon para
							gestionar sus campañas. Crea tu cuenta gratis y empieza hoy mismo.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
							<Link
								to={routes.register}
								className="px-10 py-4 bg-primary hover:bg-primary-dark text-white text-lg font-bold rounded-lg transition-all hover:scale-105 shadow-xl shadow-primary/30"
							>
								🎲 Crear Cuenta Gratis
							</Link>
							<a
								href="#herramientas"
								className="px-10 py-4 bg-dark-card hover:bg-dark-lighter border-2 border-dark-border hover:border-primary/50 text-white text-lg font-semibold rounded-lg transition-all hover:scale-105"
							>
								Ver Demo
							</a>
						</div>
						<p className="text-sm text-gray-500 pt-2">
							✨ Sin tarjeta de crédito · Configuración en 2 minutos
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};
