import { CTA, Features, Footer, Hero, Navbar } from "./components";

export const HomeComponent = () => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-dark via-dark-lighter to-dark">
			<Navbar />
			<Hero />
			<Features />
			<CTA />
			<Footer />
		</div>
	);
};
