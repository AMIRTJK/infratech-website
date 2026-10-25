import type { FastifyError, FastifyInstance } from "fastify";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { AppError } from "../shared/errors.js";
import { fail } from "../shared/lib/envelope.js";

const CLIENT_ERROR_MESSAGES: Record<number, string> = {
  413: "Слишком большой запрос",
  415: "Неподдерживаемый формат запроса",
};
const DEFAULT_CLIENT_ERROR = "Некорректный запрос";
const SERVER_ERROR = "Внутренняя ошибка сервера. Попробуйте позже.";

/** Все ошибки уходят наружу единым конвертом; стек и детали — только в лог. */
export const registerErrorHandlers = (app: FastifyInstance) => {
  app.setErrorHandler<FastifyError>((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
      const fields = error.validation.map((issue) => ({
        field: issue.instancePath.replace(/^\//, ""),
        message: issue.message ?? DEFAULT_CLIENT_ERROR,
      }));
      return reply.code(400).send(fail(fields[0]?.message ?? DEFAULT_CLIENT_ERROR, { fields }));
    }

    if (error instanceof AppError) {
      return reply.code(error.statusCode).send(fail(error.message, error.data));
    }

    const statusCode = error.statusCode ?? 500;
    if (statusCode < 500) {
      request.log.info({ err: error }, "Отклонён некорректный запрос");
      return reply
        .code(statusCode)
        .send(fail(CLIENT_ERROR_MESSAGES[statusCode] ?? DEFAULT_CLIENT_ERROR));
    }

    request.log.error({ err: error }, "Необработанная ошибка");
    return reply.code(500).send(fail(SERVER_ERROR));
  });

  app.setNotFoundHandler((_request, reply) => reply.code(404).send(fail("Ресурс не найден")));
};
