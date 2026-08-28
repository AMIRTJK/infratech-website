import React, { useState } from "react";
import type { TTheme } from "@shared/types";
import { Modal } from "@shared/ui";
import type { ITranslation } from "@shared/config/i18n";
import { ContactTypeTabs } from "./ContactTypeTabs";
import { EmailForm } from "./EmailForm";
import { MeetingForm } from "./MeetingForm";
import type { TContactType } from "../model/types";

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
  const [activeType, setActiveType] = useState<TContactType>("email");

  const handleClose = () => {
    onClose();
  };

  const handleTypeSelect = (type: TContactType) => {
    setActiveType(type);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      theme={theme}
      title={t.modalLabel}
      subtitle={t.modalHeading}
      className="max-w-[600px]"
    >
      <ContactTypeTabs
        activeType={activeType}
        onSelectType={handleTypeSelect}
        theme={theme}
        t={t}
      />

      {activeType === "email" && (
        <EmailForm t={t} theme={theme} onSuccess={handleClose} />
      )}
      {activeType === "meeting" && (
        <MeetingForm t={t} theme={theme} onSuccess={handleClose} />
      )}
    </Modal>
  );
};
