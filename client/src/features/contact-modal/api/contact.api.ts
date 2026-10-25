import { apiClient, ApiRoutes } from "@shared/api";
import type { IContactFormData, IContactSubmitResponse } from "../model/types";

/**
 * Отправка сообщения (Email)
 */
export const sendContactEmail = (formData: IContactFormData): Promise<IContactSubmitResponse> =>
  apiClient.post(ApiRoutes.contacts.sendEmail, {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    message: formData.message,
    website: formData.website,
  });

/**
 * Запись на встречу (Meeting)
 */
export const bookMeeting = (formData: IContactFormData): Promise<IContactSubmitResponse> =>
  apiClient.post(ApiRoutes.contacts.bookMeeting, {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    dateTime: formData.dateTime,
    message: formData.message,
    website: formData.website,
  });
