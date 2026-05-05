import { useTranslation } from "@/i18n";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  /** Extra CSS classes for the outer wrapper */
  className?: string;
  /** Compact mode: just shows the flag + code, no full label */
  compact?: boolean;
}

/**
 * Language switcher button.
 * Toggles between ES and EN and persists the choice in localStorage.
 */
export function LanguageSwitcher({ className, compact = false }: LanguageSwitcherProps) {
  const { locale, toggleLocale, t } = useTranslation();

  const isSpanish = locale === "es";

  return (
    <button
      onClick={toggleLocale}
      title={t.language.switchTo}
      aria-label={`Switch to ${t.language.switchTo}`}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold",
        "transition-all duration-200",
        "border-stone-300 dark:border-dark-border",
        "bg-white/60 dark:bg-dark-card/60 backdrop-blur-sm",
        "text-stone-700 dark:text-stone-200",
        "hover:border-primary hover:text-primary dark:hover:border-amber-400 dark:hover:text-amber-300",
        "hover:bg-amber-50 dark:hover:bg-amber-900/20",
        "shadow-sm hover:shadow",
        className,
      )}
    >
      {/* Flag emoji */}
      <span className="text-sm leading-none select-none" aria-hidden>
        {isSpanish ? "🇪🇸" : "🇬🇧"}
      </span>

      {/* Language code */}
      <span className="tracking-wide">{t.language.current}</span>

      {/* Full target language label in non-compact mode */}
      {!compact && (
        <span className="hidden sm:inline text-[11px] opacity-70">
          → {t.language.switchTo}
        </span>
      )}
    </button>
  );
}
