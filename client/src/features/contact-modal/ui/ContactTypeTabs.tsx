import React from "react";
import { Mail, Calendar } from "lucide-react";
import { cn } from "@shared/lib/cn";
import type { ITranslation } from "@shared/config/i18n";
import type { TContactType } from "../model/types";

export interface IContactTypeTabsProps {
  activeType: TContactType | null;
  onSelectType: (type: TContactType) => void;
  t: ITranslation;
}

export const ContactTypeTabs: React.FC<IContactTypeTabsProps> = ({
  activeType,
  onSelectType,
  t,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
      <button
        type="button"
        onClick={() => onSelectType("email")}
        className={cn(
          "flex flex-col items-start p-4 rounded-xl border transition-all duration-200 text-left cursor-pointer",
          activeType === "email"
            ? "border-black bg-neutral-100 shadow-xs"
            : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-300"
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          <Mail size={18} className="text-neutral-700" />
          <span className="text-sm font-bold uppercase tracking-wider font-brand text-neutral-900">
            {t.emailTitle}
          </span>
        </div>
        <span className="text-xs text-neutral-500 font-brand tracking-wide">
          {t.emailSubtitle}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onSelectType("meeting")}
        className={cn(
          "flex flex-col items-start p-4 rounded-xl border transition-all duration-200 text-left cursor-pointer",
          activeType === "meeting"
            ? "border-black bg-neutral-100 shadow-xs"
            : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-300"
        )}
      >
        <div className="flex items-center gap-2 mb-1">
          <Calendar size={18} className="text-neutral-700" />
          <span className="text-sm font-bold uppercase tracking-wider font-brand text-neutral-900">
            {t.meetingTitle}
          </span>
        </div>
        <span className="text-xs text-neutral-500 font-brand tracking-wide">
          {t.meetingSubtitle}
        </span>
      </button>
    </div>
  );
};
