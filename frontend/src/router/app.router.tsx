import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomeScene, AuthCallbackScene } from "@/scenes";
import { LoginScene } from "@/scenes/login.scene";
import { RegisterScene } from "@/scenes/register.scene";
import { DashboardScene } from "@/scenes/dashboard.scene";
import DashboardMiFicha from "@/scenes/dashboard.mi-ficha";
import DashboardDados from "@/scenes/dashboard.dados";
import DashboardHechizos from "@/scenes/dashboard.hechizos";
import DashboardInventario from "@/scenes/dashboard.inventario";
import DashboardBestiario from "@/scenes/dashboard.bestiario";
import { DashboardHome } from "@/scenes/dashboard.home";
import { ProtectedRoute } from "@/core/auth/ProtectedRoute";
import { switchRoutes } from "./routes";

export const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path={switchRoutes.root} element={<HomeScene />} />
        <Route path={switchRoutes.login} element={<LoginScene />} />
        <Route path={switchRoutes.register} element={<RegisterScene />} />
        <Route path={switchRoutes.authCallback} element={<AuthCallbackScene />} />
        <Route
          path={switchRoutes.dashboard}
          element={
            <ProtectedRoute>
              <DashboardScene />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="mi-ficha" element={<DashboardMiFicha />} />
          <Route path="dados" element={<DashboardDados />} />
          <Route path="hechizos" element={<DashboardHechizos />} />
          <Route path="inventario" element={<DashboardInventario />} />
          <Route path="bestiario" element={<DashboardBestiario />} />
        </Route>
      </Routes>
    </Router>
  );
};
