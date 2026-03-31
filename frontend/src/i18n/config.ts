import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import translationES from '../locales/es/translation.json';
import translationEN from '../locales/en/translation.json';

// Configure i18n
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    // Translation resources
    resources: {
      es: {
        translation: translationES,
      },
      en: {
        translation: translationEN,
      },
    },
    
    // Fallback language
    fallbackLng: 'es',
    
    // Supported languages
    supportedLngs: ['es', 'en'],
    
    // Language detection configuration
    detection: {
      // Order of language detection
      order: ['localStorage', 'navigator'],
      
      // Cache user language preference
      caches: ['localStorage'],
      
      // localStorage key name
      lookupLocalStorage: 'language',
    },
    
    // i18next options
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // React-specific options
    react: {
      useSuspense: false, // Disable suspense for now
    },
    
    // Debug mode (disable in production)
    debug: false,
  });

export default i18n;
