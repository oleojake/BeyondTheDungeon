import { supabase } from "@/lib/supabase";
import i18n from "@/i18n/config";

export type AuthUser = {
  id: string;
  email: string;
};

export function mapSupabaseError(msg?: string) {
  const m = (msg || "").toLowerCase();

  if (m.includes("invalid login credentials"))
    return i18n.t("auth.errors.invalidCredentials");
  if (m.includes("email not confirmed"))
    return i18n.t("auth.errors.emailNotConfirmed");
  if (m.includes("user already registered"))
    return i18n.t("auth.errors.emailAlreadyRegistered");
  if (m.includes("password") && m.includes("length"))
    return i18n.t("auth.errors.passwordTooShort");
  if (m.includes("invalid email")) return i18n.t("auth.errors.invalidEmail");

  return msg || i18n.t("auth.errors.unexpected");
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw new Error(mapSupabaseError(error.message));
  if (!data.user) throw new Error(i18n.t("auth.errors.signInFailed"));

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

  // Supabase can return success with an empty identities array when the user
  // already exists and email enumeration protection is enabled.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error(i18n.t("auth.errors.signupEmailExists"));
  }

  if (!data.user) {
    throw new Error(i18n.t("auth.errors.signUpFailed"));
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

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(mapSupabaseError(error.message));
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(mapSupabaseError(error.message));
  return data.session; // null o Session
}
