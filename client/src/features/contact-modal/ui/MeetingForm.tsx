import React, { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { TTheme } from "@features/theme-switcher";
import { Input, Textarea, Button } from "@shared/ui";
import type { ITranslation } from "@shared/config/i18n";
import { cn } from "@shared/lib/cn";
import { bookMeeting } from "../api/contact.api";
import { INITIAL_FORM_DATA } from "../model/constants";
import type { IContactFormData, TSubmitStatus } from "../model/types";

export interface IMeetingFormProps {
  t: ITranslation;
  theme?: TTheme;
  onSuccess?: () => void;
}

export const MeetingForm: React.FC<IMeetingFormProps> = ({
  t,
  theme = "dark",
  onSuccess,
}) => {
  const [formData, setFormData] = useState<IContactFormData>(INITIAL_FORM_DATA);
  const [status, setStatus] = useState<TSubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const isDark = theme === "dark";

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
        <CheckCircle2
          size={48}
          className={isDark ? "text-[#D4AF37]" : "text-black"}
        />
        <span
          className={cn(
            "text-lg font-bold font-brand uppercase tracking-wider",
            isDark ? "gold-gradient-text" : "text-black"
          )}
        >
          {t.sentSuccess}
        </span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {status === "error" && (
        <div
          className={cn(
            "flex items-center gap-2 p-3 rounded-lg border text-xs font-brand tracking-wider",
            isDark
              ? "bg-red-950/40 border-red-800/60 text-red-300"
              : "bg-red-50 border-red-200 text-red-700"
          )}
        >
          <AlertCircle
            size={16}
            className={cn("shrink-0", isDark ? "text-red-400" : "text-red-600")}
          />
          <span>{errorMessage}</span>
        </div>
      )}

      <Input
        label={t.labelName}
        name="name"
        theme={theme}
        value={formData.name}
        onChange={handleChange}
        placeholder={t.placeholderName}
        required
      />

      <Input
        label={t.labelEmail}
        name="email"
        type="email"
        theme={theme}
        value={formData.email}
        onChange={handleChange}
        placeholder={t.placeholderEmail}
        required
      />

      <Input
        label={t.labelPhone}
        name="phone"
        type="tel"
        theme={theme}
        value={formData.phone}
        onChange={handleChange}
        placeholder={t.placeholderPhone}
        required
      />

      <Input
        label={t.labelDateTime}
        name="dateTime"
        type="datetime-local"
        theme={theme}
        value={formData.dateTime}
        onChange={handleChange}
        required
      />

      <Textarea
        label={t.labelMessage}
        name="message"
        theme={theme}
        value={formData.message}
        onChange={handleChange}
        placeholder={t.placeholderMessage}
      />

      <Button
        type="submit"
        theme={theme}
        disabled={status === "submitting"}
        className="w-full mt-2"
        size="lg"
      >
        {status === "submitting" ? t.submitting : t.bookMeeting}
      </Button>
    </form>
  );
};
