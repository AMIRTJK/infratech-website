import Fastify, { type FastifyServerOptions } from "fastify";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { z } from "zod";
import type { IAppConfig } from "../config/config.js";
import { openDatabase, runMigrations } from "../db/index.js";
import { createMailer } from "../mail/index.js";
import { registerErrorHandlers } from "../middlewares/error-handler.js";
import { registerSecurity } from "../middlewares/security.js";
import { contactsModule } from "../modules/contacts/index.js";
import { API_PREFIX, BODY_LIMIT_BYTES } from "../shared/constants.js";
import { ok } from "../shared/lib/envelope.js";

const buildLoggerOptions = (config: IAppConfig): FastifyServerOptions["logger"] => {
  const base = { level: config.logLevel, redact: ["req.headers.cookie", "req.headers.authorization"] };
  // pino-pretty — dev-зависимость: на проде её нет, логи пишутся JSON-строками.
  return config.isProduction ? base : { ...base, transport: { target: "pino-pretty" } };
};

/** Собирает приложение: плагины, база, почта, модули. Не слушает порт — это делает main.ts. */
export const buildServer = async (config: IAppConfig) => {
  z.config(z.locales.ru());

  const app = Fastify({
    logger: buildLoggerOptions(config),
    // За обратным прокси (Caddy) настоящий IP посетителя приходит в X-Forwarded-For — он нужен rate limit.
    trustProxy: config.trustProxy,
    bodyLimit: BODY_LIMIT_BYTES,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  registerErrorHandlers(app);
  await registerSecurity(app, config);

  const db = openDatabase(config.databasePath);
  const appliedMigrations = runMigrations(db);
  if (appliedMigrations.length > 0) {
    app.log.info({ migrations: appliedMigrations }, "Применены миграции базы");
  }

  const mailer = config.mail ? createMailer(config.mail) : null;
  if (!mailer) {
    app.log.warn("Почта не настроена: заявки сохраняются только в базу");
  }

  app.addHook("onClose", async () => {
    mailer?.close();
    db.close();
  });

  app.get("/health", async () => ok("ok", { status: "up" }));

  await app.register(contactsModule, {
    prefix: API_PREFIX,
    db,
    mailer,
    logger: app.log,
    rateLimit: config.contactRateLimit,
  });

  return app;
};
