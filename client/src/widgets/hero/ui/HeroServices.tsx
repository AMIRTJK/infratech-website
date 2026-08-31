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
        "flex flex-nowrap items-center justify-center text-center w-full max-w-6xl mx-auto overflow-x-auto no-scrollbar py-1",
        className
      )}
    >
      {services.map((service, index) => (
        <span key={service} className="inline-flex items-center shrink-0">
          <span
            className={cn(
              "px-2 sm:px-3 md:px-4 text-[9.5px] sm:text-[11px] md:text-xs font-brand tracking-[0.12em] sm:tracking-[0.16em] md:tracking-[0.18em] uppercase transition-colors duration-300 cursor-default select-none whitespace-nowrap",
              isDark
                ? "text-neutral-400/60 hover:text-[#D4AF37]"
                : "text-black hover:text-black/60"
            )}
          >
            {service}
          </span>
          {index < services.length - 1 && (
            <span
              aria-hidden="true"
              className={cn(
                "inline-block w-[1px] h-2.5 shrink-0 select-none",
                isDark ? "bg-white/15" : "bg-black/20"
              )}
            />
          )}
        </span>
      ))}
    </nav>
  );
};
