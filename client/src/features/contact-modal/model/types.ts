export type TContactType = "email" | "meeting";

export type TSubmitStatus = "idle" | "submitting" | "success" | "error";

export interface IContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  dateTime: string;
}

export interface IContactSubmitResponse {
  success: boolean;
  message: string;
  data?: unknown;
}
