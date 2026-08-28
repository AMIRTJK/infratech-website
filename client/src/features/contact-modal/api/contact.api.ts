import { ApiRoutes } from "@shared/api/api-routes";
import type { IContactFormData, IContactSubmitResponse } from "../model/types";

const getApiBaseUrl = (): string => {
  return process.env["NEXT_PUBLIC_API_URL"] || "http://localhost:4000";
};

export const sendContactEmail = async (
  formData: IContactFormData
): Promise<IContactSubmitResponse> => {
  const url = `${getApiBaseUrl()}${ApiRoutes.contacts.sendEmail}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(errorData?.message || "Ошибка отправки сообщения");
    }

    const result = (await response.json()) as IContactSubmitResponse;
    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Не удалось отправить сообщение";
    return {
      success: false,
      message: errorMessage,
    };
  }
};

export const bookMeeting = async (
  formData: IContactFormData
): Promise<IContactSubmitResponse> => {
  const url = `${getApiBaseUrl()}${ApiRoutes.contacts.bookMeeting}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dateTime: formData.dateTime,
        message: formData.message,
      }),
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(errorData?.message || "Ошибка бронирования встречи");
    }

    const result = (await response.json()) as IContactSubmitResponse;
    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Не удалось забронировать встречу";
    return {
      success: false,
      message: errorMessage,
    };
  }
};
