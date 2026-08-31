import React from "react";
import type { TTheme } from "@shared/types";
import { cn } from "@shared/lib/cn";

export interface IHeroServicesProps {
  services: readonly string[];
  theme: TTheme;
  className?: string;
}

export const HeroServices: React.FC<IHeroServicesProps> = ({
  services,
  theme,
  className,
}) => {
  const isDark = theme === "dark";

  return (
    <nav
      aria-label="Services"
      className={cn(
        "flex flex-wrap sm:flex-nowrap items-center justify-center text-center w-full max-w-sm sm:max-w-6xl mx-auto gap-x-1.5 sm:gap-x-0 gap-y-1 sm:gap-y-0 px-2 sm:px-0 py-0.5",
        className
      )}
    >
      {services.map((service, index) => (
        <span
          key={service}
          className="inline-flex items-center justify-center shrink-0 max-w-full"
        >
          <span
            className={cn(
              "px-1.5 sm:px-3 md:px-4 text-[9px] sm:text-[11px] md:text-xs font-brand tracking-[0.06em] sm:tracking-[0.16em] md:tracking-[0.18em] uppercase transition-colors duration-300 cursor-default select-none whitespace-normal sm:whitespace-nowrap leading-tight",
              isDark
                ? "text-neutral-400/70 hover:text-[#D4AF37]"
                : "text-black/80 hover:text-black"
            )}
          >
            {service}
          </span>
          {index < services.length - 1 && (
            <span
              aria-hidden="true"
              className={cn(
                "hidden sm:inline-block w-[1px] h-2.5 shrink-0 select-none",
                isDark ? "bg-white/15" : "bg-black/20"
              )}
            />
          )}
        </span>
      ))}
    </nav>
  );
};
