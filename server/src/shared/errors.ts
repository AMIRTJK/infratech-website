/** Доменная ошибка с HTTP-статусом и понятным пользователю сообщением; ловится общим обработчиком. */
export class AppError extends Error {
  override name = "AppError";

  constructor(
    readonly statusCode: number,
    message: string,
    readonly data: unknown = null,
  ) {
    super(message);
  }
}
