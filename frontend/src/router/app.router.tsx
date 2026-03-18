import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
	HomeScene,
	AuthCallbackScene,
	MapaBatallaScene,
	MisMapasScene,
	MisCampanasScene,
	EditarCampanaScene,
	PartidaScene,
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
import { ProfileLayout } from "@/layout/profile.layout";
import { ToolLayout, FullscreenToolLayout } from "@/layout/tool.layout";
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
						<ToolLayout>
							<DadosScene />
						</ToolLayout>
					}
				/>
				<Route path={switchRoutes.mapaBatalla} element={<FullscreenToolLayout><MapaBatallaScene /></FullscreenToolLayout>} />

				{/* Protected routes - auth required */}
				<Route
					path={switchRoutes.miFicha}
					element={
						<ProtectedRoute>
							<ProfileLayout>
								<MiFichaScene />
							</ProfileLayout>
						</ProtectedRoute>
					}
				/>
				<Route
					path={switchRoutes.misFichas}
					element={
						<ProtectedRoute>
							<MisFichasScene />
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
						<ToolLayout>
							<InventarioScene />
						</ToolLayout>
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
				{/* 🎮 Partida online VTT */}
				<Route
					path={switchRoutes.partida}
					element={
						<ProtectedRoute>
							<PartidaScene />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</Router>
	);
};
