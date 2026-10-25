/** Единый конверт ответа API (AGENTS.md §10). */
export interface IEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export const ok = <T>(message: string, data: T): IEnvelope<T> => ({ success: true, message, data });

export const fail = (message: string, data: unknown = null): IEnvelope<unknown> => ({
  success: false,
  message,
  data,
});
