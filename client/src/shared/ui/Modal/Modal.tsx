import React, { useEffect } from "react";
import { X } from "lucide-react";
import type { TTheme } from "@shared/types";
import { cn } from "@shared/lib/cn";

export interface IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  theme?: TTheme;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<IModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  theme = "dark",
  children,
  className,
}) => {
  const isDark = theme === "dark";

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-200",
        isDark ? "bg-black/85" : "bg-black/60"
      )}
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full max-w-[840px] rounded-2xl p-[1px] shadow-2xl transition-all duration-200 max-h-[92vh] overflow-hidden",
          isDark ? "chrome-card-border-dark" : "chrome-card-border-light",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={cn(
            "w-full h-full rounded-[15px] p-5 sm:p-7 overflow-y-auto max-h-[calc(92vh-2px)] transition-colors duration-200",
            isDark ? "bg-[#121212] text-neutral-100" : "bg-[#FFFFFF] text-neutral-900"
          )}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть модальное окно"
            className={cn(
              "absolute top-4 right-4 p-1.5 rounded-full transition-colors duration-200 cursor-pointer z-10",
              isDark
                ? "text-neutral-400 hover:text-[#D4AF37] hover:bg-white/5"
                : "text-neutral-500 hover:text-black hover:bg-neutral-100"
            )}
          >
            <X size={20} />
          </button>

          {(title || subtitle) && (
            <div className="mb-4 pr-8 text-left pb-3 border-b border-black/8 dark:border-white/8">
              {title && (
                <h2
                  className={cn(
                    "text-lg sm:text-xl font-bold uppercase tracking-wider font-brand",
                    isDark ? "gold-gradient-text" : "text-black"
                  )}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p
                  className={cn(
                    "mt-0.5 text-xs uppercase tracking-widest font-brand",
                    isDark ? "text-neutral-400/80" : "text-neutral-500"
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};
