import { CTA, Features, Footer, Hero, Navbar } from "./components";

export const HomeComponent = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-50 dark:from-dark dark:via-dark-lighter dark:to-dark transition-colors duration-300">
			<Navbar />
			<Hero />
			<Features />
			<CTA />
			<Footer />
		</div>
	);
};
