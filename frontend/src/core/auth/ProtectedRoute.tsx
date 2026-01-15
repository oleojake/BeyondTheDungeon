import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/core/auth/useAuth";
import { switchRoutes } from "@/router/routes";

type Props = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: Props) {
  const { user, loading } = useAuth();
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

  return <>{children}</>;
}
