import { type PropsWithChildren } from "react";
import { useAuth } from "@/core/auth/useAuth";
import { AppLayout } from "./app.layout";

/** Layout para herramientas de pantalla completa (ej. mapa de batalla).
 *  Usuarios no logueados ven la navbar de la landing.
 *  Usuarios logueados ven la escena sin envoltorio — la escena gestiona su propia navegación. */
export const FullscreenToolLayout = ({ children }: PropsWithChildren) => {
	const { user, loading } = useAuth();

	if (loading) return null;

	return user ? (
		<>{children}</>
	) : (
		<AppLayout>{children}</AppLayout>
	);
};
