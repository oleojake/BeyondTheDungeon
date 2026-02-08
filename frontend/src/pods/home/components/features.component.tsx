import { Link } from "react-router-dom";

const FEATURES = [
	{
		icon: "/campaigns.png", // Cambia al nombre de tu imagen
		title: "Gestión de Campañas",
		description: "Crea y administra tus aventuras con facilidad.",
		color: "from-primary to-primary-dark",
		url: "/profile",
	},
	{
		icon: "/characters.png",
		title: "Fichas de Personaje",
		description: "Fichas digitales activas para tus héroes.",
		color: "from-secondary to-secondary-dark",
		url: "/mi-ficha",
	},
	{
		icon: "/dice.png",
		title: "Dados Virtuales",
		description: "Tira dados en todas las formas y tamaños.",
		color: "from-accent to-accent-dark",
		url: "/dados",
	},
	{
		icon: "/maps.png",
		title: "Mapas de Batalla",
		description: "Visualiza combates con mapas simples y claros.",
		color: "from-primary to-accent",
		url: "/profile",
	},
	{
		icon: "/creatures.png",
		title: "Consulta de Bestiario",
		description: "Accede a estadísticas de criaturas al instante.",
		color: "from-secondary to-primary",
		url: "/bestiario",
	},
	{
		icon: "/magic.png",
		title: "Hechizos y Reglas",
		description: "Consulta hechizos y reglas rápidamente.",
		color: "from-accent to-secondary",
		url: "/hechizos",
	},
];

export const Features = () => {
	return (
		<section
			id="herramientas"
			className="py-20 px-6 bg-stone-50 dark:bg-dark-lighter/50 transition-colors duration-300"
		>
			<div className="container mx-auto max-w-6xl">
				<div className="text-center mb-16 space-y-4">
					<h1 className="text-5xl md:text-6xl font-bold text-stone-800 dark:text-amber-50">
						Organiza y juega rol
						<br />
						<span className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 dark:from-amber-300 dark:via-yellow-200 dark:to-amber-300 bg-clip-text text-transparent">
							sin complicaciones
						</span>
					</h1>
					<p className="text-xl text-stone-700 dark:text-stone-300 max-w-2xl mx-auto">
						Campañas, fichas, dados, mapas simples y comunidad. Todo en un solo
						lugar.
					</p>
					<h2 className="text-3xl font-bold text-stone-800 dark:text-amber-50 pt-8">
						Todas tus herramientas en un solo lugar
					</h2>
					<p className="text-stone-600 dark:text-stone-300 text-lg">
						Gestiona tus partidas de forma profesional y sencilla
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{FEATURES.map((feature, index) => (
						<Link
							key={index}
							to={feature.url}
							className="group relative bg-amber-50 dark:bg-dark-card border border-stone-300 dark:border-dark-border rounded-xl overflow-hidden hover:border-primary hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 hover:scale-[1.02] block"
						>
							{/* Image container with gradient background */}
							<div
								className={`relative w-full h-64 bg-gradient-to-br ${feature.color} overflow-hidden`}
							>
								<img
									src={feature.icon}
									alt={feature.title}
									className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
								/>
							</div>

							{/* Content */}
							<div className="p-6">
								<h3 className="text-xl font-bold text-stone-800 dark:text-amber-50 mb-3">
									{feature.title}
								</h3>
								<p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed">
									{feature.description}
								</p>
							</div>
						</Link>
					))}
				</div>

				{/* View All Button */}
				<div className="text-center mt-12">
					<button className="px-8 py-3 bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold rounded-lg transition-all hover:scale-105">
						Ver Todas las Herramientas →
					</button>
				</div>
			</div>
		</section>
	);
};
