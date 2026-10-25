/** Минимальный интерфейс логгера: сервисы пишут логи, не зная о Fastify и pino. */
export interface ILogger {
  info(details: object, message: string): void;
  warn(details: object, message: string): void;
  error(details: object, message: string): void;
}
