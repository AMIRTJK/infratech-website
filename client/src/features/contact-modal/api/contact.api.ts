import { ApiRoutes } from "@shared/api";
import type { IContactFormData, IContactSubmitResponse } from "../model/types";

/**
 * Отправка сообщения (Email)
 */
export const sendContactEmail = async (
  formData: IContactFormData
): Promise<IContactSubmitResponse> => {
  console.log(`[SUBMIT Email] Отправка на ${ApiRoutes.contacts.sendEmail}:`, {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    message: formData.message,
    timestamp: new Date().toISOString(),
  });

  // Имитация небольшой сетевой задержки для проверки UI
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    message: "Сообщение успешно отправлено!",
  };
};

/**
 * Запись на встречу (Meeting)
 */
export const bookMeeting = async (
  formData: IContactFormData
): Promise<IContactSubmitResponse> => {
  console.log(`[SUBMIT Meeting] Отправка на ${ApiRoutes.contacts.bookMeeting}:`, {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    dateTime: formData.dateTime,
    message: formData.message,
    timestamp: new Date().toISOString(),
  });

  // Имитация небольшой сетевой задержки для проверки UI
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    message: "Встреча успешно запланирована!",
  };
};
