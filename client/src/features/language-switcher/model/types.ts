import type { TLangCode, ILanguageOption } from "@shared/config/i18n";

export interface ILanguageSwitcherProps {
  currentLang: TLangCode;
  onLanguageChange: (lang: TLangCode) => void;
  className?: string;
}

export type { TLangCode, ILanguageOption };
