const DEV_API_URL = "http://localhost:4000";

const isServer = typeof window === "undefined";

/**
 * Базовый адрес backend — единственное место, где он читается из окружения.
 * В браузере на проде переменная не задаётся: запросы идут на тот же домен (/api/v1/...),
 * а прокси (Caddy) передаёт их backend. Так одна сборка работает и по http, и по https.
 */
export const API_BASE_URL = isServer
  ? (process.env.API_INTERNAL_URL ?? DEV_API_URL)
  : (process.env.NEXT_PUBLIC_API_URL ??
    (process.env.NODE_ENV === "development" ? DEV_API_URL : ""));
