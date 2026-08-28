import type { IContactFormData, IContactSubmitResponse } from "../model/types";

/**
 * Отправка сообщения (Email)
 */
export const sendContactEmail = async (
  formData: IContactFormData
): Promise<IContactSubmitResponse> => {
  void formData;
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
  void formData;
  // Имитация небольшой сетевой задержки для проверки UI
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    message: "Встреча успешно запланирована!",
  };
};
