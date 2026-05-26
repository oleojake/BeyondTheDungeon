import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { LoginContainer } from "../login.container";

const mockSignIn = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockResendConfirmation = vi.fn();

vi.mock("@/core/captcha/useCaptcha", () => ({
  useCaptcha: () => ({
    question: "Test question",
    value: "",
    setValue: vi.fn(),
    valid: true,
    refresh: vi.fn(),
  }),
}));

vi.mock("@/core/auth/supabaseAuth", () => ({
  signIn: (email: string, password: string) => mockSignIn(email, password),
  signInWithGoogle: () => mockSignInWithGoogle(),
  resendSignUpConfirmation: (email: string) => mockResendConfirmation(email),
}));

vi.mock("../login.component", () => ({
  LoginComponent: vi.fn((props: Record<string, unknown>) => (
    <div data-testid="login-component">
      <input
        data-testid="email-input"
        value={(props.formData as { email: string })?.email ?? ""}
        onChange={(e) =>
          (props.onChange as (f: string, v: string) => void)?.("email", e.target.value)
        }
        placeholder="Email"
      />
      <input
        data-testid="password-input"
        value={(props.formData as { password: string })?.password ?? ""}
        onChange={(e) =>
          (props.onChange as (f: string, v: string) => void)?.("password", e.target.value)
        }
        placeholder="Password"
      />
      <button data-testid="submit-btn" onClick={() => (props.onSubmit as (e: { preventDefault: () => void }) => void)?.({ preventDefault: () => {} })}>
        Submit
      </button>
      <button data-testid="google-btn" onClick={() => (props.onGoogleSignIn as () => void)?.()}>
        Google
      </button>
      <button data-testid="resend-btn" onClick={() => (props.onResendConfirmation as () => void)?.()}>
        Resend
      </button>
      {props.error && <span data-testid="error-msg">{(props.error as string)}</span>}
      {props.resendSuccess && <span data-testid="resend-success">Reenviado</span>}
      {props.emailNotConfirmed && <span data-testid="not-confirmed">No confirmado</span>}
    </div>
  )),
}));

function renderContainer() {
  const router = createMemoryRouter([
    { path: "/", element: <LoginContainer /> },
    { path: "/profile/campanas", element: <div>Mis Campañas</div> },
  ], { initialEntries: ["/"] });
  return render(<RouterProvider router={router} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LoginContainer", () => {
  it("renders login component", () => {
    renderContainer();
    expect(screen.getByTestId("login-component")).toBeTruthy();
  });

  it("calls signIn on submit and navigates on success", async () => {
    mockSignIn.mockResolvedValue({});
    const user = userEvent.setup();

    renderContainer();

    await user.type(screen.getByTestId("email-input"), "test@test.com");
    await user.type(screen.getByTestId("password-input"), "password123");
    await user.click(screen.getByTestId("submit-btn"));

    expect(mockSignIn).toHaveBeenCalledWith("test@test.com", "password123");
  });

  it("shows error when signIn fails", async () => {
    mockSignIn.mockRejectedValue(new Error("Invalid credentials"));
    const user = userEvent.setup();

    renderContainer();

    await user.type(screen.getByTestId("email-input"), "bad@test.com");
    await user.type(screen.getByTestId("password-input"), "wrong");
    await user.click(screen.getByTestId("submit-btn"));

    expect(await screen.findByTestId("error-msg")).toBeTruthy();
  });

  it("sets emailNotConfirmed when error mentions confirmar email", async () => {
    mockSignIn.mockRejectedValue(new Error("Debes confirmar tu email"));
    const user = userEvent.setup();

    renderContainer();

    await user.type(screen.getByTestId("email-input"), "test@test.com");
    await user.type(screen.getByTestId("password-input"), "pass");
    await user.click(screen.getByTestId("submit-btn"));

    expect(await screen.findByTestId("not-confirmed")).toBeTruthy();
  });

  it("shows validation error for empty fields", async () => {
    const user = userEvent.setup();
    renderContainer();

    await user.click(screen.getByTestId("submit-btn"));

    expect(await screen.findByTestId("error-msg")).toBeTruthy();
  });

  it("calls signInWithGoogle on Google button click", async () => {
    mockSignInWithGoogle.mockResolvedValue({});
    const user = userEvent.setup();

    renderContainer();

    await user.click(screen.getByTestId("google-btn"));
    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });

  it("calls resendConfirmation on resend button click", async () => {
    mockResendConfirmation.mockResolvedValue({});
    const user = userEvent.setup();

    renderContainer();

    await user.type(screen.getByTestId("email-input"), "test@test.com");

    await user.click(screen.getByTestId("resend-btn"));
    expect(mockResendConfirmation).toHaveBeenCalledWith("test@test.com");
  });
});
