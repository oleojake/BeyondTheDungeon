import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { routes } from "@/router";

export const Hero = () => {
	const { t } = useTranslation();
	return (
		<section className="relative pt-32 pb-20 px-6 overflow-hidden min-h-[90vh]">
			{/* Background Image */}
			<div className="absolute inset-0 flex items-center justify-center">
				<img 
					src="/logo.png" 
					alt="Beyond the Dungeon" 
					className="w-full h-full object-contain opacity-90"
				/>
			</div>
			{/* Subtle overlay at bottom for text readability */}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-200/60 dark:to-black/60"></div>

			<div className="container mx-auto max-w-5xl relative z-10 h-full flex items-end pb-12">
				<div className="text-center space-y-8 w-full mt-80">
				
					{/* CTA Buttons */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-12 pt-4 mt-60">
						<Link
							to={routes.register}
							className="px-8 py-4 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold rounded-lg shadow-2xl hover:shadow-primary/50 transition-all hover:scale-105 backdrop-blur-sm"
						>
							{t("home.hero.ctaCreate")}
						</Link>
						<a
							href="#herramientas"
							className="px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/40 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-xl"
						>
							{t("home.hero.ctaExplore")}
						</a>
					</div>
				</div>
			</div>
		</section>
	);
};
