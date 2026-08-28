import React from "react";
import { Mail, Calendar } from "lucide-react";
import type { TTheme } from "@shared/types";
import { cn } from "@shared/lib/cn";
import type { ITranslation } from "@shared/config/i18n";
import type { TContactType } from "../model/types";

export interface IContactTypeTabsProps {
  activeType: TContactType | null;
  onSelectType: (type: TContactType) => void;
  theme?: TTheme;
  t: ITranslation;
}

export const ContactTypeTabs: React.FC<IContactTypeTabsProps> = ({
  activeType,
  onSelectType,
  theme = "dark",
  t,
}) => {
  const isDark = theme === "dark";

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-4 w-full">
      <button
        type="button"
        onClick={() => onSelectType("email")}
        className={cn(
          "flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border transition-all duration-200 text-left cursor-pointer h-[60px]",
          activeType === "email"
            ? isDark
              ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_12px_rgba(212,175,55,0.15)]"
              : "border-black bg-neutral-100 shadow-xs"
            : isDark
            ? "border-white/10 bg-white/5 hover:bg-white/8 hover:border-[#D4AF37]/40"
            : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-300"
        )}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            isDark ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "bg-black/5 text-black"
          )}
        >
          <Mail size={15} />
        </div>
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <span
            className={cn(
              "text-[9.5px] sm:text-[11px] font-bold uppercase tracking-wider font-brand leading-none whitespace-nowrap",
              isDark ? "text-white" : "text-black"
            )}
          >
            {t.emailTitle}
          </span>
          <span
            className={cn(
              "text-[9px] sm:text-[10px] font-brand tracking-wide leading-none mt-1 whitespace-nowrap",
              isDark ? "text-neutral-400" : "text-neutral-500"
            )}
          >
            {t.emailSubtitle}
          </span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onSelectType("meeting")}
        className={cn(
          "flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border transition-all duration-200 text-left cursor-pointer h-[60px]",
          activeType === "meeting"
            ? isDark
              ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_12px_rgba(212,175,55,0.15)]"
              : "border-black bg-neutral-100 shadow-xs"
            : isDark
            ? "border-white/10 bg-white/5 hover:bg-white/8 hover:border-[#D4AF37]/40"
            : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-300"
        )}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            isDark ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "bg-black/5 text-black"
          )}
        >
          <Calendar size={15} />
        </div>
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <span
            className={cn(
              "text-[9.5px] sm:text-[11px] font-bold uppercase tracking-wider font-brand leading-none whitespace-nowrap",
              isDark ? "text-white" : "text-black"
            )}
          >
            {t.meetingTitle}
          </span>
          <span
            className={cn(
              "text-[9px] sm:text-[10px] font-brand tracking-wide leading-none mt-1 whitespace-nowrap",
              isDark ? "text-neutral-400" : "text-neutral-500"
            )}
          >
            {t.meetingSubtitle}
          </span>
        </div>
      </button>
    </div>
  );
};
