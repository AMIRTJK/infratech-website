import React, { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Input, Textarea, Button } from "@shared/ui";
import type { ITranslation } from "@shared/config/i18n";
import { bookMeeting } from "../api/contact.api";
import { INITIAL_FORM_DATA } from "../model/constants";
import type { IContactFormData, TSubmitStatus } from "../model/types";

export interface IMeetingFormProps {
  t: ITranslation;
  onSuccess?: () => void;
}

export const MeetingForm: React.FC<IMeetingFormProps> = ({ t, onSuccess }) => {
  const [formData, setFormData] = useState<IContactFormData>(INITIAL_FORM_DATA);
  const [status, setStatus] = useState<TSubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const result = await bookMeeting(formData);

    if (result.success) {
      setStatus("success");
      setFormData(INITIAL_FORM_DATA);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          setStatus("idle");
        }, 1800);
      }
    } else {
      setStatus("error");
      setErrorMessage(result.message || t.errorSubmit);
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-3 text-center animate-in fade-in zoom-in-95 duration-200">
        <CheckCircle2 size={48} className="text-neutral-900" />
        <span className="text-lg font-bold font-brand uppercase tracking-wider text-neutral-900">
          {t.sentSuccess}
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {status === "error" && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-brand tracking-wider">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Input
        label={t.labelName}
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder={t.placeholderName}
        required
      />

      <Input
        label={t.labelEmail}
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder={t.placeholderEmail}
        required
      />

      <Input
        label={t.labelPhone}
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        placeholder={t.placeholderPhone}
        required
      />

      <Input
        label={t.labelDateTime}
        name="dateTime"
        type="datetime-local"
        value={formData.dateTime}
        onChange={handleChange}
        required
      />

      <Textarea
        label={t.labelMessage}
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder={t.placeholderMessage}
      />

      <Button
        type="submit"
        disabled={status === "submitting"}
        className="w-full mt-2"
        size="lg"
      >
        {status === "submitting" ? t.submitting : t.bookMeeting}
      </Button>
    </form>
  );
};
