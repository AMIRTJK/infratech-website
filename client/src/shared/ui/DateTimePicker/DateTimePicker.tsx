"use client";

import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import type { TTheme } from "@shared/types";
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

import { DAYS_OF_WEEK, TIME_SLOTS, MONTH_NAMES } from "./constants";

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
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number }>({
    top: 0,
    left: 0,
    width: 320,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isDark = theme === "dark";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const initialDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState<number>(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(initialDate.getMonth());
  const [selectedTime, setSelectedTime] = useState<string>(
    value ? `${String(new Date(value).getHours()).padStart(2, "0")}:00` : "14:00"
  );

  const selectedDateObj = useMemo(() => (value ? new Date(value) : null), [value]);

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

  const calculateCoords = useCallback(() => {
    if (!buttonRef.current) return { top: 0, left: 0, width: 320 };
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownWidth = rect.width;
    const dropdownHeight = 275;

    let top = rect.bottom + 6;
    if (top + dropdownHeight > window.innerHeight - 10) {
      if (rect.top - dropdownHeight - 6 > 10) {
        top = rect.top - dropdownHeight - 6;
      } else {
        top = Math.max(10, window.innerHeight - dropdownHeight - 10);
      }
    }

    return { top, left: rect.left, width: dropdownWidth };
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      const newCoords = calculateCoords();
      setCoords(newCoords);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleWindowChange = () => {
      setCoords(calculateCoords());
    };
    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, true);

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, calculateCoords]);

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
    <div className={cn("flex flex-col gap-1.5 w-full text-left", className)}>
      {label && (
        <label className={cn("text-xs font-semibold uppercase tracking-wider font-brand", isDark ? "text-neutral-400" : "text-neutral-600")}>
          {label} {required && <span className={isDark ? "text-[#D4AF37]" : "text-red-500"}>*</span>}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className={cn(
          "w-full h-[42px] flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs md:text-sm font-brand tracking-wide border transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1",
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

      {isOpen && isMounted && coords.top > 0 && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            width: `${coords.width}px`,
          }}
          className={cn(
            "z-[9999] p-3 rounded-xl border shadow-2xl backdrop-blur-md select-none",
            isDark
              ? "bg-[#1A1A1A] border-white/15 text-white shadow-black/80"
              : "bg-white border-neutral-200 text-neutral-900 shadow-neutral-400/50"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase font-brand tracking-wider">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={handlePrevMonth}
                className={cn("p-1 rounded-md transition-colors cursor-pointer", isDark ? "hover:bg-white/10" : "hover:bg-neutral-100")}
              >
                <ChevronLeft size={15} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className={cn("p-1 rounded-md transition-colors cursor-pointer", isDark ? "hover:bg-white/10" : "hover:bg-neutral-100")}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>

          {/* Days of week */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS_OF_WEEK.map((day) => (
              <span key={day} className={cn("text-[9px] font-bold uppercase font-brand py-0.5", isDark ? "text-neutral-500" : "text-neutral-400")}>
                {day}
              </span>
            ))}
          </div>

          {/* Month days */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="w-full h-6" />;
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
                    "w-full h-6 rounded-md text-[11px] font-brand flex items-center justify-center transition-colors cursor-pointer",
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

          {/* Time slots */}
          <div className="pt-2 border-t border-black/8 dark:border-white/10">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Clock size={12} className={isDark ? "text-[#D4AF37]" : "text-neutral-500"} />
              <span className={cn("text-[9px] font-bold uppercase tracking-wider font-brand", isDark ? "text-neutral-400" : "text-neutral-500")}>
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
                      "py-1 rounded text-[10px] font-brand tracking-wider transition-colors cursor-pointer text-center",
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
        </div>,
        document.body
      )}

      {error && <span className={cn("text-xs font-brand", isDark ? "text-red-400" : "text-red-500")}>{error}</span>}
    </div>
  );
};
