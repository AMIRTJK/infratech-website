import React from "react";
import type { TTheme } from "@shared/types";
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
        "font-logo font-bold uppercase select-none tracking-[0.06em] xs:tracking-[0.1em] sm:tracking-[0.18em] text-[26px] xs:text-3xl sm:text-5xl md:text-7xl lg:text-[76px] leading-none transition-all duration-300",
        theme === "dark" ? "gold-gradient-text" : "text-black",
        className
      )}
    >
      {brand}
    </h1>
  );
};
