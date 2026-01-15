import { Link } from "react-router";
import { routes } from "@/router";

export const Hero = () => {
	return (
		<section className="relative pt-32 pb-20 px-6 overflow-hidden">
			{/* Background Pattern */}
			<div className="absolute inset-0 opacity-10">
				<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM4QjVDRjYiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] bg-repeat"></div>
			</div>

			<div className="container mx-auto max-w-5xl relative z-10">
				<div className="text-center space-y-8">
					{/* Badge */}
					<div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 border border-primary/30 rounded-full">
						<span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
						<span className="text-primary-light text-sm font-medium">
							¿DESPLEGADO?
						</span>
					</div>

					{/* Main Heading */}
					<h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
						Organiza y juega rol
						<br />
						<span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
							sin complicaciones
						</span>
					</h1>

					{/* Subtitle */}
					<p className="text-xl text-gray-400 max-w-2xl mx-auto">
						Campañas, fichas, dados, mapas simples y comunidad. Todo en un solo
						lugar.
					</p>

					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
						<Link
							to={routes.register}
							className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-lg shadow-primary/50 transition-all hover:scale-105 hover:shadow-primary/70"
						>
							Crear Cuenta Gratis
						</Link>
						<a
							href="#herramientas"
							className="px-8 py-4 bg-dark-card hover:bg-dark-lighter border border-dark-border text-white font-semibold rounded-lg transition-all hover:scale-105"
						>
							Explorar Herramientas
						</a>
					</div>

					{/* Social Proof */}
					<div className="flex items-center justify-center gap-8 pt-8 text-sm text-gray-500">
						<div className="flex items-center gap-2">
							<span className="text-2xl">🎲</span>
							<span>+1,000 Masters</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-2xl">⚔️</span>
							<span>+5,000 Personajes</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-2xl">📖</span>
							<span>+500 Campañas</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};
