// Import the translation resources
import translationES from '../locales/es/translation.json';

// Extend the i18next module to provide typesafety
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof translationES;
    };
  }
}

export type TranslationKeys = keyof typeof translationES;
