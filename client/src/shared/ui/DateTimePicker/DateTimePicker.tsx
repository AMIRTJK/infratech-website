"use client";

import React, { useState, useRef, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import type { TTheme } from "@features/theme-switcher";
import { useClickOutside } from "@shared/lib/hooks/useClickOutside";
import { cn } from "@shared/lib/cn";

export interface IDateTimePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  theme?: TTheme;
  required?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
}

const DAYS_OF_WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"] as const;
const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
] as const;

const MONTH_NAMES = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
] as const;

export const DateTimePicker: React.FC<IDateTimePickerProps> = ({
  label,
  value,
  onChange,
  theme = "dark",
  required,
  error,
  placeholder = "Выберите дату и время",
  className,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  useClickOutside(containerRef, () => setIsOpen(false), isOpen);

  // Текущая отображаемая дата календаря
  const initialDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());
  const [selectedTime, setSelectedTime] = useState<string>(
    value ? `${String(new Date(value).getHours()).padStart(2, "0")}:00` : "14:00"
  );

  const selectedDateObj = useMemo(() => (value ? new Date(value) : null), [value]);

  // Генерация дней текущего месяца
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);

    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const days: (number | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }

    return days;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const formatted = `${viewYear}-${pad(viewMonth + 1)}-${pad(day)}T${selectedTime}`;
    onChange(formatted);
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    if (selectedDateObj) {
      const pad = (n: number) => String(n).padStart(2, "0");
      const formatted = `${selectedDateObj.getFullYear()}-${pad(
        selectedDateObj.getMonth() + 1
      )}-${pad(selectedDateObj.getDate())}T${time}`;
      onChange(formatted);
    }
  };

  const formattedDisplayValue = useMemo(() => {
    if (!value) return "";
    try {
      const d = new Date(value);
      if (isNaN(d.getTime())) return value;
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} в ${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`;
    } catch {
      return value;
    }
  }, [value]);

  return (
    <div ref={containerRef} className={cn("relative flex flex-col gap-1.5 w-full text-left", className)}>
      {label && (
        <label className={cn("text-xs font-semibold uppercase tracking-wider font-brand", isDark ? "text-neutral-400" : "text-neutral-600")}>
          {label} {required && <span className={isDark ? "text-[#D4AF37]" : "text-red-500"}>*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs md:text-sm font-brand tracking-wide border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1",
          isDark
            ? "bg-white/5 text-white border-white/15 hover:border-[#D4AF37]/50 focus:border-[#D4AF37] focus:ring-[#D4AF37]"
            : "bg-neutral-50 text-neutral-900 border-neutral-300 hover:border-black/50 focus:border-black focus:ring-black",
          error && "border-red-500",
          !formattedDisplayValue && (isDark ? "text-neutral-500" : "text-neutral-400")
        )}
      >
        <span>{formattedDisplayValue || placeholder}</span>
        <CalendarIcon size={16} className={isDark ? "text-[#D4AF37]" : "text-neutral-500"} />
      </button>

      {isOpen && (
        <div
          className={cn(
            "absolute top-[calc(100%+4px)] left-0 z-50 p-4 rounded-xl border shadow-2xl animate-in fade-in zoom-in-95 duration-150 backdrop-blur-md w-full max-w-[340px]",
            isDark ? "bg-[#1A1A1A] border-white/15 text-white" : "bg-white border-neutral-200 text-neutral-900"
          )}
        >
          {/* Заголовок календаря: месяц/год и навигация */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase font-brand tracking-wider">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className={cn("p-1 rounded-md transition-colors cursor-pointer", isDark ? "hover:bg-white/10" : "hover:bg-neutral-100")}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className={cn("p-1 rounded-md transition-colors cursor-pointer", isDark ? "hover:bg-white/10" : "hover:bg-neutral-100")}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Дни недели */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS_OF_WEEK.map((day) => (
              <span key={day} className={cn("text-[10px] font-bold uppercase font-brand py-1", isDark ? "text-neutral-500" : "text-neutral-400")}>
                {day}
              </span>
            ))}
          </div>

          {/* Сетка чисел месяца */}
          <div className="grid grid-cols-7 gap-1 text-center mb-3">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="w-7 h-7" />;
              }

              const isSelected =
                selectedDateObj &&
                selectedDateObj.getFullYear() === viewYear &&
                selectedDateObj.getMonth() === viewMonth &&
                selectedDateObj.getDate() === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "w-7 h-7 rounded-md text-xs font-brand flex items-center justify-center transition-all duration-150 cursor-pointer",
                    isSelected
                      ? isDark
                        ? "bg-[#D4AF37] text-black font-bold shadow-xs"
                        : "bg-black text-white font-bold"
                      : isDark
                      ? "hover:bg-white/10 text-neutral-300"
                      : "hover:bg-neutral-100 text-neutral-800"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Блок выбора времени */}
          <div className="pt-2.5 border-t border-black/8 dark:border-white/10">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock size={12} className={isDark ? "text-[#D4AF37]" : "text-neutral-500"} />
              <span className={cn("text-[10px] font-bold uppercase tracking-wider font-brand", isDark ? "text-neutral-400" : "text-neutral-500")}>
                Время встречи
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {TIME_SLOTS.map((time) => {
                const isTimeSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => handleSelectTime(time)}
                    className={cn(
                      "py-1 rounded text-[10px] font-brand tracking-wider transition-colors cursor-pointer",
                      isTimeSelected
                        ? isDark
                          ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50 font-bold"
                          : "bg-black text-white font-bold"
                        : isDark
                        ? "bg-white/5 hover:bg-white/10 text-neutral-400"
                        : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                    )}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {error && <span className={cn("text-xs font-brand", isDark ? "text-red-400" : "text-red-500")}>{error}</span>}
    </div>
  );
};
