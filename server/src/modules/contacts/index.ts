import type { FastifyPluginAsync } from "fastify";
import type { IRateLimitConfig } from "../../config/config.js";
import type { TDatabase } from "../../db/index.js";
import type { IMailer } from "../../mail/index.js";
import type { ILogger } from "../../types/logger.js";
import { createContactsController } from "./contacts.controller.js";
import { createContactsRepository } from "./contacts.repository.js";
import { registerContactsRoutes } from "./contacts.routes.js";
import { createContactsService } from "./contacts.service.js";

export interface IContactsModuleOptions {
  db: TDatabase;
  mailer: IMailer | null;
  logger: ILogger;
  rateLimit: IRateLimitConfig;
}

/** Заявки с сайта: POST /contacts (сообщение) и POST /meetings (запись на встречу). */
export const contactsModule: FastifyPluginAsync<IContactsModuleOptions> = async (app, options) => {
  const repository = createContactsRepository(options.db);
  const service = createContactsService({
    repository,
    mailer: options.mailer,
    logger: options.logger,
  });
  registerContactsRoutes(app, createContactsController(service), options.rateLimit);
};

export { createContactsRepository } from "./contacts.repository.js";
export { contactRequestsToCsv } from "./contacts.export.js";
