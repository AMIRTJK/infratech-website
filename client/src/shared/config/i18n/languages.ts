import type { ILanguageOption } from "./types";

export const DEFAULT_LANGUAGE: ILanguageOption = {
  code: "ru",
  label: "RU",
  name: "Русский",
  flagUrl: "/flags/ru.svg",
};

export const LANGUAGES: readonly ILanguageOption[] = [
  {
    code: "en",
    label: "EN",
    name: "English",
    flagUrl: "/flags/gb.svg",
  },
  DEFAULT_LANGUAGE,
  {
    code: "tj",
    label: "TJ",
    name: "Тоҷикӣ",
    flagUrl: "/flags/tj.svg",
  },
] as const;

export const DEFAULT_LANGUAGE_CODE = "ru" as const;
