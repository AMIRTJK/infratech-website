import React from "react";
import { cn } from "@shared/lib/cn";

export interface IHeroBrandProps {
  brand: string;
  className?: string;
}

export const HeroBrand: React.FC<IHeroBrandProps> = ({ brand, className }) => {
  return (
    <h1
      className={cn(
        "font-brand font-bold uppercase text-black select-none tracking-[0.12em] sm:tracking-[0.2em] text-4xl sm:text-6xl md:text-7xl lg:text-[80px] leading-none transition-all duration-300",
        className
      )}
    >
      {brand}
    </h1>
  );
};
