import React from "react";
import { LanguageSwitcher } from "@features/language-switcher";
import { ThemeSwitcher } from "@features/theme-switcher";
import { QrCodeBlock } from "@features/qr-contact";
import type { TTheme } from "@shared/types";
import type { TLangCode, ITranslation } from "@shared/config/i18n";
import { cn } from "@shared/lib/cn";
import { HeroBrand } from "./HeroBrand";
import { HeroServices } from "./HeroServices";

export interface IHeroSectionProps {
  currentLang: TLangCode;
  onLanguageChange: (lang: TLangCode) => void;
  theme: TTheme;
  onThemeToggle: () => void;
  onOpenContact: () => void;
  t: ITranslation;
  className?: string;
}

export const HeroSection: React.FC<IHeroSectionProps> = ({
  currentLang,
  onLanguageChange,
  theme,
  onThemeToggle,
  onOpenContact,
  t,
  className,
}) => {
  const isDark = theme === "dark";

  return (
    <section
      className={cn(
        "relative w-full min-h-dvh h-auto sm:h-screen overflow-y-auto sm:overflow-hidden flex flex-col justify-between p-3.5 sm:p-6 md:p-8 transition-colors duration-500",
        isDark ? "bg-[#080808] text-white" : "bg-[#FFFFFF] text-black",
        className,
      )}
    >
      <div className="w-full max-w-7xl mx-auto flex items-center justify-end gap-2 z-20 shrink-0">
        <ThemeSwitcher theme={theme} onThemeToggle={onThemeToggle} />
        <LanguageSwitcher
          currentLang={currentLang}
          onLanguageChange={onLanguageChange}
          theme={theme}
        />
      </div>

      <div className="flex flex-col items-center justify-center text-center max-w-6xl mx-auto w-full my-auto py-3 sm:py-6">
        <HeroBrand brand={t.brand} theme={theme} />

        <div className="mt-4 sm:mt-8 md:mt-10 w-full flex justify-center">
          <HeroServices services={t.services} theme={theme} />
        </div>

        <button
          type="button"
          onClick={onOpenContact}
          className={cn(
            "mt-5 sm:mt-9 md:mt-11 px-8 sm:px-14 py-2.5 sm:py-3.5 border font-brand text-[10.5px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2",
            isDark
              ? "border-white/25 bg-transparent hover:bg-[#D4AF37]/12 hover:border-[#D4AF37] text-neutral-300 hover:text-[#D4AF37] shadow-[0_0_16px_rgba(212,175,55,0.15)] hover:shadow-[0_0_24px_6px_rgba(212,175,55,0.35)] focus:ring-[#D4AF37]"
              : "border-black bg-transparent hover:bg-black text-black hover:text-white transition-colors duration-300 focus:ring-black",
          )}
        >
          {t.contact}
        </button>

        <div className="mt-4 sm:mt-6 md:mt-8">
          <QrCodeBlock label={t.scanLabel} theme={theme} onOpenContact={onOpenContact} />
        </div>
      </div>
    </section>
  );
};
