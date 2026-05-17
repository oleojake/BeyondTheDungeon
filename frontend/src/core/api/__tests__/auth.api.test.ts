import { describe, it, expect, vi, beforeEach } from "vitest";
import { authApi } from "../auth.api";
import type { RegisterPayload } from "../auth.api";

const mockSignUp = vi.fn();
const mockSignIn = vi.fn();

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithPassword: (...args: unknown[]) => mockSignIn(...args),
    },
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const validPayload: RegisterPayload = {
  email: "test@test.com",
  username: "testuser",
  password: "ValidPass1",
};

describe("authApi.register", () => {
  it("registers a user and returns profile data", async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: {
          id: "new-id",
          email: "test@test.com",
          identities: [{ id: "1" }],
          user_metadata: { username: "testuser", displayName: "testuser", avatarUrl: null },
        },
      },
      error: null,
    });

    const result = await authApi.register(validPayload);
    expect(result.id).toBe("new-id");
    expect(result.username).toBe("testuser");
  });

  it("throws if user already exists (empty identities)", async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: "existing", email: "test@test.com", identities: [], user_metadata: {} },
      },
      error: null,
    });

    await expect(authApi.register(validPayload)).rejects.toThrow("Ya existe un usuario con ese email.");
  });

  it("throws formatted error for user already registered", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: "User already registered", status: 400, code: "user_already_exists" },
    });

    await expect(authApi.register(validPayload)).rejects.toThrow("Ya existe un usuario con ese email.");
  });

  it("throws formatted error for invalid email", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: { message: "invalid email", status: 400, code: "invalid_email" },
    });

    await expect(authApi.register({ ...validPayload, email: "bad" })).rejects.toThrow("El email no es válido.");
  });

  it("throws generic error when no user returned", async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(authApi.register(validPayload)).rejects.toThrow("No se pudo obtener la información del usuario tras el registro");
  });
});

describe("authApi.login", () => {
  it("logs in and returns user data", async () => {
    mockSignIn.mockResolvedValue({
      data: {
        user: { id: "user-1", email: "test@test.com" },
        session: { access_token: "token" },
      },
      error: null,
    });

    const result = await authApi.login({ email: "test@test.com", password: "pass" });
    expect(result.id).toBe("user-1");
    expect(result.message).toBe("Login exitoso");
  });

  it("throws formatted error for invalid credentials", async () => {
    mockSignIn.mockResolvedValue({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });

    await expect(authApi.login({ email: "bad@test.com", password: "wrong" })).rejects.toThrow("Email o contraseña incorrectos");
  });

  it("throws when user is null", async () => {
    mockSignIn.mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    });

    await expect(authApi.login({ email: "test@test.com", password: "pass" })).rejects.toThrow("No se pudo obtener la información del usuario");
  });
});
