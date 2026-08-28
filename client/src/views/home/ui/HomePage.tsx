"use client";

import React, { useState, useEffect } from "react";
import { HeroSection } from "@widgets/hero";
import { ContactModal } from "@features/contact-modal";
import type { TTheme } from "@shared/types";
import {
  DEFAULT_LANGUAGE_CODE,
  TRANSLATIONS,
  type TLangCode,
} from "@shared/config/i18n";
import { cn } from "@shared/lib/cn";

export const HomePage: React.FC = () => {
  const [currentLang, setCurrentLang] = useState<TLangCode>(DEFAULT_LANGUAGE_CODE);
  const [theme, setTheme] = useState<TTheme>("dark");
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

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleOpenContact = () => {
    setIsContactModalOpen(true);
  };

  const handleCloseContact = () => {
    setIsContactModalOpen(false);
  };

  const t = TRANSLATIONS[currentLang];
  const isDark = theme === "dark";

  return (
    <main
      className={cn(
        "w-full h-screen overflow-hidden transition-colors duration-500",
        isDark
          ? "bg-[#080808] text-white selection:bg-[#D4AF37] selection:text-black"
          : "bg-[#FFFFFF] text-black selection:bg-black selection:text-white"
      )}
    >
      <HeroSection
        currentLang={currentLang}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        onOpenContact={handleOpenContact}
        t={t}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={handleCloseContact}
        theme={theme}
        t={t}
      />
    </main>
  );
};
