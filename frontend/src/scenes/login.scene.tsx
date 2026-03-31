import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/layout";
import { LoginContainer } from "@/pods/login/login.container";

export const LoginScene = () => {
	const { t } = useTranslation();

	useEffect(() => {
		document.title = t('meta.loginTitle');

		const metaDescription = document.querySelector('meta[name="description"]');
		if (metaDescription) {
			metaDescription.setAttribute(
				"content",
				t('meta.loginDescription')
			);
		}
	}, [t]);

	return (
		<AppLayout>
			<LoginContainer />
		</AppLayout>
	);
};
