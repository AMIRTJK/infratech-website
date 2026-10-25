import type { FastifyReply, FastifyRequest } from "fastify";
import { ok } from "../../shared/lib/envelope.js";
import type { IRequestMeta, TMeetingBody, TMessageBody } from "./contacts.schema.js";
import type { TContactsService } from "./contacts.service.js";

const USER_AGENT_MAX = 300;

const readMeta = (request: FastifyRequest): IRequestMeta => ({
  ip: request.ip,
  userAgent: request.headers["user-agent"]?.slice(0, USER_AGENT_MAX) ?? null,
});

export const createContactsController = (service: TContactsService) => ({
  submitMessage: async (request: FastifyRequest<{ Body: TMessageBody }>, reply: FastifyReply) => {
    const { name, email, phone, message, website } = request.body;
    service.submit(
      { kind: "message", name, email, phone, message, meetingAt: null },
      readMeta(request),
      website,
    );
    return reply.code(201).send(ok("Сообщение отправлено. Мы скоро с вами свяжемся.", null));
  },

  submitMeeting: async (request: FastifyRequest<{ Body: TMeetingBody }>, reply: FastifyReply) => {
    const { name, email, phone, dateTime, message, website } = request.body;
    service.submit(
      { kind: "meeting", name, email, phone, message, meetingAt: dateTime },
      readMeta(request),
      website,
    );
    return reply.code(201).send(ok("Заявка на встречу принята. Мы подтвердим время.", null));
  },
});
