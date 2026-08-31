import React from "react";
import type { TTheme } from "@shared/types";
import { Modal } from "@shared/ui";
import type { ITranslation } from "@shared/config/i18n";
import { cn } from "@shared/lib/cn";
import { EmailForm } from "./EmailForm";
import { MeetingForm } from "./MeetingForm";

export interface IContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: TTheme;
  t: ITranslation;
}

export const ContactModal: React.FC<IContactModalProps> = ({
  isOpen,
  onClose,
  theme = "dark",
  t,
}) => {
  const isDark = theme === "dark";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      theme={theme}
      title={t.modalLabel}
      subtitle={t.modalHeading}
      className="max-w-[940px]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch pt-1">
        <div
          className={cn(
            "p-4 sm:p-5 rounded-xl border flex flex-col justify-between transition-colors",
            isDark
              ? "border-white/10 bg-white/[0.03]"
              : "border-neutral-200 bg-neutral-50/70"
          )}
        >
          <EmailForm t={t} theme={theme} onSuccess={onClose} />
        </div>

        <div
          className={cn(
            "p-4 sm:p-5 rounded-xl border flex flex-col justify-between transition-colors",
            isDark
              ? "border-white/10 bg-white/[0.03]"
              : "border-neutral-200 bg-neutral-50/70"
          )}
        >
          <MeetingForm t={t} theme={theme} onSuccess={onClose} />
        </div>
      </div>
    </Modal>
  );
};
