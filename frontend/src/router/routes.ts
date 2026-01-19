interface SwitchRoutes {
  root: string;
  login: string;
  register: string;
  dashboard: string;
  authCallback: string;
}

export const switchRoutes: SwitchRoutes = {
  root: "/",
  login: "/login",
  register: "/registro",
  dashboard: "/dashboard",
  authCallback: "/auth/callback",
};

type Routes = SwitchRoutes;

export const routes: Routes = {
  ...switchRoutes,
};
