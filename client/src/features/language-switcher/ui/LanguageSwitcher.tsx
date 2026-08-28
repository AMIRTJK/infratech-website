"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, Check } from "lucide-react";
import type { TTheme } from "@features/theme-switcher";
import { LANGUAGES, type TLangCode } from "@shared/config/i18n";
import { useClickOutside } from "@shared/lib/hooks/useClickOutside";
import { cn } from "@shared/lib/cn";
import type { ILanguageSwitcherProps } from "../model/types";

export interface IExtendedLanguageSwitcherProps extends ILanguageSwitcherProps {
  theme?: TTheme;
}

export const LanguageSwitcher: React.FC<IExtendedLanguageSwitcherProps> = ({
  currentLang,
  onLanguageChange,
  theme = "light",
  className,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

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
        className={cn(
          "inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 cursor-pointer font-brand text-xs uppercase tracking-wider focus:outline-none",
          isDark
            ? "text-neutral-200 hover:bg-white/10"
            : "text-neutral-900 hover:bg-black/5"
        )}
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
            "transition-transform duration-200",
            isDark ? "text-neutral-400" : "text-neutral-500",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={cn(
            "absolute right-0 mt-1.5 w-40 rounded-xl border shadow-2xl py-1 z-30 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md",
            isDark ? "bg-[#1A1A1A] border-white/10" : "bg-white border-neutral-200"
          )}
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
                  "w-full flex items-center justify-between px-3 py-2 text-xs font-brand tracking-wider text-left transition-colors duration-150 cursor-pointer uppercase",
                  isSelected
                    ? isDark
                      ? "bg-white/8 text-white font-bold"
                      : "bg-neutral-100 font-bold text-neutral-900"
                    : isDark
                    ? "text-neutral-400 hover:bg-white/5 hover:text-white"
                    : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                )}
              >
                <div className="flex items-center gap-2.5">
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
                </div>
                {isSelected && (
                  <Check
                    size={14}
                    className={isDark ? "text-[#D4AF37]" : "text-black"}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
