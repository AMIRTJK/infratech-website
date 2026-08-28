import type { TLangCode } from "./types";
import { DEFAULT_LANGUAGE_CODE, LANGUAGES } from "./languages";

export const STORAGE_LANG_KEY = "infratech_lang";

const CIS_COUNTRIES = new Set([
  "RU", "BY", "KZ", "KG", "UZ", "AM", "AZ", "MD", "TM",
]);

const TJ_TIMEZONES = new Set([
  "Asia/Dushanbe",
]);

const CIS_TIMEZONES = new Set([
  // Россия
  "Europe/Moscow", "Europe/Samara", "Europe/Volgograd", "Europe/Kaliningrad",
  "Europe/Kirov", "Europe/Astrakhan", "Europe/Saratov", "Europe/Ulyanovsk",
  "Asia/Yekaterinburg", "Asia/Omsk", "Asia/Novosibirsk", "Asia/Barnaul",
  "Asia/Tomsk", "Asia/Novokuznetsk", "Asia/Krasnoyarsk", "Asia/Irkutsk",
  "Asia/Chita", "Asia/Yakutsk", "Asia/Khandyga", "Asia/Vladivostok",
  "Asia/Ust-Nera", "Asia/Magadan", "Asia/Sakhalin", "Asia/Srednekolymsk",
  "Asia/Kamchatka", "Asia/Anadyr",
  // Беларусь
  "Europe/Minsk",
  // Казахстан
  "Asia/Almaty", "Asia/Qyzylorda", "Asia/Aqtobe", "Asia/Aqtau", "Asia/Atyrau", "Asia/Oral",
  // Кыргызстан
  "Asia/Bishkek",
  // Узбекистан
  "Asia/Tashkent", "Asia/Samarkand",
  // Армения и Азербайджан
  "Asia/Yerevan", "Asia/Baku",
]);

export function isValidLangCode(code: unknown): code is TLangCode {
  return typeof code === "string" && LANGUAGES.some((lang) => lang.code === code);
}

/**
 * Извлечение ISO-2 кода региона из строки локали (напр. "ru-TJ" -> "TJ", "en-US" -> "US").
 */
export function extractRegionFromLocale(locale?: string | null): string | null {
  if (!locale) return null;
  const clean = locale.trim();
  try {
    const reg = new Intl.Locale(clean).region;
    if (reg) return reg.toUpperCase();
  } catch {}

  const match = clean.match(/[-_]([a-zA-Z]{2})\b/);
  return match?.[1] ? match[1].toUpperCase() : null;
}

/**
 * Извлечение кода базового языка (напр. "ru-TJ" -> "ru", "tg-Cyrl" -> "tg").
 */
export function extractLanguageFromLocale(locale?: string | null): string | null {
  if (!locale) return null;
  const clean = locale.trim();
  try {
    const lang = new Intl.Locale(clean).language;
    if (lang) return lang.toLowerCase();
  } catch {}

  const match = clean.match(/^([a-zA-Z]{2,3})\b/);
  return match?.[1] ? match[1].toLowerCase() : null;
}

/**
 * Определение языка по ISO коду страны (2 буквы, напр. TJ, RU, US, DE).
 */
export function detectLanguageFromCountry(countryCode?: string | null): TLangCode | null {
  if (!countryCode) return null;
  const upper = countryCode.trim().toUpperCase();
  if (upper === "TJ") {
    return "tj";
  }
  if (CIS_COUNTRIES.has(upper)) {
    return "ru";
  }
  if (/^[A-Z]{2}$/.test(upper)) {
    return "en";
  }
  return null;
}

/**
 * Определение языка по часовому поясу (IANA timezone).
 * Возвращает язык только при точном совпадении с известными таймзонами региона.
 */
export function detectLanguageFromTimezone(timezone?: string | null): TLangCode | null {
  if (!timezone) return null;
  const tz = timezone.trim();
  if (TJ_TIMEZONES.has(tz)) {
    return "tj";
  }
  if (CIS_TIMEZONES.has(tz)) {
    return "ru";
  }
  return null;
}

/**
 * Определение языка по строке локали (напр. "tg-TJ", "ru-TJ", "ru-RU", "en-US").
 */
export function detectLanguageFromLocaleString(localeStr?: string | null): TLangCode | null {
  if (!localeStr) return null;

  // 1. Проверяем код региона в локали: если регион TJ -> tj!
  const region = extractRegionFromLocale(localeStr);
  if (region === "TJ") {
    return "tj";
  }

  // 2. Проверяем язык
  const lang = extractLanguageFromLocale(localeStr);
  if (lang === "tg") {
    return "tj";
  }
  if (lang === "ru" || lang === "be" || lang === "kk" || lang === "ky" || lang === "uz") {
    return "ru";
  }
  if (lang === "en") {
    return "en";
  }

  // 3. Если регион CIS -> ru
  if (region && CIS_COUNTRIES.has(region)) {
    return "ru";
  }

  // 4. Если регион США/Европа/другой -> en
  if (region && /^[A-Z]{2}$/.test(region)) {
    return "en";
  }

  return null;
}

/**
 * Определение языка по заголовку Accept-Language.
 */
export function detectLanguageFromAcceptLanguage(acceptLang?: string | null): TLangCode | null {
  if (!acceptLang) return null;
  const entries = acceptLang.split(",");

  for (const entry of entries) {
    const langTag = entry.split(";")[0]?.trim();
    if (langTag) {
      const detected = detectLanguageFromLocaleString(langTag);
      if (detected) return detected;
    }
  }

  return null;
}

export interface IHeaderGetter {
  get(name: string): string | null | undefined;
}

export interface ICookieGetter {
  get(name: string): { value: string } | undefined;
}

/**
 * Определение языка на сервере (SSR в Next.js):
 * 1. Сохранённая кука пользователя (infratech_lang)
 * 2. GeoIP заголовки (Cloudflare cf-ipcountry, Vercel x-vercel-ip-country, Nginx x-country-code)
 * 3. Заголовок Accept-Language
 * 4. Значение по умолчанию
 */
export function detectServerLanguage(
  headersList?: IHeaderGetter,
  cookiesList?: ICookieGetter
): TLangCode {
  // 1. Проверяем сохранённый выбор пользователя в cookies
  const cookieVal = cookiesList?.get(STORAGE_LANG_KEY)?.value;
  if (isValidLangCode(cookieVal)) {
    return cookieVal;
  }

  if (headersList) {
    // 2. GeoIP заголовки от CDN / Reverse Proxy
    const country =
      headersList.get("cf-ipcountry") ||
      headersList.get("x-vercel-ip-country") ||
      headersList.get("x-country-code") ||
      headersList.get("x-real-ip-country") ||
      headersList.get("x-geoip-country");

    if (country) {
      const langFromCountry = detectLanguageFromCountry(country);
      if (langFromCountry) return langFromCountry;
    }

    // 3. Заголовок Accept-Language
    const acceptLanguage = headersList.get("accept-language");
    if (acceptLanguage) {
      const langFromHeader = detectLanguageFromAcceptLanguage(acceptLanguage);
      if (langFromHeader) return langFromHeader;
    }
  }

  return DEFAULT_LANGUAGE_CODE;
}

/**
 * Определение языка на клиенте (браузер):
 * 1. URL search параметр (?lang=...)
 * 2. localStorage (явный выбор пользователя)
 * 3. Регион из Intl.DateTimeFormat().resolvedOptions().locale (напр. "ru-TJ" -> region "TJ" -> "tj")
 * 4. Локали системы и браузера из navigator.languages (напр. ["ru-TJ", "ru", "en"])
 * 5. Часовой пояс браузера (Intl timezone, напр. Asia/Dushanbe -> "tj")
 * 6. initialServerLang / fallback
 */
export function detectClientLanguage(initialServerLang?: TLangCode): TLangCode {
  if (typeof window === "undefined") {
    return initialServerLang ?? DEFAULT_LANGUAGE_CODE;
  }

  // 1. URL search параметр
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    if (isValidLangCode(urlLang)) {
      saveLanguagePreference(urlLang);
      return urlLang;
    }
  } catch {}

  // 2. localStorage (явный сохранённый выбор пользователя)
  const saved = getSavedLanguagePreference();
  if (saved) {
    return saved;
  }

  // 3. Регион из Intl locale (в Windows при выборе региона Таджикистан формируется локаль *-TJ)
  try {
    const intlLocale = Intl.DateTimeFormat().resolvedOptions().locale;
    const detectedFromIntl = detectLanguageFromLocaleString(intlLocale);
    if (detectedFromIntl) {
      return detectedFromIntl;
    }
  } catch {}

  // 4. Локали системы и браузера из navigator.languages
  try {
    const languages = navigator.languages || [navigator.language];
    for (const lang of languages) {
      const detected = detectLanguageFromLocaleString(lang);
      if (detected) {
        return detected;
      }
    }
  } catch {}

  // 5. Часовой пояс (если однозначно указывает на страну/регион)
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tzLang = detectLanguageFromTimezone(timeZone);
    if (tzLang) {
      return tzLang;
    }
  } catch {}

  return initialServerLang ?? DEFAULT_LANGUAGE_CODE;
}

export function getSavedLanguagePreference(): TLangCode | null {
  if (typeof window === "undefined") return null;
  try {
    const val = localStorage.getItem(STORAGE_LANG_KEY);
    if (isValidLangCode(val)) {
      return val;
    }
  } catch {}
  return null;
}

export function saveLanguagePreference(lang: TLangCode): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_LANG_KEY, lang);
    document.cookie = `${STORAGE_LANG_KEY}=${lang};path=/;max-age=31536000;SameSite=Lax`;
  } catch {}
}
