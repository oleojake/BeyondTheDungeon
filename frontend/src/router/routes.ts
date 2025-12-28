interface SwitchRoutes {
	root: string
	login: string
	register: string
}

export const switchRoutes: SwitchRoutes = {
	root: "/",
	login: "/login",
	register: "/registro",
}

type Routes = SwitchRoutes

export const routes: Routes = {
	...switchRoutes,
}
