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
  if (m.includes("captcha"))
    return "Error de captcha: la site key y el secret deben pertenecer a la misma cuenta de hCaptcha. Revisa la configuración en Supabase.";

  return msg || "Ha ocurrido un error inesperado.";
}

export async function signIn(email: string, password: string, captchaToken?: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: captchaToken ? { captchaToken } : undefined,
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
  captchaToken?: string;
}) {
  const { data, error } = await supabase.auth.signUp({
    email: params.email,
    password: params.password,
    options: {
      data: {
        username: params.username,
        displayName: params.displayName,
      },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      ...(params.captchaToken ? { captchaToken: params.captchaToken } : {}),
    },
  });

  if (error) throw new Error(mapSupabaseError(error.message));

  // Supabase can return success with an empty identities array when the user
  // already exists and email enumeration protection is enabled.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error(
      "Ese email ya esta registrado. Si no recuerdas la contrasena, usa la recuperacion de cuenta."
    );
  }

  if (!data.user) {
    throw new Error("No se pudo crear la cuenta. Intentalo de nuevo en unos segundos.");
  }

  // Ojo: si tienes confirmación por email, puede que NO haya sesión aún.
  return data;
}

export async function resendSignUpConfirmation(email: string) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw new Error(mapSupabaseError(error.message));
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw new Error(mapSupabaseError(error.message));
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
