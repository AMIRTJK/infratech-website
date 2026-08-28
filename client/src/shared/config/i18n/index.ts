export { LANGUAGES, DEFAULT_LANGUAGE_CODE, DEFAULT_LANGUAGE } from "./languages";
export { TRANSLATIONS } from "./translations";
export type { TLangCode, ILanguageOption, ITranslation } from "./types";
export {
  STORAGE_LANG_KEY,
  isValidLangCode,
  detectLanguageFromCountry,
  detectLanguageFromTimezone,
  detectLanguageFromLocaleString,
  detectLanguageFromAcceptLanguage,
  detectServerLanguage,
  detectClientLanguage,
  getSavedLanguagePreference,
  saveLanguagePreference,
} from "./detection";
