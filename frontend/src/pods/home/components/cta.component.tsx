import { Link } from "react-router";
import { routes } from "@/router";

export const CTA = () => {
	return (
		<section className="py-20 px-6">
			<div className="container mx-auto max-w-4xl">
				<div className="relative bg-gradient-to-r from-primary via-secondary to-accent rounded-2xl p-1 shadow-2xl">
					<div className="bg-amber-50 dark:bg-dark rounded-2xl p-12 text-center space-y-6">
						<h2 className="text-4xl font-bold text-stone-800 dark:text-amber-50">
							¿Listo para comenzar tu aventura?
						</h2>
						<p className="text-stone-600 dark:text-stone-300 text-lg max-w-2xl mx-auto">
							Únete a más de 1,000 masters que ya usan Beyond The Dungeon para
							gestionar sus campañas. Crea tu cuenta gratis y empieza hoy mismo.
						</p>
						<div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
							<Link
								to={routes.register}
								className="px-10 py-4 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white text-lg font-bold rounded-lg transition-all hover:scale-105 shadow-xl shadow-primary/30"
							>
								🎲 Crear Cuenta Gratis
							</Link>
							<a
								href="#herramientas"
								className="px-10 py-4 bg-amber-100 dark:bg-dark-card hover:bg-amber-200 dark:hover:bg-dark-lighter border-2 border-stone-300 dark:border-dark-border hover:border-primary text-stone-800 dark:text-amber-50 text-lg font-semibold rounded-lg transition-all hover:scale-105"
							>
								Ver Demo
							</a>
						</div>
						<p className="text-sm text-stone-500 dark:text-stone-400 pt-2">
							✨ Sin tarjeta de crédito · Configuración en 2 minutos
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};
