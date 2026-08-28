"use client";

import React, { useState, useEffect } from "react";
import { HeroSection } from "@widgets/hero";
import { ContactModal } from "@features/contact-modal";
import {
  DEFAULT_LANGUAGE_CODE,
  TRANSLATIONS,
  type TLangCode,
} from "@shared/config/i18n";

export const HomePage: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<TLangCode>(DEFAULT_LANGUAGE_CODE);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("openContact") === "true") {
        setIsContactModalOpen(true);
      }
    }
  }, []);

  const handleLanguageChange = (lang: TLangCode) => {
    setCurrentLang(lang);
  };

  const handleOpenContact = () => {
    setIsContactModalOpen(true);
  };

  const handleCloseContact = () => {
    setIsContactModalOpen(false);
  };

  const t = TRANSLATIONS[currentLang];

  return (
    <main className="w-full h-screen overflow-hidden bg-white text-neutral-900 selection:bg-neutral-900 selection:text-white">
      <HeroSection
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        onOpenContact={handleOpenContact}
        t={t}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={handleCloseContact}
        t={t}
      />
    </main>
  );
};
