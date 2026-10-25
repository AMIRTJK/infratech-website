import { z } from "zod";

const NAME_MAX = 100;
const EMAIL_MAX = 254;
const MESSAGE_MAX = 3000;
const HONEYPOT_MAX = 200;
const PHONE_PATTERN = /^[+\d\s()-]{5,30}$/;
// Формат DateTimePicker на клиенте: локальное время посетителя без часового пояса.
const MEETING_AT_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const nameField = z
  .string({ error: "Укажите имя" })
  .trim()
  .min(2, "Имя слишком короткое")
  .max(NAME_MAX, "Имя слишком длинное");

const emailField = z
  .string({ error: "Укажите email" })
  .trim()
  .max(EMAIL_MAX, "Email слишком длинный")
  .pipe(z.email("Некорректный email"));

const requiredPhone = z
  .string({ error: "Укажите телефон" })
  .trim()
  .regex(PHONE_PATTERN, "Некорректный номер телефона");

const optionalPhone = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || null)
  .refine((value) => value === null || PHONE_PATTERN.test(value), "Некорректный номер телефона");

const requiredMessage = z
  .string({ error: "Напишите сообщение" })
  .trim()
  .min(1, "Напишите сообщение")
  .max(MESSAGE_MAX, "Сообщение слишком длинное");

const optionalMessage = z
  .string()
  .trim()
  .max(MESSAGE_MAX, "Сообщение слишком длинное")
  .optional()
  .transform((value) => value || null);

const meetingAtField = z
  .string({ error: "Выберите дату и время встречи" })
  .regex(MEETING_AT_PATTERN, "Выберите дату и время встречи")
  .refine((value) => !Number.isNaN(Date.parse(value)), "Некорректная дата встречи");

// Скрытое поле-ловушка: человек его не видит и не заполняет, бот — заполняет.
const honeypotField = z.string().max(HONEYPOT_MAX).optional();

export const messageBodySchema = z.object({
  name: nameField,
  email: emailField,
  phone: optionalPhone,
  message: requiredMessage,
  website: honeypotField,
});

export const meetingBodySchema = z.object({
  name: nameField,
  email: emailField,
  phone: requiredPhone,
  dateTime: meetingAtField,
  message: optionalMessage,
  website: honeypotField,
});

export const submitResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.null(),
});

export type TMessageBody = z.output<typeof messageBodySchema>;
export type TMeetingBody = z.output<typeof meetingBodySchema>;

export type TContactRequestKind = "message" | "meeting";
export type TMailStatus = "pending" | "sent" | "failed" | "disabled";

export interface IContactRequestInput {
  kind: TContactRequestKind;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  meetingAt: string | null;
}

export interface IRequestMeta {
  ip: string;
  userAgent: string | null;
}

export interface IContactRequest extends IContactRequestInput, IRequestMeta {
  id: number;
  mailStatus: TMailStatus;
  mailError: string | null;
  createdAt: string;
  mailedAt: string | null;
}
