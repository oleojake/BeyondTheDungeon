import { useEffect } from "react";
import { HomeContainer } from "@/pods/home";
import { useTranslation } from "@/i18n";

export const HomeScene = () => {
	const { locale } = useTranslation();

	useEffect(() => {
		if (locale === "en") {
			document.title = "Beyond the Dungeon – TTRPG Tools for Your Table";
			const metaDescription = document.querySelector('meta[name="description"]');
			if (metaDescription) {
				metaDescription.setAttribute(
					"content",
					"Organise and play tabletop RPGs without the hassle. Campaigns, character sheets, dice, battle maps and community for D&D and more. Create your free account."
				);
			}
		} else {
			document.title = "Beyond the Dungeon - Herramientas para tu mesa de rol";
			const metaDescription = document.querySelector('meta[name="description"]');
			if (metaDescription) {
				metaDescription.setAttribute(
					"content",
					"Organiza y juega rol sin complicaciones. Campañas, fichas, dados, mapas y comunidad para D&D y más. Crea tu cuenta gratis."
				);
			}
		}
	}, [locale]);

	return <HomeContainer />;
};
