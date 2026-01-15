const FEATURES = [
	{
		icon: "📖",
		title: "Gestión de Campañas",
		description: "Crea y administra tus aventuras con facilidad.",
		color: "from-primary to-primary-dark",
	},
	{
		icon: "🧙",
		title: "Fichas de Personaje",
		description: "Fichas digitales activas para tus héroes.",
		color: "from-secondary to-secondary-dark",
	},
	{
		icon: "🎲",
		title: "Dados Virtuales",
		description: "Tira dados en todas las formas y tamaños.",
		color: "from-accent to-accent-dark",
	},
	{
		icon: "🗺️",
		title: "Mapas de Batalla",
		description: "Visualiza combates con mapas simples y claros.",
		color: "from-primary to-accent",
	},
	{
		icon: "🐉",
		title: "Consulta de Bestiario",
		description: "Accede a estadísticas de criaturas al instante.",
		color: "from-secondary to-primary",
	},
	{
		icon: "✨",
		title: "Hechizos y Reglas",
		description: "Consulta hechizos y reglas rápidamente.",
		color: "from-accent to-secondary",
	},
];

export const Features = () => {
	return (
		<section id="herramientas" className="py-20 px-6 bg-dark-lighter/50">
			<div className="container mx-auto max-w-6xl">
				<div className="text-center mb-12">
					<h2 className="text-4xl font-bold text-white mb-4">
						Todas tus herramientas en un solo lugar
					</h2>
					<p className="text-gray-400 text-lg">
						Gestiona tus partidas de forma profesional y sencilla
					</p>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{FEATURES.map((feature, index) => (
						<div
							key={index}
							className="group relative bg-dark-card border border-dark-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20"
						>
							<div
								className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-lg flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}
							>
								{feature.icon}
							</div>
							<h3 className="text-xl font-semibold text-white mb-2">
								{feature.title}
							</h3>
							<p className="text-gray-400 text-sm">{feature.description}</p>
						</div>
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
