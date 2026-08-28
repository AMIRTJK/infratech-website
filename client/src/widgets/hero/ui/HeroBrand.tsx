import React from "react";
import type { TTheme } from "@features/theme-switcher";
import { cn } from "@shared/lib/cn";

export interface IHeroBrandProps {
  brand: string;
  theme: TTheme;
  className?: string;
}

export const HeroBrand: React.FC<IHeroBrandProps> = ({
  brand,
  theme,
  className,
}) => {
  return (
    <h1
      className={cn(
        "font-brand font-bold uppercase select-none tracking-[0.12em] sm:tracking-[0.2em] text-4xl sm:text-6xl md:text-7xl lg:text-[76px] leading-none transition-all duration-300",
        theme === "dark" ? "gold-gradient-text" : "text-black",
        className
      )}
    >
      {brand}
    </h1>
  );
};
