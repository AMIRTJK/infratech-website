import { toCsv } from "../../shared/lib/csv.js";
import type { IContactRequest, TContactRequestKind, TMailStatus } from "./contacts.schema.js";

const KIND_LABELS: Record<TContactRequestKind, string> = {
  message: "Сообщение",
  meeting: "Встреча",
};

const MAIL_STATUS_LABELS: Record<TMailStatus, string> = {
  pending: "отправляется",
  sent: "отправлено",
  failed: "ошибка отправки",
  disabled: "почта не настроена",
};

const HEADERS = [
  "№",
  "Получена",
  "Тип",
  "Имя",
  "Email",
  "Телефон",
  "Дата встречи",
  "Сообщение",
  "Письмо",
  "Ошибка письма",
];

/** Время в базе — UTC; в таблице показываем в часовом поясе машины, где делается выгрузка. */
const formatCreatedAt = (value: string): string => new Date(value).toLocaleString("ru-RU");

export const contactRequestsToCsv = (requests: IContactRequest[]): string =>
  toCsv(
    HEADERS,
    requests.map((request) => [
      request.id,
      formatCreatedAt(request.createdAt),
      KIND_LABELS[request.kind],
      request.name,
      request.email,
      request.phone,
      request.meetingAt?.replace("T", " ") ?? null,
      request.message,
      MAIL_STATUS_LABELS[request.mailStatus],
      request.mailError,
    ]),
  );
