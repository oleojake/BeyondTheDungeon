import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { RegisterContainer } from "../register.container";

const mockSignUp = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockResendSignUpConfirmation = vi.fn();

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
  signUp: (...args: unknown[]) => mockSignUp(...args),
  signInWithGoogle: (...args: unknown[]) => mockSignInWithGoogle(...args),
  resendSignUpConfirmation: (...args: unknown[]) => mockResendSignUpConfirmation(...args),
}));

vi.mock("../register.component", () => ({
  RegisterComponent: vi.fn((props: Record<string, unknown>) => (
    <div data-testid="register-component">
      <input
        data-testid="username-input"
        value={(props.formData as { username: string })?.username ?? ""}
        onChange={(e) =>
          (props.onChange as (f: string, v: string) => void)?.("username", e.target.value)
        }
        placeholder="Username"
      />
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
      <input
        data-testid="confirm-password-input"
        value={(props.formData as { confirmPassword: string })?.confirmPassword ?? ""}
        onChange={(e) =>
          (props.onChange as (f: string, v: string) => void)?.("confirmPassword", e.target.value)
        }
        placeholder="Confirm Password"
      />
      <input
        data-testid="terms-checkbox"
        type="checkbox"
        checked={(props.formData as { terms: boolean })?.terms ?? false}
        onChange={(e) =>
          (props.onChange as (f: string, v: boolean) => void)?.("terms", e.target.checked)
        }
      />
      <button data-testid="submit-btn" onClick={() => (props.onSubmit as (e: { preventDefault: () => void }) => void)?.({ preventDefault: () => {} })}>
        Submit
      </button>
      <button data-testid="google-btn" onClick={() => (props.onGoogleSignIn as () => void)?.()}>
        Google
      </button>
      {props.errors && (props.errors as Record<string, string>).general && (
        <span data-testid="error-msg">{(props.errors as Record<string, string>).general}</span>
      )}
      {props.errors && (props.errors as Record<string, string>).confirmPassword && (
        <span data-testid="password-mismatch">{(props.errors as Record<string, string>).confirmPassword}</span>
      )}
      {props.errors && (props.errors as Record<string, string>).username && (
        <span data-testid="username-error">{(props.errors as Record<string, string>).username}</span>
      )}
      {props.errors && (props.errors as Record<string, string>).email && (
        <span data-testid="email-error">{(props.errors as Record<string, string>).email}</span>
      )}
    </div>
  )),
}));

function renderContainer() {
  const router = createMemoryRouter([
    { path: "/", element: <RegisterContainer /> },
    { path: "/login", element: <div>Login Page</div> },
  ], { initialEntries: ["/"] });
  return render(<RouterProvider router={router} />);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("RegisterContainer", () => {
  it("renders register component", () => {
    renderContainer();
    expect(screen.getByTestId("register-component")).toBeTruthy();
  });

  it("calls signUp on submit and navigates", async () => {
    mockSignUp.mockResolvedValue({});
    const user = userEvent.setup();

    renderContainer();

    await user.type(screen.getByTestId("username-input"), "hero123");
    await user.type(screen.getByTestId("email-input"), "hero@test.com");
    await user.type(screen.getByTestId("password-input"), "password123");
    await user.type(screen.getByTestId("confirm-password-input"), "password123");
    await user.click(screen.getByTestId("terms-checkbox"));
    await user.click(screen.getByTestId("submit-btn"));

    expect(mockSignUp).toHaveBeenCalledWith({
      email: "hero@test.com",
      username: "hero123",
      password: "password123",
      displayName: "hero123",
    });
  });

  it("shows validation errors for empty fields", async () => {
    const user = userEvent.setup();
    renderContainer();

    await user.click(screen.getByTestId("submit-btn"));

    expect(await screen.findByTestId("username-error")).toBeTruthy();
    expect(await screen.findByTestId("email-error")).toBeTruthy();
  });

  it("shows password mismatch error", async () => {
    const user = userEvent.setup();
    renderContainer();

    await user.type(screen.getByTestId("username-input"), "abc");
    await user.type(screen.getByTestId("email-input"), "a@b.com");
    await user.type(screen.getByTestId("password-input"), "password123");
    await user.type(screen.getByTestId("confirm-password-input"), "different");
    await user.click(screen.getByTestId("terms-checkbox"));
    await user.click(screen.getByTestId("submit-btn"));

    expect(await screen.findByTestId("password-mismatch")).toBeTruthy();
  });

  it("sets error on signUp failure", async () => {
    mockSignUp.mockRejectedValue(new Error("Error al registrar usuario."));
    const user = userEvent.setup();

    renderContainer();

    await user.type(screen.getByTestId("username-input"), "hero123");
    await user.type(screen.getByTestId("email-input"), "hero@test.com");
    await user.type(screen.getByTestId("password-input"), "password123");
    await user.type(screen.getByTestId("confirm-password-input"), "password123");
    await user.click(screen.getByTestId("terms-checkbox"));
    await user.click(screen.getByTestId("submit-btn"));

    expect(await screen.findByTestId("error-msg")).toBeTruthy();
  });
});
