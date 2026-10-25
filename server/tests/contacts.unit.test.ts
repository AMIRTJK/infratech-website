import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseConfig } from "../src/config/config.js";
import { buildContactRequestMail } from "../src/mail/index.js";
import { meetingBodySchema, messageBodySchema } from "../src/modules/contacts/contacts.schema.js";
import { toCsv } from "../src/shared/lib/csv.js";

describe("схемы заявок", () => {
  it("превращает пустой телефон в null", () => {
    const body = messageBodySchema.parse({ name: "Иван", email: " ivan@example.com ", phone: "", message: "Привет" });
    assert.equal(body.phone, null);
    assert.equal(body.email, "ivan@example.com");
  });

  it("требует формат даты встречи из DateTimePicker", () => {
    const base = { name: "Иван", email: "ivan@example.com", phone: "+992900000000" };
    assert.equal(meetingBodySchema.safeParse({ ...base, dateTime: "2026-11-12T14:00" }).success, true);
    assert.equal(meetingBodySchema.safeParse({ ...base, dateTime: "завтра" }).success, false);
  });
});

describe("письмо о заявке", () => {
  it("экранирует HTML из полей посетителя", () => {
    const mail = buildContactRequestMail({
      kind: "message",
      name: "<script>",
      email: "a@b.tj",
      phone: null,
      message: "x",
      meetingAt: null,
    });
    assert.ok(!mail.html.includes("<script>"));
    assert.equal(mail.replyTo, "a@b.tj");
  });
});

describe("CSV", () => {
  it("экранирует разделитель и кавычки", () => {
    const csv = toCsv(["a"], [['x;"y"']]);
    assert.equal(csv, '﻿a\r\n"x;""y"""\r\n');
  });
});

describe("config", () => {
  it("без почтовых переменных выключает почту", () => {
    assert.equal(parseConfig({ SMTP_HOST: "", MAIL_TO: "" }).mail, null);
  });

  it("в разработке без CORS_ORIGINS разрешает dev-сервер Next, на проде — нет", () => {
    assert.deepEqual(parseConfig({}).corsOrigins, ["http://localhost:3000"]);
    assert.deepEqual(parseConfig({ NODE_ENV: "production" }).corsOrigins, []);
  });

  it("падает, если почта настроена частично", () => {
    assert.throws(() => parseConfig({ SMTP_HOST: "smtp.gmail.com" }), /не полностью/);
  });
});
