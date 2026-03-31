import { useTranslation } from 'react-i18next';

export const LanguageToggle = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  const isSpanish = i18n.language === 'es';

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 rounded-lg bg-gray-200 dark:bg-dark-card border border-gray-300 dark:border-dark-border hover:bg-gray-300 dark:hover:bg-dark-lighter transition-colors"
      aria-label={t("common.toggleLanguage")}
      title={isSpanish ? t("common.switchToEnglish") : t("common.switchToSpanish")}
    >
      <span className="text-sm font-semibold">
        {isSpanish ? "ES" : "EN"}
      </span>
    </button>
  );
};
