import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, renderHook, act } from "@testing-library/react";
import { I18nProvider, useTranslation } from "../i18n.context";

const STORAGE_KEY = "btd-locale";

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(document.documentElement, "lang", {
    value: "",
    writable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("I18nProvider", () => {
  it("renders children", () => {
    render(
      <I18nProvider>
        <div data-testid="child">Hello</div>
      </I18nProvider>
    );
    expect(screen.getByTestId("child")).toBeTruthy();
  });

  it("defaults to 'es' when no locale is stored and browser is not EN", () => {
    vi.spyOn(navigator, "language", "get").mockReturnValue("fr");
    const { result } = renderHook(() => useTranslation(), {
      wrapper: I18nProvider,
    });
    expect(result.current.locale).toBe("es");
  });

  it("defaults to 'en' when browser language is English", () => {
    vi.spyOn(navigator, "language", "get").mockReturnValue("en");
    const { result } = renderHook(() => useTranslation(), {
      wrapper: I18nProvider,
    });
    expect(result.current.locale).toBe("en");
  });

  it("reads stored locale from localStorage", () => {
    localStorage.setItem(STORAGE_KEY, "en");
    const { result } = renderHook(() => useTranslation(), {
      wrapper: I18nProvider,
    });
    expect(result.current.locale).toBe("en");
  });

  it("persists locale change to localStorage", () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: I18nProvider,
    });

    act(() => {
      result.current.setLocale("en");
    });

    expect(result.current.locale).toBe("en");
    expect(localStorage.getItem(STORAGE_KEY)).toBe("en");
  });

  it("updates document.lang on locale change", () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: I18nProvider,
    });

    act(() => {
      result.current.setLocale("en");
    });

    expect(document.documentElement.lang).toBe("en");
  });

  it("toggleLocale switches between es and en", () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: I18nProvider,
    });

    expect(result.current.locale).toBe("es");

    act(() => {
      result.current.toggleLocale();
    });
    expect(result.current.locale).toBe("en");

    act(() => {
      result.current.toggleLocale();
    });
    expect(result.current.locale).toBe("es");
  });

  it("provides correct translations for the active locale", () => {
    const { result } = renderHook(() => useTranslation(), {
      wrapper: I18nProvider,
    });

    expect(result.current.t.nav.login).toBe("Iniciar Sesión");

    act(() => {
      result.current.setLocale("en");
    });

    expect(result.current.t.nav.login).toBe("Log In");
  });
});

describe("useTranslation", () => {
  it("throws error when used outside provider", () => {
    expect(() => renderHook(() => useTranslation())).toThrow(
      "useTranslation must be used inside <I18nProvider>"
    );
  });
});
