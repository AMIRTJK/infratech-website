import React from "react";
import { Mail, Calendar } from "lucide-react";
import type { TTheme } from "@features/theme-switcher";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
      <button
        type="button"
        onClick={() => onSelectType("email")}
        className={cn(
          "flex flex-col items-start p-4 rounded-xl border transition-all duration-200 text-left cursor-pointer",
          activeType === "email"
            ? isDark
              ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_16px_rgba(212,175,55,0.15)]"
              : "border-black bg-neutral-100 shadow-xs"
            : isDark
            ? "border-white/10 bg-white/5 hover:bg-white/8 hover:border-[#D4AF37]/40"
            : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-300"
        )}
      >
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              isDark ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "bg-black/5 text-black"
            )}
          >
            <Mail size={16} />
          </div>
          <span
            className={cn(
              "text-xs sm:text-sm font-bold uppercase tracking-wider font-brand",
              isDark ? "text-white" : "text-black"
            )}
          >
            {t.emailTitle}
          </span>
        </div>
        <span
          className={cn(
            "text-[11px] font-brand tracking-wide pl-10",
            isDark ? "text-neutral-400" : "text-neutral-500"
          )}
        >
          {t.emailSubtitle}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSelectType("meeting")}
        className={cn(
          "flex flex-col items-start p-4 rounded-xl border transition-all duration-200 text-left cursor-pointer",
          activeType === "meeting"
            ? isDark
              ? "border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_16px_rgba(212,175,55,0.15)]"
              : "border-black bg-neutral-100 shadow-xs"
            : isDark
            ? "border-white/10 bg-white/5 hover:bg-white/8 hover:border-[#D4AF37]/40"
            : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-300"
        )}
      >
        <div className="flex items-center gap-2.5 mb-1">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              isDark ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "bg-black/5 text-black"
            )}
          >
            <Calendar size={16} />
          </div>
          <span
            className={cn(
              "text-xs sm:text-sm font-bold uppercase tracking-wider font-brand",
              isDark ? "text-white" : "text-black"
            )}
          >
            {t.meetingTitle}
          </span>
        </div>
        <span
          className={cn(
            "text-[11px] font-brand tracking-wide pl-10",
            isDark ? "text-neutral-400" : "text-neutral-500"
          )}
        >
          {t.meetingSubtitle}
        </span>
      </button>
    </div>
  );
};
