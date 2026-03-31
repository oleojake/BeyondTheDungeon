import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/layout";
import { RegisterContainer } from "@/pods/register/register.container";

export const RegisterScene = () => {
	const { t } = useTranslation();
	useEffect(() => {
		document.title = t("meta.registerTitle");

		const metaDescription = document.querySelector('meta[name="description"]');
		if (metaDescription) {
			metaDescription.setAttribute(
				"content",
				t("meta.registerDescription")
			);
		}
	}, [t]);

	return (
		<AppLayout>
			<RegisterContainer />
		</AppLayout>
	);
};
