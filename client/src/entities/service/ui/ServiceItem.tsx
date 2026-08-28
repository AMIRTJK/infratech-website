import React from "react";
import { cn } from "@shared/lib/cn";

export interface IServiceItemProps {
  name: string;
  className?: string;
}

export const ServiceItem: React.FC<IServiceItemProps> = ({ name, className }) => {
  return (
    <div
      className={cn(
        "text-neutral-900 text-xs sm:text-sm md:text-base font-brand tracking-widest uppercase transition-colors duration-200 hover:text-neutral-500 cursor-default select-none",
        className
      )}
    >
      {name}
    </div>
  );
};
