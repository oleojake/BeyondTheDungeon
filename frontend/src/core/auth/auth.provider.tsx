import React, { createContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { signOut as supaSignOut } from "./supabaseAuth";

export type AuthState = {
  session: Session | null;
  user: { id: string; email: string | null } | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch is_admin from profiles table whenever the user changes
  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        setIsAdmin(data?.is_admin === true);
      })
      .catch(() => setIsAdmin(false));
  }, [session?.user?.id]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession ?? null);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const user = session?.user
    ? { id: session.user.id, email: session.user.email ?? null }
    : null;

  const value = useMemo<AuthState>(
    () => ({
      session,
      user,
      loading,
      isAdmin,
      logout: async () => {
        await supaSignOut();
      },
    }),
    [session, user, loading, isAdmin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
