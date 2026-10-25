import type { TDatabase } from "../../db/index.js";
import type {
  IContactRequest,
  IContactRequestInput,
  IRequestMeta,
  TMailStatus,
} from "./contacts.schema.js";

interface IInsertParams extends IContactRequestInput, IRequestMeta {
  mailStatus: TMailStatus;
}

const MAIL_ERROR_MAX = 1000;

export type TContactsRepository = ReturnType<typeof createContactsRepository>;

/** Prepared statements создаются один раз при сборке модуля, а не на каждый запрос. */
export const createContactsRepository = (db: TDatabase) => {
  const insertStatement = db.prepare<IInsertParams>(`
    INSERT INTO contact_requests (kind, name, email, phone, message, meeting_at, ip, user_agent, mail_status)
    VALUES (@kind, @name, @email, @phone, @message, @meetingAt, @ip, @userAgent, @mailStatus)
  `);

  const markSentStatement = db.prepare<[number]>(`
    UPDATE contact_requests
    SET mail_status = 'sent', mail_error = NULL, mailed_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
    WHERE id = ?
  `);

  const markFailedStatement = db.prepare<[string, number]>(`
    UPDATE contact_requests SET mail_status = 'failed', mail_error = ? WHERE id = ?
  `);

  const listAllStatement = db.prepare<[], IContactRequest>(`
    SELECT id, kind, name, email, phone, message, meeting_at AS meetingAt, ip, user_agent AS userAgent,
           mail_status AS mailStatus, mail_error AS mailError, created_at AS createdAt, mailed_at AS mailedAt
    FROM contact_requests
    ORDER BY created_at DESC
  `);

  return {
    create: (params: IInsertParams): number => Number(insertStatement.run(params).lastInsertRowid),
    markMailSent: (id: number): void => {
      markSentStatement.run(id);
    },
    markMailFailed: (id: number, reason: string): void => {
      markFailedStatement.run(reason.slice(0, MAIL_ERROR_MAX), id);
    },
    listAll: (): IContactRequest[] => listAllStatement.all(),
  };
};
