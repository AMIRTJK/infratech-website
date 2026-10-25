import { buildContactRequestMail, type IMailer } from "../../mail/index.js";
import type { ILogger } from "../../types/logger.js";
import type { TContactsRepository } from "./contacts.repository.js";
import type { IContactRequestInput, IRequestMeta } from "./contacts.schema.js";

interface IDeps {
  repository: TContactsRepository;
  mailer: IMailer | null;
  logger: ILogger;
}

export type TContactsService = ReturnType<typeof createContactsService>;

export const createContactsService = ({ repository, mailer, logger }: IDeps) => {
  const deliver = async (id: number, input: IContactRequestInput, activeMailer: IMailer) => {
    try {
      await activeMailer.send(buildContactRequestMail(input));
      repository.markMailSent(id);
      logger.info({ contactRequestId: id }, "Письмо о заявке отправлено");
    } catch (error) {
      repository.markMailFailed(id, error instanceof Error ? error.message : String(error));
      logger.error({ err: error, contactRequestId: id }, "Не удалось отправить письмо о заявке");
    }
  };

  /**
   * Сохраняет заявку и ставит письмо в фон. Заявка с заполненной ловушкой не сохраняется,
   * но снаружи выглядит принятой — боту незачем знать, что его распознали.
   */
  const submit = (input: IContactRequestInput, meta: IRequestMeta, honeypot?: string): void => {
    if (honeypot) {
      logger.warn({ ip: meta.ip }, "Заявка отклонена: заполнено поле-ловушка");
      return;
    }

    const id = repository.create({ ...input, ...meta, mailStatus: mailer ? "pending" : "disabled" });
    logger.info({ contactRequestId: id, kind: input.kind }, "Заявка сохранена");
    if (!mailer) return;

    // Письмо уходит после ответа посетителю: медленный или недоступный SMTP не задерживает форму.
    setImmediate(() => {
      deliver(id, input, mailer).catch((error: unknown) => {
        logger.error({ err: error, contactRequestId: id }, "Сбой при записи статуса письма");
      });
    });
  };

  return { submit };
};
