import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";

/** Fallback: /objetos/:slug → /objetos/dnd5e-2024/:slug */
const ObjetosSlugRedirect = () => {
	const { slug } = useParams<{ slug: string }>();
	return <Navigate to={`/objetos/dnd5e-2024/${slug}`} replace />;
};
import {
	HomeScene,
	AuthCallbackScene,
	MapaBatallaScene,
	MisMapasScene,
	MisCampanasScene,
	EditarCampanaScene,
	PartidaScene,
	GuiasScene,
	GuiaDetalleScene,
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
import { AdminDashboardScene } from "@/scenes/admin-dashboard.scene";
import ObjetosDetalleScene from "@/scenes/objetos-detalle.scene";
import ForoScene from "@/scenes/foro.scene";
import ForoHiloScene from "@/scenes/foro-hilo.scene";
import { ProtectedRoute } from "@/core/auth/ProtectedRoute";
import { AdminRoute } from "@/core/auth/AdminRoute";
import { AppLayout } from "@/layout/app.layout";
import { FullscreenToolLayout } from "@/layout/tool.layout";
import { switchRoutes } from "./routes";

export const AppRouter = () => {
	return (
		<Router>
			<Routes>
				<Route path={switchRoutes.root} element={<HomeScene />} />
				<Route path={switchRoutes.login} element={<LoginScene />} />
				<Route path={switchRoutes.register} element={<RegisterScene />} />
				<Route path={switchRoutes.authCallback} element={<AuthCallbackScene />} />

				{/* ── Public tools (AppLayout always) ── */}
				<Route path={switchRoutes.hechizos} element={<AppLayout><HechizosScene /></AppLayout>} />
				<Route path={switchRoutes.hechizosDetalle} element={<AppLayout><HechizosDetalleScene /></AppLayout>} />
				<Route path={switchRoutes.bestiario} element={<AppLayout><BestiarioScene /></AppLayout>} />
				<Route path={switchRoutes.bestiarioDetalle} element={<AppLayout><BestiarioDetalleScene /></AppLayout>} />
				<Route path={switchRoutes.objetos} element={<AppLayout><ObjetosScene /></AppLayout>} />
				<Route path={switchRoutes.objetosDetalle} element={<AppLayout><ObjetosDetalleScene /></AppLayout>} />
				{/* Fallback: /objetos/:slug → redirige a dnd5e-2024 */}
				<Route path="/objetos/:slug" element={<ObjetosSlugRedirect />} />
				<Route path={switchRoutes.guias} element={<AppLayout><GuiasScene /></AppLayout>} />
				<Route path={switchRoutes.guiaDetalle} element={<AppLayout><GuiaDetalleScene /></AppLayout>} />
				<Route path={switchRoutes.dados} element={<AppLayout><DadosScene /></AppLayout>} />
				<Route path={switchRoutes.inventario} element={<AppLayout><InventarioScene /></AppLayout>} />
				<Route path={switchRoutes.fichas} element={<AppLayout><MisFichasScene /></AppLayout>} />
				<Route path={switchRoutes.fichaNueva} element={<AppLayout><MiFichaScene /></AppLayout>} />
				<Route path={switchRoutes.foro} element={<AppLayout><ForoScene /></AppLayout>} />
				<Route path={switchRoutes.foroHilo} element={<AppLayout><ForoHiloScene /></AppLayout>} />
				<Route path={switchRoutes.mapaBatalla} element={<FullscreenToolLayout><MapaBatallaScene /></FullscreenToolLayout>} />

				{/* ── Profile (auth required, AppLayout) ── */}
				<Route path={switchRoutes.profile} element={<ProtectedRoute><Navigate to={switchRoutes.profileCampanas} replace /></ProtectedRoute>} />
				<Route path={switchRoutes.profileSettings} element={<ProtectedRoute><AppLayout><ProfileSettingsScene /></AppLayout></ProtectedRoute>} />
				<Route path={switchRoutes.profileCampanas} element={<ProtectedRoute><AppLayout><MisCampanasScene /></AppLayout></ProtectedRoute>} />
				<Route path={switchRoutes.profileMapas} element={<ProtectedRoute><AppLayout><MisMapasScene /></AppLayout></ProtectedRoute>} />
				<Route path={switchRoutes.editarCampana} element={<ProtectedRoute><AppLayout><EditarCampanaScene /></AppLayout></ProtectedRoute>} />

				{/* ── Partida VTT ── */}
				<Route path={switchRoutes.partida} element={<ProtectedRoute><PartidaScene /></ProtectedRoute>} />

				{/* ── Admin ── */}
				<Route path={switchRoutes.admin} element={<AdminRoute><AppLayout><AdminDashboardScene /></AppLayout></AdminRoute>} />
			</Routes>
		</Router>
	);
};
