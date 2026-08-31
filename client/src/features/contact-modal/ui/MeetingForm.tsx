import React, { useState } from "react";
import { Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import type { TTheme } from "@shared/types";
import { Input, Textarea, Button, DateTimePicker } from "@shared/ui";
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

  const handleDateTimeChange = (dateTimeValue: string) => {
    setFormData((prev) => ({
      ...prev,
      dateTime: dateTimeValue,
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
      <div className="flex flex-col items-center justify-center py-12 gap-2.5 text-center animate-in fade-in zoom-in-95 duration-200 h-full min-h-[300px]">
        <CheckCircle2
          size={44}
          className={isDark ? "text-[#D4AF37]" : "text-black"}
        />
        <span
          className={cn(
            "text-sm font-bold font-brand uppercase tracking-wider",
            isDark ? "gold-gradient-text" : "text-black"
          )}
        >
          {t.sentSuccess}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full justify-between gap-3">
      <div className="flex items-center gap-2.5 pb-2.5 border-b border-black/8 dark:border-white/8">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            isDark ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "bg-black/5 text-black"
          )}
        >
          <Calendar size={16} />
        </div>
        <div className="flex flex-col min-w-0">
          <h3
            className={cn(
              "text-xs sm:text-sm font-bold uppercase tracking-wider font-brand leading-tight",
              isDark ? "text-neutral-100" : "text-neutral-900"
            )}
          >
            {t.meetingTitle}
          </h3>
          <p
            className={cn(
              "text-[10px] sm:text-[11px] font-brand tracking-normal leading-tight mt-0.5",
              isDark ? "text-neutral-400" : "text-neutral-500"
            )}
          >
            {t.meetingSubtitle}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 flex-1 justify-between">
        {status === "error" && (
          <div
            className={cn(
              "flex items-center gap-1.5 p-2 rounded-lg border text-[11px] font-brand",
              isDark
                ? "bg-red-950/40 border-red-800/60 text-red-300"
                : "bg-red-50 border-red-200 text-red-700"
            )}
          >
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          </div>

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

          <DateTimePicker
            label={t.labelDateTime}
            value={formData.dateTime}
            onChange={handleDateTimeChange}
            theme={theme}
            placeholder={t.labelDateTime}
            required
          />

          <Textarea
            label={t.labelMessage}
            name="message"
            theme={theme}
            rows={2}
            value={formData.message}
            onChange={handleChange}
            placeholder={t.placeholderMessage}
          />
        </div>

        <Button
          type="submit"
          theme={theme}
          disabled={status === "submitting"}
          className="w-full mt-2"
          size="md"
        >
          {status === "submitting" ? t.submitting : t.bookMeeting}
        </Button>
      </form>
    </div>
  );
};
