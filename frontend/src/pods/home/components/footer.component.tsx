import { useTranslation } from "react-i18next";

export const Footer = () => {
	const { t } = useTranslation();
	return (
		<footer className="bg-stone-100 dark:bg-dark-lighter border-t border-stone-300 dark:border-dark-border py-12 px-6 transition-colors duration-300">
			<div className="container mx-auto max-w-6xl">
				<div className="grid md:grid-cols-4 gap-8 mb-8">
					{/* Brand */}
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-md">
								<span className="text-white font-bold">🎲</span>
							</div>
							<span className="text-stone-800 dark:text-amber-50 font-bold">
								Beyond the Dungeon
							</span>
						</div>
						<p className="text-stone-600 dark:text-stone-400 text-sm">
							{t("home.footer.tagline")}
						</p>
					</div>

					{/* Links */}
					<div>
						<h4 className="text-stone-800 dark:text-amber-50 font-semibold mb-4">
							{t("home.footer.tools")}
						</h4>
						<ul className="space-y-2 text-stone-600 dark:text-stone-400 text-sm">
							<li>
								<a href="#" className="hover:text-primary transition-colors">
									{t("nav.campaigns")}
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-primary transition-colors">
									{t("nav.characterSheets")}
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-primary transition-colors">
									{t("nav.dice")}
								</a>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="text-stone-800 dark:text-amber-50 font-semibold mb-4">
							{t("home.footer.community")}
						</h4>
						<ul className="space-y-2 text-stone-600 dark:text-stone-400 text-sm">
							<li>
								<a href="#" className="hover:text-primary transition-colors">
									Discord
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-primary transition-colors">
									GitHub
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-primary transition-colors">
									Twitter
								</a>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="text-stone-800 dark:text-amber-50 font-semibold mb-4">
							{t("home.footer.legal")}
						</h4>
						<ul className="space-y-2 text-stone-600 dark:text-stone-400 text-sm">
							<li>
								<a href="#" className="hover:text-primary transition-colors">
									{t("home.footer.terms")}
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-primary transition-colors">
									{t("home.footer.privacy")}
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-primary transition-colors">
									{t("home.footer.contact")}
								</a>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom */}
				<div className="border-t border-stone-300 dark:border-dark-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
					<p className="text-stone-600 dark:text-stone-400 text-sm">
						© {new Date().getFullYear()} Beyond the Dungeon. {t("home.footer.allRightsReserved")}
					</p>
					<div className="flex items-center gap-4">
						<a
							href="#"
							className="text-stone-600 dark:text-stone-400 hover:text-primary transition-colors"
						>
							<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
								<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
							</svg>
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
};
