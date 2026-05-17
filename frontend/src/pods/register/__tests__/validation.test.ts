import { describe, it, expect } from "vitest";

const validateForm = (data: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  terms: boolean;
}) => {
  const errors: Record<string, string> = {};

  if (!data.username.trim())
    errors.username = "El nombre de usuario es requerido";
  else if (data.username.length < 3)
    errors.username = "Mínimo 3 caracteres";

  if (!data.email.trim()) errors.email = "El email es requerido";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errors.email = "Email inválido";

  if (!data.password) errors.password = "La contraseña es requerida";
  else if (data.password.length < 8)
    errors.password = "Mínimo 8 caracteres";

  if (data.password !== data.confirmPassword)
    errors.confirmPassword = "Las contraseñas no coinciden";

  if (!data.terms)
    errors.terms = "Debes aceptar los términos y condiciones";

  return errors;
};

describe("Register form validation", () => {
  const validData = {
    username: "hero123",
    email: "hero@example.com",
    password: "password123",
    confirmPassword: "password123",
    terms: true,
  };

  it("returns no errors for valid data", () => {
    expect(Object.keys(validateForm(validData))).toHaveLength(0);
  });

  it("requires username", () => {
    const errors = validateForm({ ...validData, username: "" });
    expect(errors.username).toBe("El nombre de usuario es requerido");
  });

  it("requires username min 3 characters", () => {
    const errors = validateForm({ ...validData, username: "ab" });
    expect(errors.username).toBe("Mínimo 3 caracteres");
  });

  it("accepts username with exactly 3 characters", () => {
    const errors = validateForm({ ...validData, username: "abc" });
    expect(errors.username).toBeUndefined();
  });

  it("requires email", () => {
    const errors = validateForm({ ...validData, email: "" });
    expect(errors.email).toBe("El email es requerido");
  });

  it("requires valid email format", () => {
    const errors = validateForm({ ...validData, email: "notanemail" });
    expect(errors.email).toBe("Email inválido");
  });

  it("accepts valid email", () => {
    const errors = validateForm({ ...validData, email: "user@domain.com" });
    expect(errors.email).toBeUndefined();
  });

  it("requires password", () => {
    const errors = validateForm({ ...validData, password: "" });
    expect(errors.password).toBe("La contraseña es requerida");
  });

  it("requires password min 8 characters", () => {
    const errors = validateForm({ ...validData, password: "1234567" });
    expect(errors.password).toBe("Mínimo 8 caracteres");
  });

  it("accepts password with exactly 8 characters", () => {
    const errors = validateForm({ ...validData, password: "12345678" });
    expect(errors.password).toBeUndefined();
  });

  it("requires passwords to match", () => {
    const errors = validateForm({
      ...validData,
      password: "password123",
      confirmPassword: "different",
    });
    expect(errors.confirmPassword).toBe("Las contraseñas no coinciden");
  });

  it("requires terms acceptance", () => {
    const errors = validateForm({ ...validData, terms: false });
    expect(errors.terms).toBe("Debes aceptar los términos y condiciones");
  });

  it("returns multiple errors at once", () => {
    const errors = validateForm({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    });
    expect(Object.keys(errors).length).toBeGreaterThanOrEqual(4);
  });
});
