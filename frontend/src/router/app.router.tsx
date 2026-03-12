import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
	HomeScene,
	AuthCallbackScene,
	MapaBatallaScene,
	MisMapasScene,
	MisCampanasScene,
	EditarCampanaScene,
} from "@/scenes";
import { LoginScene } from "@/scenes/login.scene";
import { RegisterScene } from "@/scenes/register.scene";
import ProfileSettingsScene from "@/scenes/profile-settings.scene";
import MiFichaScene from "@/scenes/mi-ficha.scene";
import { MisFichasScene } from "@/scenes/mis-fichas.scene";
import DadosScene from "@/scenes/dados.scene";
import HechizosScene from "@/scenes/hechizos.scene";
import HechizosDetalleScene from "@/scenes/hechizos-detalle.scene";
import InventarioScene from "@/scenes/inventario.scene";
import BestiarioScene from "@/scenes/bestiario.scene";
import BestiarioDetalleScene from "@/scenes/bestiario-detalle.scene";
import ObjetosScene from "@/scenes/objetos.scene";
import { ProtectedRoute } from "@/core/auth/ProtectedRoute";
import { AppLayout } from "@/layout/app.layout";
import { switchRoutes } from "./routes";

export const AppRouter = () => {
	return (
		<Router>
			<Routes>
				<Route path={switchRoutes.root} element={<HomeScene />} />
				<Route path={switchRoutes.login} element={<LoginScene />} />
				<Route path={switchRoutes.register} element={<RegisterScene />} />
				<Route
					path={switchRoutes.authCallback}
					element={<AuthCallbackScene />}
				/>

				{/* Protected routes - auth required */}
				<Route
					path={switchRoutes.profileSettings}
					element={
						<ProtectedRoute>
							<ProfileSettingsScene />
						</ProtectedRoute>
					}
				/>

				{/* Public routes - no auth required */}
				<Route
					path={switchRoutes.hechizos}
					element={
						<AppLayout>
							<HechizosScene />
						</AppLayout>
					}
				/>
				<Route
					path={switchRoutes.hechizosDetalle}
					element={
						<AppLayout>
							<HechizosDetalleScene />
						</AppLayout>
					}
				/>
				<Route
					path={switchRoutes.bestiario}
					element={
						<AppLayout>
							<BestiarioScene />
						</AppLayout>
					}
				/>
				<Route
					path={switchRoutes.bestiarioDetalle}
					element={
						<AppLayout>
							<BestiarioDetalleScene />
						</AppLayout>
					}
				/>
				<Route
					path={switchRoutes.dados}
					element={
						<AppLayout>
							<DadosScene />
						</AppLayout>
					}
				/>
				<Route path={switchRoutes.mapaBatalla} element={<MapaBatallaScene />} />

				{/* Protected routes - auth required */}
				<Route
					path={switchRoutes.miFicha}
					element={
						<ProtectedRoute>
							<AppLayout>
								<MiFichaScene />
							</AppLayout>
						</ProtectedRoute>
					}
				/>
				<Route
					path={switchRoutes.misFichas}
					element={
						<ProtectedRoute>
							<AppLayout>
								<MisFichasScene />
							</AppLayout>
						</ProtectedRoute>
					}
				/>
				<Route
					path={switchRoutes.misMapas}
					element={
						<ProtectedRoute>
							<MisMapasScene />
						</ProtectedRoute>
					}
				/>
				<Route
					path={switchRoutes.inventario}
					element={
						<ProtectedRoute>
							<AppLayout>
								<InventarioScene />
							</AppLayout>
						</ProtectedRoute>
					}
				/>
				<Route
					path={switchRoutes.objetos}
					element={
						<AppLayout>
							<ObjetosScene />
						</AppLayout>
					}
				/>
				<Route
					path={switchRoutes.misCampanas}
					element={
						<ProtectedRoute>
							<MisCampanasScene />
						</ProtectedRoute>
					}
				/>
				<Route
					path={switchRoutes.editarCampana}
					element={
						<ProtectedRoute>
							<EditarCampanaScene />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</Router>
	);
};
