import { supabase } from "@/lib/supabase";

export interface RegisterPayload {
  email: string;
  username: string;
  password: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export const authApi = {
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          username: payload.username,
          displayName: payload.displayName || payload.username,
          avatarUrl: payload.avatarUrl || null,
        },
      },
    });

    // Detectar duplicados incluso si Supabase no devuelve error explícito
    const identitiesCount = Array.isArray(data.user?.identities)
      ? data.user?.identities.length
      : undefined;

    if (identitiesCount === 0) {
      throw new Error("Ya existe un usuario con ese email.");
    }

    if (error) {
      let message = error.message;

      if (message.toLowerCase().includes("invalid api key")) {
        message =
          "Error de configuración: revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.";
      } else if (
        message.toLowerCase().includes("user already registered") ||
        message.toLowerCase().includes("duplicate") ||
        message.toLowerCase().includes("already exists")
      ) {
        message = "Ya existe un usuario con ese email.";
      } else if (message.toLowerCase().includes("password")) {
        message = "La contraseña no cumple los requisitos mínimos.";
      } else if (
        message.toLowerCase().includes("email") &&
        message.toLowerCase().includes("invalid")
      ) {
        message = "El email no es válido.";
      }

      console.error("[Register Error]", {
        message: error.message,
        status: error.status,
        code: error.code,
      });

      throw new Error(message);
    }

    if (!data.user) {
      throw new Error(
        "No se pudo obtener la información del usuario tras el registro"
      );
    }

    const meta = data.user.user_metadata || {};

    return {
      id: data.user.id,
      email: data.user.email || payload.email,
      username: meta.username || payload.username,
      displayName: meta.displayName || payload.displayName || payload.username,
      avatarUrl: meta.avatarUrl || null,
    };
  },
  login: async (payload: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password,
    });

    if (error) {
      // Mensajes de error más específicos
      let errorMessage = error.message;

      if (
        error.message.includes("invalid_credentials") ||
        error.message.includes("Invalid login credentials")
      ) {
        errorMessage = "Email o contraseña incorrectos";
      } else if (error.message.includes("Invalid API Key")) {
        errorMessage = `❌ Error de configuración: VITE_SUPABASE_ANON_KEY inválida o no coincide con el proyecto. Verifica en Supabase Dashboard → Settings → API`;
      } else if (error.message.includes("invalid_grant")) {
        errorMessage =
          "Usuario no confirmado o credentials inválidas. Revisa tu email.";
      } else if (error.message.includes("User not found")) {
        errorMessage = "El usuario no existe. Por favor, regístrate primero.";
      }

      console.error("[Auth Error]", {
        message: error.message,
        status: error.status,
        code: error.code,
      });

      throw new Error(errorMessage);
    }

    if (!data.user) {
      throw new Error("No se pudo obtener la información del usuario");
    }

    return {
      id: data.user.id,
      email: data.user.email || "",
      message: "Login exitoso",
    };
  },
};
