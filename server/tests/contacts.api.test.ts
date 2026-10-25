import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { buildServer } from "../src/app/server.js";
import type { IAppConfig } from "../src/config/config.js";

const TEST_CONFIG: IAppConfig = {
  isProduction: true,
  port: 0,
  host: "127.0.0.1",
  logLevel: "silent",
  trustProxy: false,
  corsOrigins: [],
  databasePath: ":memory:",
  mail: null,
  rateLimit: { max: 100, timeWindow: "1 minute" },
  contactRateLimit: { max: 3, timeWindow: "1 minute" },
};

const VALID_MESSAGE = { name: "Иван", email: "ivan@example.com", phone: "", message: "Здравствуйте" };

describe("API заявок", () => {
  let app: Awaited<ReturnType<typeof buildServer>>;

  before(async () => {
    app = await buildServer(TEST_CONFIG);
  });
  after(async () => {
    await app.close();
  });

  it("принимает сообщение и отвечает конвертом", async () => {
    const response = await app.inject({ method: "POST", url: "/api/v1/contacts", payload: VALID_MESSAGE });
    assert.equal(response.statusCode, 201);
    assert.equal(response.json().success, true);
  });

  it("отклоняет некорректный email с понятным сообщением", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/contacts",
      payload: { ...VALID_MESSAGE, email: "не-почта" },
    });
    assert.equal(response.statusCode, 400);
    assert.equal(response.json().success, false);
    assert.equal(response.json().message, "Некорректный email");
  });

  it("требует дату встречи", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/meetings",
      payload: { ...VALID_MESSAGE, phone: "+992 900 00 00 00", dateTime: "" },
    });
    assert.equal(response.statusCode, 400);
  });

  it("ограничивает частоту отправки формы", async () => {
    const statuses: number[] = [];
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/meetings",
        payload: { ...VALID_MESSAGE, phone: "+992 900 00 00 00", dateTime: "2026-11-12T14:00" },
      });
      statuses.push(response.statusCode);
    }
    assert.deepEqual(statuses, [201, 201, 429]);
  });

  it("отвечает 404 конвертом на неизвестный путь", async () => {
    const response = await app.inject({ method: "GET", url: "/api/v1/unknown" });
    assert.equal(response.statusCode, 404);
    assert.equal(response.json().success, false);
  });
});
