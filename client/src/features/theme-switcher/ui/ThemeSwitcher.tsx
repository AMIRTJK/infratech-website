"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { cn } from "@shared/lib/cn";

export type TTheme = "light" | "dark";

export interface IThemeSwitcherProps {
  theme: TTheme;
  onThemeToggle: () => void;
  className?: string;
}

export const ThemeSwitcher: React.FC<IThemeSwitcherProps> = ({
  theme,
  onThemeToggle,
  className,
}) => {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={onThemeToggle}
      aria-label={isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему"}
      className={cn(
        "inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 cursor-pointer select-none focus:outline-none",
        isDark
          ? "text-neutral-300 hover:text-[#D4AF37] hover:bg-white/10"
          : "text-neutral-700 hover:text-black hover:bg-black/5",
        className
      )}
    >
      {isDark ? (
        <Sun size={18} className="text-[#D4AF37] transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon size={18} className="text-black transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
};
