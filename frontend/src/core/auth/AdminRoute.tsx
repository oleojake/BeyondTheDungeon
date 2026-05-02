import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/core/auth/useAuth";
import { switchRoutes } from "@/router/routes";

type Props = {
  children: ReactNode;
};

/**
 * AdminRoute – protege rutas exclusivas de administrador.
 * Si el usuario no está autenticado → redirige a /login.
 * Si está autenticado pero no es admin → redirige al dashboard normal.
 */
export function AdminRoute({ children }: Props) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return null;

  if (!user) {
    return (
      <Navigate
        to={switchRoutes.login}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!isAdmin) {
    return <Navigate to={switchRoutes.profileCampanas} replace />;
  }

  return <>{children}</>;
}
