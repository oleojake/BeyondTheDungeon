import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import type { FormData, FormErrors } from "@/interfaces/forms";
import { RegisterComponent } from "../register.component";

function renderWithRouter(el: React.ReactElement) {
  const router = createMemoryRouter([
    { path: "/", element: el },
  ]);
  return render(<RouterProvider router={router} />);
}

vi.mock("@/i18n", () => ({
  useTranslation: () => ({
    locale: "es",
    t: {
      register: {
        welcome: "Únete a la aventura, aventurero",
        usernameLabel: "Nombre de usuario",
        usernamePlaceholder: "Tu nombre de aventurero",
        displayNameLabel: "Nombre a mostrar",
        displayNamePlaceholder: "Cómo te verán los demás",
        emailLabel: "Email",
        passwordLabel: "Contraseña",
        passwordPlaceholder: "Crea una contraseña segura",
        confirmPasswordLabel: "Confirmar contraseña",
        confirmPasswordPlaceholder: "Repite tu contraseña",
        terms: "Acepto los",
        termsLink: "términos y condiciones",
        and: "y la",
        privacyLink: "política de privacidad",
        submit: "Crear Cuenta",
        submitting: "Registrando...",
        divider: "O",
        googleBtn: "Continuar con Google",
        hasAccount: "¿Ya tienes cuenta?",
        loginLink: "Iniciar sesión",
        backHome: "Volver al inicio",
      },
    },
    setLocale: vi.fn(),
    toggleLocale: vi.fn(),
  }),
}));

const defaultFormData: FormData = {
  username: "",
  displayName: "",
  email: "",
  password: "",
  confirmPassword: "",
  terms: false,
};

const defaultErrors: FormErrors = {};

const defaultProps = {
  formData: defaultFormData,
  errors: defaultErrors,
  loading: false,
  onChange: vi.fn() as (field: keyof FormData, value: string | boolean) => void,
  onSubmit: vi.fn() as (e: React.FormEvent) => void,
  onGoogleSignIn: vi.fn() as () => void,
};

describe("RegisterComponent", () => {
  it("renders with default props", () => {
    renderWithRouter(<RegisterComponent {...defaultProps} />);
    expect(screen.getByText("Crear Cuenta")).toBeTruthy();
  });

  it("renders passed formData values", () => {
    const props = {
      ...defaultProps,
      formData: {
        ...defaultFormData,
        username: "testuser",
        email: "test@example.com",
      },
    };
    renderWithRouter(<RegisterComponent {...props} />);
    const usernameInput = screen.getByDisplayValue("testuser") as HTMLInputElement;
    const emailInput = screen.getByDisplayValue("test@example.com") as HTMLInputElement;
    expect(usernameInput).toBeTruthy();
    expect(emailInput).toBeTruthy();
  });

  it("renders validation errors", () => {
    const props = {
      ...defaultProps,
      errors: {
        username: "El nombre de usuario es requerido",
        email: "El email es requerido",
      },
    };
    renderWithRouter(<RegisterComponent {...props} />);
    expect(screen.getByText("El nombre de usuario es requerido")).toBeTruthy();
    expect(screen.getByText("El email es requerido")).toBeTruthy();
  });

  it("renders general error", () => {
    const props = {
      ...defaultProps,
      errors: { general: "Error al registrar usuario." },
    };
    renderWithRouter(<RegisterComponent {...props} />);
    expect(screen.getByText("Error al registrar usuario.")).toBeTruthy();
  });

  it("renders success message", () => {
    const props = {
      ...defaultProps,
      successMessage: "Cuenta creada. Revisa tu email.",
    };
    renderWithRouter(<RegisterComponent {...props} />);
    expect(screen.getByText("Cuenta creada. Revisa tu email.")).toBeTruthy();
  });

  it("disables submit button when loading", () => {
    const props = {
      ...defaultProps,
      loading: true,
    };
    renderWithRouter(<RegisterComponent {...props} />);
    const button = screen.getByText("Registrando...") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
