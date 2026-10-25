import type { IMailMessage } from "../mailer.js";

export interface IContactRequestMailInput {
  kind: "message" | "meeting";
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  meetingAt: string | null;
}

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

// Всё, что прислал посетитель, попадает в HTML письма только экранированным.
const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);

/** "2026-11-12T14:00" → "12.11.2026 14:00" без пересчёта часового пояса: время выбрал посетитель. */
const formatMeetingAt = (value: string): string => {
  const [date = "", time = ""] = value.split("T");
  const [year, month, day] = date.split("-");
  return `${day}.${month}.${year} ${time}`;
};

export const buildContactRequestMail = (input: IContactRequestMailInput): IMailMessage => {
  const isMeeting = input.kind === "meeting";
  const meetingAt = input.meetingAt ? formatMeetingAt(input.meetingAt) : null;
  const subject = isMeeting
    ? `Запись на встречу с сайта: ${input.name}, ${meetingAt ?? ""}`
    : `Сообщение с сайта: ${input.name}`;

  const fields: [string, string | null][] = [
    ["Тип заявки", isMeeting ? "Запись на встречу" : "Сообщение"],
    ["Имя", input.name],
    ["Email", input.email],
    ["Телефон", input.phone],
    ["Дата и время встречи", meetingAt],
    ["Сообщение", input.message],
  ];
  const filled = fields.filter((field): field is [string, string] => Boolean(field[1]));

  const text = filled.map(([label, value]) => `${label}: ${value}`).join("\n");
  const rows = filled
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">${label}</td>` +
        `<td style="padding:6px 0;white-space:pre-wrap">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
  const html =
    `<h2 style="font-family:Arial,sans-serif">${escapeHtml(subject)}</h2>` +
    `<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>`;

  // Ответ из почтового клиента уходит сразу посетителю, а не на служебный ящик.
  return { subject, text, html, replyTo: input.email };
};
