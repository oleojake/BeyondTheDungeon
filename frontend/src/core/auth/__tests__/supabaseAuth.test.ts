import { describe, it, expect } from "vitest";
import { mapSupabaseError } from "../supabaseAuth";

describe("mapSupabaseError", () => {
  it("returns generic message for undefined input", () => {
    expect(mapSupabaseError()).toBe("Ha ocurrido un error inesperado.");
  });

  it("returns generic message for empty string", () => {
    expect(mapSupabaseError("")).toBe("Ha ocurrido un error inesperado.");
  });

  it("maps 'invalid login credentials'", () => {
    expect(mapSupabaseError("Invalid login credentials")).toBe(
      "Email o contraseña incorrectos."
    );
  });

  it("maps 'Email not confirmed'", () => {
    expect(mapSupabaseError("Email not confirmed")).toBe(
      "Debes confirmar tu email antes de iniciar sesión."
    );
  });

  it("maps 'user already registered'", () => {
    expect(mapSupabaseError("User already registered")).toBe(
      "Ya existe un usuario con ese email."
    );
  });

  it("maps password length error", () => {
    expect(mapSupabaseError("password must be at least 6 characters in length")).toBe(
      "La contraseña no cumple la longitud mínima."
    );
  });

  it("maps 'password' and 'length' in any order", () => {
    expect(mapSupabaseError("The length of password is insufficient")).toBe(
      "La contraseña no cumple la longitud mínima."
    );
  });

  it("maps 'invalid email'", () => {
    expect(mapSupabaseError("Invalid email")).toBe("El email no es válido.");
  });

  it("maps captcha error", () => {
    expect(
      mapSupabaseError(
        "captcha: sitekey and secret key must be from the same account"
      )
    ).toBe(
      "Error de captcha: la site key y el secret deben pertenecer a la misma cuenta de hCaptcha. Revisa la configuración en Supabase."
    );
  });

  it("returns the original message if no mapping matches", () => {
    expect(mapSupabaseError("Some random error")).toBe("Some random error");
  });

  it("is case-insensitive", () => {
    expect(mapSupabaseError("INVALID LOGIN CREDENTIALS")).toBe(
      "Email o contraseña incorrectos."
    );
  });
});
