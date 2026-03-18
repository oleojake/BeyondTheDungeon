import { type PropsWithChildren } from "react";
import { useAuth } from "@/core/auth/useAuth";
import { AppLayout } from "./app.layout";
import { ProfileLayout } from "./profile.layout";

/** Rutas de herramienta públicas: muestra el sidebar del dashboard si hay sesión activa,
 *  o la navbar de la landing si el usuario no está logueado. */
export const ToolLayout = ({ children }: PropsWithChildren) => {
	const { user, loading } = useAuth();

	if (loading) return null;

	return user ? (
		<ProfileLayout>{children}</ProfileLayout>
	) : (
		<AppLayout>{children}</AppLayout>
	);
};

/** Layout para herramientas de pantalla completa (ej. mapa de batalla).
 *  Usuarios no logueados ven la navbar de la landing.
 *  Usuarios logueados ven la escena sin envoltorio — la escena gestiona su propia navegación. */
export const FullscreenToolLayout = ({ children }: PropsWithChildren) => {
	const { user, loading } = useAuth();

	if (loading) return null;

	return user ? <>{children}</> : <AppLayout>{children}</AppLayout>;
};
