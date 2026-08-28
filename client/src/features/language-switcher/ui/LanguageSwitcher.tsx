"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { LANGUAGES, type TLangCode } from "@shared/config/i18n";
import { useClickOutside } from "@shared/lib/hooks/useClickOutside";
import { cn } from "@shared/lib/cn";
import type { ILanguageSwitcherProps } from "../model/types";

export const LanguageSwitcher: React.FC<ILanguageSwitcherProps> = ({
  currentLang,
  onLanguageChange,
  className,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  const activeLanguage =
    LANGUAGES.find((lang) => lang.code === currentLang) ?? LANGUAGES[0];

  const handleSelect = (code: TLangCode) => {
    onLanguageChange(code);
    setIsOpen(false);
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-400 text-neutral-900 transition-colors duration-200 cursor-pointer font-brand text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-black"
      >
        <span className="relative w-5 h-3.5 shrink-0 overflow-hidden rounded-[2px] shadow-xs">
          <Image
            src={activeLanguage.flagUrl}
            alt={activeLanguage.name}
            fill
            sizes="20px"
            className="object-cover"
            unoptimized
          />
        </span>
        <span>{activeLanguage.label}</span>
        <ChevronDown
          size={14}
          className={cn(
            "transition-transform duration-200 text-neutral-500",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-40 rounded-xl bg-white border border-neutral-200 shadow-xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150"
        >
          {LANGUAGES.map((language) => {
            const isSelected = language.code === currentLang;
            return (
              <button
                key={language.code}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(language.code)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-brand tracking-wider text-left transition-colors duration-150 cursor-pointer uppercase",
                  isSelected
                    ? "bg-neutral-100 font-bold text-neutral-900"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                )}
              >
                <span className="relative w-5 h-3.5 shrink-0 overflow-hidden rounded-[2px] shadow-xs">
                  <Image
                    src={language.flagUrl}
                    alt={language.name}
                    fill
                    sizes="20px"
                    className="object-cover"
                    unoptimized
                  />
                </span>
                <span>{language.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
