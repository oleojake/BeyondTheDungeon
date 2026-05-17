import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useIsMobile } from "../use-mobile";

let matchMediaCallbacks: Record<string, () => void> = {};

beforeEach(() => {
  window.innerWidth = 1024;
  matchMediaCallbacks = {};

  vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
    matches: window.innerWidth < 768,
    addEventListener: (_event: string, cb: () => void) => {
      matchMediaCallbacks[query] = cb;
    },
    removeEventListener: vi.fn(),
  } as unknown as MediaQueryList));
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useIsMobile", () => {
  it("returns false on a desktop-sized viewport", () => {
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true on a mobile-sized viewport", () => {
    window.innerWidth = 375;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("returns false exactly at the breakpoint (768px)", () => {
    window.innerWidth = 768;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true below the breakpoint (767px)", () => {
    window.innerWidth = 767;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("reacts to viewport resize via matchMedia callback", () => {
    window.innerWidth = 1024;
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      window.innerWidth = 375;
      const cb = Object.values(matchMediaCallbacks)[0];
      if (cb) cb();
    });

    expect(result.current).toBe(true);
  });
});
