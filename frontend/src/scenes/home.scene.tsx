import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/layout";
import { HomeContainer } from "@/pods/home";

export const HomeScene = () => {
	const { t } = useTranslation();
	useEffect(() => {
		document.title = t("meta.homeTitle");

		const metaDescription = document.querySelector('meta[name="description"]');
		if (metaDescription) {
			metaDescription.setAttribute(
				"content",
				t("meta.homeDescription")
			);
		}
	}, [t]);

	return (
		<AppLayout>
			<HomeContainer />
		</AppLayout>
	);
};
