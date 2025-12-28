import { useEffect } from "react";
import { AppLayout } from "@/layout";
import { RegisterContainer } from "@/pods/register/register.container";

export const RegisterScene = () => {
	useEffect(() => {
		document.title = "Crear Cuenta - Beyond the Dungeon";

		const metaDescription = document.querySelector('meta[name="description"]');
		if (metaDescription) {
			metaDescription.setAttribute(
				"content",
				"Únete a Beyond the Dungeon. Crea tu cuenta gratis y empieza a gestionar tus partidas de rol con las mejores herramientas."
			);
		}
	}, []);

	return (
		<AppLayout>
			<RegisterContainer />
		</AppLayout>
	);
};
