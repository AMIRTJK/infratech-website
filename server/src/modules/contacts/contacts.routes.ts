import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { IRateLimitConfig } from "../../config/config.js";
import type { createContactsController } from "./contacts.controller.js";
import { meetingBodySchema, messageBodySchema, submitResponseSchema } from "./contacts.schema.js";

// Пути совпадают с ApiRoutes.contacts на клиенте (client/src/shared/api/api-routes.ts).
const CONTACTS_PATH = "/contacts";
const MEETINGS_PATH = "/meetings";

export const registerContactsRoutes = (
  app: FastifyInstance,
  controller: ReturnType<typeof createContactsController>,
  rateLimit: IRateLimitConfig,
) => {
  const router = app.withTypeProvider<ZodTypeProvider>();

  router.post(
    CONTACTS_PATH,
    {
      schema: { body: messageBodySchema, response: { 201: submitResponseSchema } },
      config: { rateLimit },
    },
    controller.submitMessage,
  );

  router.post(
    MEETINGS_PATH,
    {
      schema: { body: meetingBodySchema, response: { 201: submitResponseSchema } },
      config: { rateLimit },
    },
    controller.submitMeeting,
  );
};
