import nodemailer from "nodemailer";
import type { IMailConfig } from "../config/config.js";

export interface IMailMessage {
  subject: string;
  text: string;
  html: string;
  replyTo?: string;
}

export interface IMailer {
  send(message: IMailMessage): Promise<void>;
  close(): void;
}

// Недоступный SMTP не должен держать письмо в очереди минутами: быстрее упасть и записать причину.
const CONNECTION_TIMEOUT_MS = 15_000;
const SOCKET_TIMEOUT_MS = 30_000;

/** Транспорт создаётся один раз на процесс; пул переиспользует SMTP-соединение между письмами. */
export const createMailer = (config: IMailConfig): IMailer => {
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.password },
    pool: true,
    maxConnections: 1,
    connectionTimeout: CONNECTION_TIMEOUT_MS,
    greetingTimeout: CONNECTION_TIMEOUT_MS,
    socketTimeout: SOCKET_TIMEOUT_MS,
  });

  return {
    send: async (message) => {
      await transport.sendMail({ from: config.from, to: config.to, ...message });
    },
    close: () => transport.close(),
  };
};
