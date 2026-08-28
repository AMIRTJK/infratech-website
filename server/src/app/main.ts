// Технический минимум для запуска dev-сервера: поднять HTTP и ответить на проверку живости.
// Сборка сервера, регистрация плагинов и модулей появятся на этапе разработки backend.
import "dotenv/config";
import Fastify from "fastify";

const PORT = Number(process.env.PORT ?? 4000);
const HOST = process.env.HOST ?? "0.0.0.0";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

const app = Fastify({
  logger: IS_PRODUCTION
    ? { level: process.env.LOG_LEVEL ?? "info" }
    : { level: process.env.LOG_LEVEL ?? "info", transport: { target: "pino-pretty" } },
});

app.get("/health", async () => ({ success: true, message: "ok", data: { status: "up" } }));

// SIGTERM/SIGINT: не обрываем соединения на полуслове — полноценный graceful shutdown
// (закрытие SQLite, дозапись очереди писем) добавляется вместе с этими модулями.
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void app.close().then(() => process.exit(0));
  });
}

try {
  await app.listen({ port: PORT, host: HOST });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
