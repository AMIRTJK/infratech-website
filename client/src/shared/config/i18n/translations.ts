import ru from "./locales/ru.json";
import en from "./locales/en.json";
import tj from "./locales/tj.json";
import type { TLangCode, ITranslation } from "./types";

export const TRANSLATIONS: Record<TLangCode, ITranslation> = {
  ru: ru as ITranslation,
  en: en as ITranslation,
  tj: tj as ITranslation,
};
