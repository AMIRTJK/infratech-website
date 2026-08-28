import React from "react";
import { LanguageSwitcher } from "@features/language-switcher";
import { QrCodeBlock } from "@features/qr-contact";
import type { TLangCode, ITranslation } from "@shared/config/i18n";
import { cn } from "@shared/lib/cn";
import { HeroBrand } from "./HeroBrand";
import { HeroServices } from "./HeroServices";

export interface IHeroSectionProps {
  currentLang: TLangCode;
  onLanguageChange: (lang: TLangCode) => void;
  onOpenContact: () => void;
  t: ITranslation;
  className?: string;
}

export const HeroSection: React.FC<IHeroSectionProps> = ({
  currentLang,
  onLanguageChange,
  onOpenContact,
  t,
  className,
}) => {
  return (
    <section
      className={cn(
        "relative w-full h-screen overflow-hidden flex items-center justify-center p-3 sm:p-6 md:p-8 bg-white",
        className
      )}
    >
      {/* Внутренняя центрированная рамка */}
      <div className="relative w-full max-w-[1360px] h-[calc(100vh-24px)] sm:h-[calc(100vh-48px)] md:h-[calc(100vh-64px)] rounded-2xl sm:rounded-3xl border border-black/10 bg-white flex flex-col items-center justify-center p-4 sm:p-8 shadow-xs overflow-hidden">
        {/* Переключатель языка в верхнем правом углу карточки */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-20">
          <LanguageSwitcher
            currentLang={currentLang}
            onLanguageChange={onLanguageChange}
          />
        </div>

        {/* Центральный контент */}
        <div className="flex flex-col items-center justify-center text-center max-w-4xl w-full my-auto py-4">
          <HeroBrand brand={t.brand} />

          <div className="mt-6 sm:mt-8 md:mt-10">
            <HeroServices services={t.services} />
          </div>

          <button
            type="button"
            onClick={onOpenContact}
            className="mt-8 sm:mt-10 md:mt-12 px-10 sm:px-14 py-3 sm:py-3.5 border border-black bg-transparent hover:bg-black text-black hover:text-white font-brand text-[11px] sm:text-xs uppercase tracking-[0.25em] transition-all duration-300 cursor-pointer shadow-xs hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            {t.contact}
          </button>

          <div className="mt-5 sm:mt-6 md:mt-8">
            <QrCodeBlock label={t.scanLabel} onOpenContact={onOpenContact} />
          </div>
        </div>
      </div>
    </section>
  );
};
