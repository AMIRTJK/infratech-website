import { API_BASE_URL } from "@shared/config/env";
import { ApiRoutes } from "./api-routes";

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

const CONNECTION_ERROR: IApiResponse<never> = {
  success: false,
  message: "Не удалось связаться с сервером. Проверьте интернет и попробуйте ещё раз.",
};

// Backend отвечает единым конвертом и на ошибки (400, 429), поэтому тело читаем при любом статусе.
const request = async <T>(endpoint: string, init?: RequestInit): Promise<IApiResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
    });
    return (await response.json()) as IApiResponse<T>;
  } catch (error) {
    console.warn(`[API] ${init?.method ?? "GET"} ${endpoint}`, error);
    return CONNECTION_ERROR;
  }
};

export const apiClient = {
  get: <T>(endpoint: string): Promise<IApiResponse<T>> => request<T>(endpoint),

  post: <T, B = unknown>(endpoint: string, body: B): Promise<IApiResponse<T>> =>
    request<T>(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
};

export { ApiRoutes };
