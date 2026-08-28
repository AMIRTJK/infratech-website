import React from "react";
import type { TTheme } from "@shared/types";
import { cn } from "@shared/lib/cn";

export interface ITextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  theme?: TTheme;
}

export const Textarea: React.FC<ITextareaProps> = ({
  label,
  error,
  theme = "dark",
  id,
  name,
  className,
  required,
  rows = 4,
  ...props
}) => {
  const textareaId = id || name;
  const isDark = theme === "dark";

  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label
          htmlFor={textareaId}
          className={cn(
            "text-xs font-semibold uppercase tracking-wider font-brand",
            isDark ? "text-neutral-400" : "text-neutral-600"
          )}
        >
          {label}{" "}
          {required && (
            <span className={isDark ? "text-[#D4AF37]" : "text-red-500"}>*</span>
          )}
        </label>
      )}
      <textarea
        id={textareaId}
        name={name}
        required={required}
        rows={rows}
        className={cn(
          "w-full px-3.5 py-2.5 rounded-lg text-xs md:text-sm font-brand tracking-wide border transition-all duration-200 focus:outline-none focus:ring-1 resize-y",
          isDark
            ? "bg-white/5 text-white border-white/15 placeholder:text-neutral-500 focus:border-[#D4AF37] focus:bg-white/8 focus:ring-[#D4AF37]"
            : "bg-neutral-50 text-neutral-900 border-neutral-300 placeholder:text-neutral-400 focus:border-black focus:bg-white focus:ring-black",
          error &&
            (isDark
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-red-500 focus:border-red-500 focus:ring-red-500"),
          className
        )}
        {...props}
      />
      {error && (
        <span
          className={cn(
            "text-xs font-brand",
            isDark ? "text-red-400" : "text-red-500"
          )}
        >
          {error}
        </span>
      )}
    </div>
  );
};
