import React from "react";
import type { TTheme } from "@features/theme-switcher";
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
        "flex flex-wrap items-center justify-center gap-y-2 text-center max-w-4xl",
        className
      )}
    >
      {services.map((service, index) => (
        <span key={service} className="inline-flex items-center">
          <span
            className={cn(
              "px-3 sm:px-4 text-[10px] sm:text-xs font-brand tracking-[0.18em] uppercase transition-colors duration-300 cursor-default select-none",
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
                "inline-block w-[1px] h-2.5 select-none",
                isDark ? "bg-white/15" : "bg-black/20"
              )}
            />
          )}
        </span>
      ))}
    </nav>
  );
};
