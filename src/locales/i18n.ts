import ptStrings from './pt.json';
import enStrings from './en.json';

type Language = 'pt' | 'en';
type TranslationKey = keyof typeof ptStrings;

const translations: Record<Language, Record<string, string>> = {
  pt: ptStrings,
  en: enStrings,
};

let currentLanguage: Language = 'pt';

export function setLanguage(lang: Language): void {
  currentLanguage = lang;
}

export function getLanguage(): Language {
  return currentLanguage;
}

export function t(key: TranslationKey): string {
  return translations[currentLanguage][key] ?? key;
}

export type { Language, TranslationKey };
