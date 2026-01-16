import { supabase } from "@/lib/supabase";

export type AuthUser = {
  id: string;
  email: string;
};

export function mapSupabaseError(msg?: string) {
  const m = (msg || "").toLowerCase();

  if (m.includes("invalid login credentials"))
    return "Email o contraseña incorrectos.";
  if (m.includes("email not confirmed"))
    return "Debes confirmar tu email antes de iniciar sesión.";
  if (m.includes("user already registered"))
    return "Ya existe un usuario con ese email.";
  if (m.includes("password") && m.includes("length"))
    return "La contraseña no cumple la longitud mínima.";
  if (m.includes("invalid email")) return "El email no es válido.";

  return msg || "Ha ocurrido un error inesperado.";
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(mapSupabaseError(error.message));
  if (!data.user) throw new Error("No se ha podido iniciar sesión.");

  return {
    id: data.user.id,
    email: data.user.email!,
  } satisfies AuthUser;
}

export async function signUp(params: {
  email: string;
  password: string;
  username: string;
  displayName: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        username: params.username,
        displayName: params.displayName,
      },
      // URL para redirigir después de confirmar el email
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw new Error(mapSupabaseError(error.message));

  // Ojo: si tienes confirmación por email, puede que NO haya sesión aún.
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(mapSupabaseError(error.message));
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(mapSupabaseError(error.message));
  return data.session; // null o Session
}
