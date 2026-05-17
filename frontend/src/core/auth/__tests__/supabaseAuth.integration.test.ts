import { describe, it, expect, vi, beforeEach } from "vitest";
import { signIn, signUp, signOut, resendSignUpConfirmation, signInWithGoogle, getSession } from "../supabaseAuth";

const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();
const mockResend = vi.fn();
const mockSignInWithOAuth = vi.fn();
const mockGetSession = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      resend: (...args: unknown[]) => mockResend(...args),
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
      getSession: (...args: unknown[]) => mockGetSession(...args),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("signIn", () => {
  it("calls supabase.auth.signInWithPassword with email and password", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: "123", email: "test@test.com" } },
      error: null,
    });

    const result = await signIn("test@test.com", "password123");

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "test@test.com",
      password: "password123",
      options: undefined,
    });
    expect(result).toEqual({ id: "123", email: "test@test.com" });
  });

  it("passes captchaToken when provided", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: { id: "1", email: "a@b.com" } },
      error: null,
    });

    await signIn("a@b.com", "pass", "captcha-token-123");

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "pass",
      options: { captchaToken: "captcha-token-123" },
    });
  });

  it("throws mapped error on invalid credentials", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: "Invalid login credentials" },
    });

    await expect(signIn("bad@test.com", "wrong")).rejects.toThrow(
      "Email o contraseña incorrectos."
    );
  });

  it("throws generic error when user is null without error", async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(signIn("test@test.com", "pass")).rejects.toThrow(
      "No se ha podido iniciar sesión."
    );
  });
});

describe("signUp", () => {
  const validParams = {
    email: "new@test.com",
    password: "password123",
    username: "newuser",
    displayName: "New User",
  };

  it("calls supabase.auth.signUp with user metadata", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: "1", email: "new@test.com", identities: [{ id: "1" }] } },
      error: null,
    });

    await signUp(validParams);

    expect(mockSignUp).toHaveBeenCalledWith({
      email: "new@test.com",
      password: "password123",
      options: {
        data: { username: "newuser", displayName: "New User" },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  });

  it("passes captchaToken when provided", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: "1", email: "a@b.com", identities: [{ id: "1" }] } },
      error: null,
    });

    await signUp({ ...validParams, captchaToken: "captcha-abc" });

    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          captchaToken: "captcha-abc",
        }),
      })
    );
  });

  it("throws error when user already exists (empty identities)", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: { id: "1", email: "existing@test.com", identities: [] } },
      error: null,
    });

    await expect(signUp(validParams)).rejects.toThrow(
      "Ese email ya esta registrado"
    );
  });

  it("throws error on signup failure", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: "User already registered" },
    });

    await expect(signUp(validParams)).rejects.toThrow(
      "Ya existe un usuario con ese email."
    );
  });

  it("throws generic error when no user returned without error", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(signUp(validParams)).rejects.toThrow(
      "No se pudo crear la cuenta"
    );
  });
});

describe("signOut", () => {
  it("calls supabase.auth.signOut", async () => {
    mockSignOut.mockResolvedValue({ error: null });
    await signOut();
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it("throws on signOut error", async () => {
    mockSignOut.mockResolvedValue({ error: { message: "some error" } });
    await expect(signOut()).rejects.toThrow("some error");
  });
});

describe("resendSignUpConfirmation", () => {
  it("calls supabase.auth.resend with signup type", async () => {
    mockResend.mockResolvedValue({ error: null });
    await resendSignUpConfirmation("test@test.com");

    expect(mockResend).toHaveBeenCalledWith({
      type: "signup",
      email: "test@test.com",
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  });
});

describe("signInWithGoogle", () => {
  it("calls supabase.auth.signInWithOAuth with google provider", async () => {
    mockSignInWithOAuth.mockResolvedValue({ error: null });
    await signInWithGoogle();

    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  });
});

describe("getSession", () => {
  it("returns session when available", async () => {
    const fakeSession = { user: { id: "1" } };
    mockGetSession.mockResolvedValue({ data: { session: fakeSession }, error: null });

    const result = await getSession();
    expect(result).toEqual(fakeSession);
  });

  it("throws on error", async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: { message: "fail" } });
    await expect(getSession()).rejects.toThrow("fail");
  });
});
