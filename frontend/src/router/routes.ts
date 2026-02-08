interface SwitchRoutes {
	root: string;
	login: string;
	register: string;
	profile: string;
	profileSettings: string;
	hechizos: string;
	hechizosDetalle: string;
	bestiario: string;
	bestiarioDetalle: string;
	dados: string;
	inventario: string;
	objetos: string;
	miFicha: string;
	authCallback: string;
}

export const switchRoutes: SwitchRoutes = {
	root: "/",
	login: "/login",
	register: "/registro",
	profile: "/profile",
	profileSettings: "/profile/settings",
	hechizos: "/hechizos",
	hechizosDetalle: "/hechizos/:id",
	bestiario: "/bestiario",
	bestiarioDetalle: "/bestiario/:id",
	dados: "/dados",
	inventario: "/inventario",
	objetos: "/objetos",
	miFicha: "/mi-ficha",
	authCallback: "/auth/callback",
};

type Routes = SwitchRoutes;

export const routes: Routes = {
	...switchRoutes,
};
