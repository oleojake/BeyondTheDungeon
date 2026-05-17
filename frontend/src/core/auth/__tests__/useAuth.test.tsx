import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuth } from "../useAuth";

describe("useAuth", () => {
  it("throws error when used outside AuthProvider", () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth debe usarse dentro de <AuthProvider>"
    );
  });
});
