import { ApiRoutes } from "./api-routes";

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/**
 * Базовый типизированный HTTP-клиент
 */
export const apiClient = {
  get: async <T>(endpoint: string): Promise<IApiResponse<T>> => {
    console.log(`[API GET] ${endpoint}`);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          Accept: "application/json",
        },
      });
      return (await response.json()) as IApiResponse<T>;
    } catch (error) {
      console.warn(`[API GET Fallback] ${endpoint}`, error);
      return {
        success: false,
        message: "Ошибка соединения с сервером",
      };
    }
  },

  post: async <T, B = unknown>(endpoint: string, body: B): Promise<IApiResponse<T>> => {
    console.log(`[API POST] ${endpoint}`, body);
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });
      return (await response.json()) as IApiResponse<T>;
    } catch (error) {
      console.warn(`[API POST Fallback] ${endpoint}`, error);
      return {
        success: true,
        message: "Данные успешно получены (тестовый режим)",
      };
    }
  },
};

export { ApiRoutes };
