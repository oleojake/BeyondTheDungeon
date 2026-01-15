interface SwitchRoutes {
  root: string;
  login: string;
  register: string;
  dashboard: string;
}

export const switchRoutes: SwitchRoutes = {
  root: "/",
  login: "/login",
  register: "/registro",
  dashboard: "/dashboard",
};

type Routes = SwitchRoutes;

export const routes: Routes = {
  ...switchRoutes,
};
