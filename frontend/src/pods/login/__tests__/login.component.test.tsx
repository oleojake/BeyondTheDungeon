import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LoginComponent } from "../login.component";

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
      login: {
        welcome: "Bienvenido de vuelta, aventurero",
        emailLabel: "Email",
        passwordLabel: "Contraseña",
        passwordPlaceholder: "Introduce tu contraseña",
        forgotPassword: "¿Olvidaste tu contraseña?",
        submit: "Entrar",
        submitting: "Ingresando...",
        divider: "O continúa con",
        googleBtn: "Continuar con Google",
        noAccount: "¿No tienes cuenta?",
        createAccount: "Crear cuenta",
        backHome: "Volver al inicio",
        resendConfirmation: "¿No recibiste el email de confirmación?",
        resending: "Enviando...",
        resend: "Reenviar",
        resendSuccess: "Email de confirmación reenviado.",
      },
    },
    setLocale: vi.fn(),
    toggleLocale: vi.fn(),
  }),
}));

const defaultProps = {
  formData: { email: "", password: "" },
  loading: false,
  error: null,
  emailNotConfirmed: false,
  resendLoading: false,
  resendSuccess: false,
  onChange: vi.fn() as (field: "email" | "password", value: string) => void,
  onSubmit: vi.fn() as (e: React.FormEvent) => void,
  onGoogleSignIn: vi.fn() as () => void,
  onResendConfirmation: vi.fn() as () => void,
};

describe("LoginComponent", () => {
  it("renders with default props", () => {
    renderWithRouter(<LoginComponent {...defaultProps} />);
    expect(screen.getByText("Entrar")).toBeTruthy();
  });

  it("renders error message", () => {
    const props = { ...defaultProps, error: "Invalid credentials" };
    renderWithRouter(<LoginComponent {...props} />);
    expect(screen.getByText("Invalid credentials")).toBeTruthy();
  });

  it("renders email not confirmed banner", () => {
    const props = { ...defaultProps, emailNotConfirmed: true };
    renderWithRouter(<LoginComponent {...props} />);
    expect(screen.getByText("Reenviar")).toBeTruthy();
  });

  it("renders resend success message", () => {
    const props = { ...defaultProps, resendSuccess: true };
    renderWithRouter(<LoginComponent {...props} />);
    expect(screen.getByText("Email de confirmación reenviado.")).toBeTruthy();
  });

  it("disables submit button when loading", () => {
    const props = { ...defaultProps, loading: true };
    renderWithRouter(<LoginComponent {...props} />);
    const button = screen.getByText("Ingresando...") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
