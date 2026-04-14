import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/core/auth/useAuth";
import { listUserInvitations } from "@/core/api/campaign-invitation.service";
import { routes } from "@/router";

export const PendingInvitationsBanner = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;

    listUserInvitations()
      .then((invitations) => setCount(invitations.length))
      .catch(() => {});
  }, [user]);

  if (!user || count === 0 || dismissed) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/30 px-4 py-2 flex items-center justify-between gap-4 text-sm">
      <span className="text-primary font-medium">
        Tienes {count} invitación{count > 1 ? "es" : ""} pendiente{count > 1 ? "s" : ""} en{" "}
        <Link to={routes.profileCampanas} className="underline font-semibold hover:text-primary-dark">
          Mis Campañas
        </Link>
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="text-primary hover:text-primary-dark transition-colors"
        aria-label="Cerrar aviso"
      >
        ✕
      </button>
    </div>
  );
};
