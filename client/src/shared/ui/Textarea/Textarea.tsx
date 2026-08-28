import React from "react";
import { cn } from "@shared/lib/cn";

export interface ITextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<ITextareaProps> = ({
  label,
  error,
  id,
  name,
  className,
  required,
  rows = 4,
  ...props
}) => {
  const textareaId = id || name;

  return (
    <div className="flex flex-col gap-1.5 w-full text-left">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-semibold uppercase tracking-wider text-neutral-600 font-brand"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        name={name}
        required={required}
        rows={rows}
        className={cn(
          "w-full px-3.5 py-2.5 rounded-lg text-sm bg-neutral-50 text-neutral-900 border border-neutral-300 transition-colors duration-200 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:bg-white resize-y",
          error && "border-red-500 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};
