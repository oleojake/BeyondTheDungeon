interface SwitchRoutes {
	root: string
}

export const switchRoutes: SwitchRoutes = {
	root: "/",
}

type Routes = SwitchRoutes

export const routes: Routes = {
	...switchRoutes,
}
