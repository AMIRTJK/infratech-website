import React from "react";
import { cn } from "@shared/lib/cn";

export interface IHeroServicesProps {
  services: readonly string[];
  className?: string;
}

export const HeroServices: React.FC<IHeroServicesProps> = ({
  services,
  className,
}) => {
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
          <span className="px-3 sm:px-4 text-[10px] sm:text-xs font-brand tracking-[0.18em] uppercase text-black hover:text-black/60 transition-colors duration-200 cursor-default select-none">
            {service}
          </span>
          {index < services.length - 1 && (
            <span
              aria-hidden="true"
              className="inline-block w-[1px] h-2.5 bg-black/20 select-none"
            />
          )}
        </span>
      ))}
    </nav>
  );
};
