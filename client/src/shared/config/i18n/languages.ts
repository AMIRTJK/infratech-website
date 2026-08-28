import type { ILanguageOption } from "./types";

export const LANGUAGES: readonly ILanguageOption[] = [
  {
    code: "en",
    label: "EN",
    name: "English",
    flagUrl: "https://flagcdn.com/w40/gb.png",
  },
  {
    code: "ru",
    label: "RU",
    name: "Русский",
    flagUrl: "https://flagcdn.com/w40/ru.png",
  },
  {
    code: "tj",
    label: "TJ",
    name: "Тоҷикӣ",
    flagUrl: "https://flagcdn.com/w40/tj.png",
  },
] as const;

export const DEFAULT_LANGUAGE_CODE = "ru" as const;
