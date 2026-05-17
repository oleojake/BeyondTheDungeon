import { describe, it, expect, beforeAll } from "vitest";

beforeAll(() => {
  process.env.VITE_SUPABASE_URL = "https://test.supabase.co";
  process.env.VITE_SUPABASE_ANON_KEY = "test-anon-key";
});

describe("supabase client", () => {
  it("creates the supabase client with correct env variables", async () => {
    const { supabase } = await import("@/lib/supabase");
    expect(supabase).toBeDefined();
    expect(typeof supabase.auth.getSession).toBe("function");
    expect(typeof supabase.from).toBe("function");
  });
});
