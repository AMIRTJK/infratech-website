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

const SERVICE_UNAVAILABLE: IApiResponse<never> = {
  success: false,
  message: "Сервис временно недоступен. Попробуйте позже.",
};

// Backend отвечает единым конвертом и на ошибки (400, 429), поэтому тело читаем при любом статусе.
// Не-JSON ответ приходит от прокси, когда backend лежит (502), — это не проблема сети посетителя.
const request = async <T>(endpoint: string, init?: RequestInit): Promise<IApiResponse<T>> => {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
    });
  } catch (error) {
    console.warn(`[API] ${init?.method ?? "GET"} ${endpoint}`, error);
    return CONNECTION_ERROR;
  }

  try {
    return (await response.json()) as IApiResponse<T>;
  } catch (error) {
    console.warn(`[API] ${response.status} ${endpoint}`, error);
    return SERVICE_UNAVAILABLE;
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
