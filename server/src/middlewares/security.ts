import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { FastifyInstance } from "fastify";
import type { IAppConfig } from "../config/config.js";
import { AppError } from "../shared/errors.js";

/** Защита публичного периметра: заголовки безопасности, CORS по списку, ограничение частоты. */
export const registerSecurity = async (app: FastifyInstance, config: IAppConfig) => {
  await app.register(helmet);

  await app.register(cors, {
    // Пустой список — CORS выключен: на проде сайт и API на одном домене, разрешения не нужны.
    origin: config.corsOrigins.length > 0 ? config.corsOrigins : false,
    methods: ["GET", "POST"],
  });

  await app.register(rateLimit, {
    global: true,
    max: config.rateLimit.max,
    timeWindow: config.rateLimit.timeWindow,
    errorResponseBuilder: (_request, context) =>
      new AppError(429, `Слишком много запросов. Попробуйте снова через ${context.after}.`),
  });
};
