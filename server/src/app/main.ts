import { ConfigError, loadConfig, type IAppConfig } from "../config/config.js";
import { buildServer } from "./server.js";

const readConfig = (): IAppConfig => {
  try {
    return loadConfig();
  } catch (error) {
    // Логгера ещё нет: пишем понятный текст напрямую и падаем на старте, а не работаем вслепую.
    if (error instanceof ConfigError) {
      process.stderr.write(`${error.message}\n`);
      process.exit(1);
    }
    throw error;
  }
};

const config = readConfig();
const app = await buildServer(config);

// SIGINT приходит и от Ctrl+C, и от службы Windows (WinSW) при остановке: дописываем ответы и закрываем базу.
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    void app.close().then(() => process.exit(0));
  });
}

try {
  await app.listen({ port: config.port, host: config.host });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
