export type TLangCode = "en" | "ru" | "tj";

export interface ILanguageOption {
  code: TLangCode;
  label: string;
  name: string;
  flagUrl: string;
}

export interface ITranslation {
  brand: string;
  services: string[];
  contact: string;
  darkLabel: string;
  lightLabel: string;
  modalLabel: string;
  modalHeading: string;
  emailTitle: string;
  emailSubtitle: string;
  meetingTitle: string;
  meetingSubtitle: string;
  labelName: string;
  labelEmail: string;
  labelPhone: string;
  labelMessage: string;
  labelDateTime: string;
  placeholderName: string;
  placeholderEmail: string;
  placeholderPhone: string;
  placeholderMessage: string;
  sendMessage: string;
  bookMeeting: string;
  sentSuccess: string;
  scanLabel: string;
  submitting: string;
  errorSubmit: string;
}
