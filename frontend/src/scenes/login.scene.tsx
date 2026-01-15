import { useEffect } from "react";
import { AppLayout } from "@/layout";
import { LoginContainer } from "@/pods/login/login.container";

export const LoginScene = () => {
	useEffect(() => {
		document.title = "Iniciar Sesión - Beyond the Dungeon";

		const metaDescription = document.querySelector('meta[name="description"]');
		if (metaDescription) {
			metaDescription.setAttribute(
				"content",
				"Accede a tu cuenta de Beyond the Dungeon. Gestiona tus campañas, personajes y partidas de rol."
			);
		}
	}, []);

	return (
		<AppLayout>
			<LoginContainer />
		</AppLayout>
	);
};
