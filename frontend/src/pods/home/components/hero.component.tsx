import { Link } from "react-router";
import { routes } from "@/router";
import { useTranslation } from "@/i18n";

export const Hero = () => {
	const { t } = useTranslation();

	return (
		<section className="relative overflow-hidden min-h-[100svh] sm:min-h-[90vh] flex flex-col">
			{/* Background Image */}
			<div className="absolute inset-0 flex items-center justify-center">
				<img
					src="/logo.webp"
					alt="Beyond the Dungeon"
					fetchPriority="high"
					className="w-full h-full object-contain opacity-90"
				/>
			</div>
			{/* Subtle overlay at bottom for text readability */}
			<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-stone-200/60 dark:to-black/60"></div>

			{/* Spacer — pushes buttons to the bottom, logo is visible in the middle */}
			<div className="flex-1 pt-16 sm:pt-20" />

			{/* CTA Buttons — always visible at the bottom */}
			<div className="relative z-10 pb-10 sm:pb-16 px-6">
				<div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
					<Link
						to={routes.register}
						className="w-full sm:w-auto text-center px-8 py-4 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold rounded-lg shadow-2xl hover:shadow-primary/50 transition-all hover:scale-105 backdrop-blur-sm"
					>
						{t.hero.cta}
					</Link>
					<a
						href="#herramientas"
						className="w-full sm:w-auto text-center px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md border-2 border-white/40 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-xl"
					>
						{t.hero.explore}
					</a>
				</div>
			</div>
		</section>
	);
};
