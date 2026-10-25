import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

/** Корень приложения server: одинаково вычисляется из src/config (tsx) и из dist/config (сборка). */
export const SERVER_ROOT = fileURLToPath(new URL("../../", import.meta.url));

export class ConfigError extends Error {
  override name = "ConfigError";
}

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

// Dev-сервер Next. Без него в разработке браузер блокирует запросы форм, пока не создан .env.
const DEV_CORS_ORIGINS = ["http://localhost:3000"];

const port = z.coerce.number().int().min(1).max(65_535);
const positiveInt = z.coerce.number().int().positive();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: port.default(4000),
  HOST: z.string().trim().min(1).default("127.0.0.1"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
  TRUST_PROXY: z.stringbool().default(false),
  CORS_ORIGINS: z
    .string()
    .default("")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
  DATABASE_PATH: z.string().trim().min(1).default("./data/app.sqlite"),
  SMTP_HOST: optionalText,
  SMTP_PORT: port.default(465),
  SMTP_SECURE: z.stringbool().default(true),
  SMTP_USER: optionalText,
  SMTP_PASSWORD: optionalText,
  MAIL_FROM: optionalText,
  MAIL_TO: optionalText,
  RATE_LIMIT_MAX: positiveInt.default(100),
  RATE_LIMIT_WINDOW: z.string().trim().min(1).default("1 minute"),
  CONTACT_RATE_LIMIT_MAX: positiveInt.default(5),
  CONTACT_RATE_LIMIT_WINDOW: z.string().trim().min(1).default("1 hour"),
});

// Без этих четырёх значений письмо уйти не может; задать часть из них — почти наверняка опечатка.
const REQUIRED_MAIL_KEYS = ["SMTP_HOST", "SMTP_USER", "SMTP_PASSWORD", "MAIL_TO"] as const;

export interface IMailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  to: string;
}

export interface IRateLimitConfig {
  max: number;
  timeWindow: string;
}

export interface IAppConfig {
  isProduction: boolean;
  port: number;
  host: string;
  logLevel: string;
  trustProxy: boolean;
  corsOrigins: string[];
  databasePath: string;
  /** null — почта не настроена: заявки только сохраняются в базу. */
  mail: IMailConfig | null;
  rateLimit: IRateLimitConfig;
  contactRateLimit: IRateLimitConfig;
}

/** Разбирает переменные окружения в типизированный config; бросает ConfigError с понятным текстом. */
export const parseConfig = (env: NodeJS.ProcessEnv): IAppConfig => {
  // Пустая строка в .env означает «не задано», а не значение — иначе SMTP_PORT= превратится в 0.
  const filled = Object.fromEntries(Object.entries(env).filter(([, value]) => value !== ""));
  const result = envSchema.safeParse(filled);
  if (!result.success) {
    throw new ConfigError(`Ошибка в переменных окружения:\n${z.prettifyError(result.error)}`);
  }
  const values = result.data;

  const missingMailKeys = REQUIRED_MAIL_KEYS.filter((key) => !values[key]);
  if (missingMailKeys.length > 0 && missingMailKeys.length < REQUIRED_MAIL_KEYS.length) {
    throw new ConfigError(
      `Почта настроена не полностью: заполните ${missingMailKeys.join(", ")} ` +
        `или оставьте пустыми все переменные ${REQUIRED_MAIL_KEYS.join(", ")}.`,
    );
  }

  const mail =
    values.SMTP_HOST && values.SMTP_USER && values.SMTP_PASSWORD && values.MAIL_TO
      ? {
          host: values.SMTP_HOST,
          port: values.SMTP_PORT,
          secure: values.SMTP_SECURE,
          user: values.SMTP_USER,
          password: values.SMTP_PASSWORD,
          from: values.MAIL_FROM ?? values.SMTP_USER,
          to: values.MAIL_TO,
        }
      : null;

  const isProduction = values.NODE_ENV === "production";

  return {
    isProduction,
    port: values.PORT,
    host: values.HOST,
    logLevel: values.LOG_LEVEL,
    trustProxy: values.TRUST_PROXY,
    corsOrigins:
      values.CORS_ORIGINS.length > 0 || isProduction ? values.CORS_ORIGINS : DEV_CORS_ORIGINS,
    databasePath: path.resolve(SERVER_ROOT, values.DATABASE_PATH),
    mail,
    rateLimit: { max: values.RATE_LIMIT_MAX, timeWindow: values.RATE_LIMIT_WINDOW },
    contactRateLimit: {
      max: values.CONTACT_RATE_LIMIT_MAX,
      timeWindow: values.CONTACT_RATE_LIMIT_WINDOW,
    },
  };
};

/**
 * Читает .env и возвращает config. На боевом сервере файл лежит вне папки приложения
 * (ENV_FILE), чтобы обновление приложения не затирало настройки.
 */
export const loadConfig = (): IAppConfig => {
  const envFile = process.env.ENV_FILE ?? path.join(SERVER_ROOT, ".env");
  if (process.env.ENV_FILE && !existsSync(envFile)) {
    throw new ConfigError(`Файл настроек не найден: ${envFile}`);
  }
  if (existsSync(envFile)) {
    dotenv.config({ path: envFile, quiet: true });
  }
  return parseConfig(process.env);
};
