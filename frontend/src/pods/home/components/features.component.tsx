import { Link } from "react-router-dom";
import { useTranslation } from "@/i18n";

export const Features = () => {
	const { t } = useTranslation();

	const FEATURES = [
		{
			icon: "/campaigns.png",
			title: t.features.cards.campaigns.title,
			description: t.features.cards.campaigns.description,
			color: "from-primary to-primary-dark",
			url: "/profile/campanas",
		},
		{
			icon: "/characters.png",
			title: t.features.cards.characters.title,
			description: t.features.cards.characters.description,
			color: "from-secondary to-secondary-dark",
			url: "/fichas/nueva",
		},
		{
			icon: "/dice.png",
			title: t.features.cards.dice.title,
			description: t.features.cards.dice.description,
			color: "from-accent to-accent-dark",
			url: "/dados",
		},
		{
			icon: "/maps.png",
			title: t.features.cards.battleMaps.title,
			description: t.features.cards.battleMaps.description,
			color: "from-primary to-accent",
			url: "/mapa-batalla",
		},
		{
			icon: "/creatures.png",
			title: t.features.cards.bestiary.title,
			description: t.features.cards.bestiary.description,
			color: "from-secondary to-primary",
			url: "/bestiario",
		},
		{
			icon: "/magic.png",
			title: t.features.cards.spells.title,
			description: t.features.cards.spells.description,
			color: "from-accent to-secondary",
			url: "/hechizos",
		},
		{
			icon: "",
			title: t.features.cards.items.title,
			description: t.features.cards.items.description,
			color: "from-yellow-700 to-amber-900",
			url: "/objetos",
		},
		{
			icon: "",
			title: t.features.cards.inventory.title,
			description: t.features.cards.inventory.description,
			color: "from-amber-800 to-orange-900",
			url: "/inventario",
		},
	];

	return (
		<section
			id="herramientas"
			className="py-20 px-6 bg-stone-50 dark:bg-dark-lighter/50 transition-colors duration-300"
		>
			<div className="container mx-auto max-w-6xl">
				<div className="text-center mb-16 space-y-4">
					<h1 className="text-5xl md:text-6xl font-bold text-stone-800 dark:text-amber-50">
						{t.features.heading}
						<br />
						<span className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 dark:from-amber-300 dark:via-yellow-200 dark:to-amber-300 bg-clip-text text-transparent">
							{t.features.headingHighlight}
						</span>
					</h1>
					<p className="text-xl text-stone-700 dark:text-stone-300 max-w-2xl mx-auto">
						{t.features.subheading}
					</p>
					<h2 className="text-3xl font-bold text-stone-800 dark:text-amber-50 pt-8">
						{t.features.toolsHeading}
					</h2>
					<p className="text-stone-600 dark:text-stone-300 text-lg">
						{t.features.toolsSubheading}
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
								{feature.icon && (
									<img
										src={feature.icon}
										alt={feature.title}
										className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
									/>
								)}
							</div>
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
						{t.features.viewAll}
					</button>
				</div>
			</div>
		</section>
	);
};
