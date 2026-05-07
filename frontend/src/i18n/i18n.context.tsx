import {
  createContext,
  useContext,
  useState,
  useCallback,
  type PropsWithChildren,
} from "react";
import { translations, type Locale, type Translations } from "./translations";

// ─── Context shape ────────────────────────────────────────────────────────────

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const I18nContext = createContext<I18nContextValue | null>(null);

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = "btd-locale";

function getInitialLocale(): Locale {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && stored in translations) return stored;
    // Use browser language as hint
    const browserLang = navigator.language.slice(0, 2);
    if (browserLang === "en") return "en";
  }
  return "es"; // default to Spanish (the project's primary language)
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "es" ? "en" : "es");
  }, [locale, setLocale]);

  const t = translations[locale];

  return (
    <I18nContext.Provider value={{ locale, t, setLocale, toggleLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTranslation() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useTranslation must be used inside <I18nProvider>");
  }
  return ctx;
}
