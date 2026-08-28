"use client";

import React, { useMemo, useState, useEffect } from "react";
import type { TTheme } from "@features/theme-switcher";
import { generateQrMatrix } from "../lib/qrMatrix";
import { cn } from "@shared/lib/cn";

export interface IQrCodeBlockProps {
  label: string;
  theme?: TTheme;
  onOpenContact: () => void;
  className?: string;
}

export const QrCodeBlock: React.FC<IQrCodeBlockProps> = ({
  label,
  theme = "light",
  onOpenContact,
  className,
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>("?openContact=true");
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const isDark = theme === "dark";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(
        `${window.location.origin}${window.location.pathname}?openContact=true`
      );
    }
  }, []);

  const qrMatrix = useMemo(() => generateQrMatrix(currentUrl), [currentUrl]);
  const matrixLength = qrMatrix.length;

  return (
    <div
      onClick={onOpenContact}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={label}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenContact();
        }
      }}
      className={cn(
        "group flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all duration-300 cursor-pointer select-none",
        isDark
          ? "border-white/12 bg-[#161616] hover:border-[#D4AF37]/50 hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]"
          : "border-black/10 bg-white hover:border-black/30 hover:shadow-xs",
        className
      )}
    >
      <div
        className={cn(
          "w-[84px] h-[84px] sm:w-[90px] sm:h-[90px] flex items-center justify-center p-1 rounded-md",
          isDark ? "bg-[#121212]" : "bg-white"
        )}
      >
        <svg
          viewBox={`0 0 ${matrixLength} ${matrixLength}`}
          className="w-full h-full shape-rendering-crispEdges transition-opacity duration-200"
        >
          <rect
            width={matrixLength}
            height={matrixLength}
            fill={isDark ? "#121212" : "#FFFFFF"}
          />
          {qrMatrix.map((row, rowIndex) =>
            row.map((isDarkModule, colIndex) =>
              isDarkModule ? (
                <rect
                  key={`${rowIndex}-${colIndex}`}
                  x={colIndex}
                  y={rowIndex}
                  width={1}
                  height={1}
                  fill={
                    isDark
                      ? isHovered
                        ? "#D4AF37"
                        : "#FFFFFF"
                      : isHovered
                      ? "rgba(0,0,0,0.7)"
                      : "#000000"
                  }
                />
              ) : null
            )
          )}
        </svg>
      </div>

      <span
        className={cn(
          "text-[8px] font-brand uppercase tracking-[0.18em] transition-colors duration-200 text-center",
          isDark
            ? "text-neutral-500 group-hover:text-[#D4AF37]"
            : "text-black/40 group-hover:text-black/70"
        )}
      >
        {label}
      </span>
    </div>
  );
};
