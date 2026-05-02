interface SwitchRoutes {
	root: string;
	login: string;
	register: string;
	profile: string;
	profileSettings: string;
	profileCampanas: string;
	profileMapas: string;
	fichas: string;
	fichaNueva: string;
	hechizos: string;
	hechizosDetalle: string;
	bestiario: string;
	bestiarioDetalle: string;
	dados: string;
	inventario: string;
	objetos: string;
	mapaBatalla: string;
	editarCampana: string;
	partida: string;
	authCallback: string;
	admin: string;
}

export const switchRoutes: SwitchRoutes = {
	root: "/",
	login: "/login",
	register: "/registro",
	profile: "/profile",
	profileSettings: "/profile/settings",
	profileCampanas: "/profile/campanas",
	profileMapas: "/profile/mapas",
	fichas: "/fichas",
	fichaNueva: "/fichas/nueva",
	hechizos: "/hechizos",
	hechizosDetalle: "/hechizos/:id",
	bestiario: "/bestiario",
	bestiarioDetalle: "/bestiario/:id",
	dados: "/dados",
	inventario: "/inventario",
	objetos: "/objetos",
	mapaBatalla: "/mapa-batalla",
	editarCampana: "/editar-campana/:id",
	partida: "/partida/:id",
	authCallback: "/auth/callback",
	admin: "/admin",
};

type Routes = SwitchRoutes;

export const routes: Routes = {
	...switchRoutes,
};
