import "@testing-library/jest-dom/vitest";
import { vi, beforeEach } from "vitest";

beforeEach(() => {
  vi.spyOn(navigator, "language", "get").mockReturnValue("es");

  if (!window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }

  if (!window.matchMedia) {
    window.matchMedia = function matchMediaMock() {
      return {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      } as unknown as MediaQueryList;
    };
  }
});
