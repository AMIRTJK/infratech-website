import React from "react";
import { LanguageSwitcher } from "@features/language-switcher";
import { Button } from "@shared/ui";
import type { TLangCode, ITranslation } from "@shared/config/i18n";
import { cn } from "@shared/lib/cn";

export interface IHeroHeaderProps {
  currentLang: TLangCode;
  onLanguageChange: (lang: TLangCode) => void;
  onOpenContact: () => void;
  t: ITranslation;
  className?: string;
}

export const HeroHeader: React.FC<IHeroHeaderProps> = ({
  currentLang,
  onLanguageChange,
  onOpenContact,
  t,
  className,
}) => {
  return (
    <header
      className={cn(
        "w-full flex items-center justify-between px-6 py-5 sm:px-10 sm:py-8 max-w-7xl mx-auto",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <LanguageSwitcher
          currentLang={currentLang}
          onLanguageChange={onLanguageChange}
        />
      </div>

      <Button
        variant="outline"
        size="md"
        onClick={onOpenContact}
        className="rounded-lg shadow-xs"
      >
        {t.contact}
      </Button>
    </header>
  );
};
