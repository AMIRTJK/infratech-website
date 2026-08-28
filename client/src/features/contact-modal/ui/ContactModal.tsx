import React, { useState } from "react";
import { Modal } from "@shared/ui";
import type { ITranslation } from "@shared/config/i18n";
import { ContactTypeTabs } from "./ContactTypeTabs";
import { EmailForm } from "./EmailForm";
import { MeetingForm } from "./MeetingForm";
import type { TContactType } from "../model/types";

export interface IContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: ITranslation;
}

export const ContactModal: React.FC<IContactModalProps> = ({
  isOpen,
  onClose,
  t,
}) => {
  const [activeType, setActiveType] = useState<TContactType | null>("email");

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
      title={t.modalLabel}
      subtitle={t.modalHeading}
    >
      <ContactTypeTabs
        activeType={activeType}
        onSelectType={handleTypeSelect}
        t={t}
      />

      {activeType === "email" && <EmailForm t={t} onSuccess={handleClose} />}
      {activeType === "meeting" && <MeetingForm t={t} onSuccess={handleClose} />}
    </Modal>
  );
};
