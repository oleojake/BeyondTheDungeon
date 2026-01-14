import { useEffect } from "react";
import { AppLayout } from "@/layout";
import { HomeContainer } from "@/pods/home";

export const HomeScene = () => {
	useEffect(() => {
		document.title = "Beyond the Dungeon - Herramientas para tu mesa de rol";

		const metaDescription = document.querySelector('meta[name="description"]');
		if (metaDescription) {
			metaDescription.setAttribute(
				"content",
				"Organiza y juega rol sin complicaciones. Campañas, fichas, dados, mapas y comunidad para D&D y más. Crea tu cuenta gratis."
			);
		}
	}, []);

	return (
		<AppLayout>
			<HomeContainer />
		</AppLayout>
	);
};
