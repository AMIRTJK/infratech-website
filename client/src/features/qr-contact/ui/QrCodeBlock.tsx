"use client";

import React, { useMemo, useState, useEffect } from "react";
import { generateQrMatrix } from "../lib/qrMatrix";
import { cn } from "@shared/lib/cn";

export interface IQrCodeBlockProps {
  label: string;
  onOpenContact: () => void;
  className?: string;
}

export const QrCodeBlock: React.FC<IQrCodeBlockProps> = ({
  label,
  onOpenContact,
  className,
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>("?openContact=true");

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
        "group flex flex-col items-center gap-1.5 p-2 rounded-lg border border-black/15 bg-white transition-all duration-300 hover:border-black/40 hover:shadow-md cursor-pointer select-none",
        className
      )}
    >
      <div className="w-[84px] h-[84px] sm:w-[90px] sm:h-[90px] flex items-center justify-center">
        <svg
          viewBox={`0 0 ${matrixLength} ${matrixLength}`}
          className="w-full h-full shape-rendering-crispEdges transition-opacity duration-200 group-hover:opacity-85"
        >
          <rect width={matrixLength} height={matrixLength} fill="#FFFFFF" />
          {qrMatrix.map((row, rowIndex) =>
            row.map((isDark, colIndex) =>
              isDark ? (
                <rect
                  key={`${rowIndex}-${colIndex}`}
                  x={colIndex}
                  y={rowIndex}
                  width={1}
                  height={1}
                  fill="#000000"
                />
              ) : null
            )
          )}
        </svg>
      </div>

      <span className="text-[8px] font-brand uppercase tracking-[0.18em] text-black/40 group-hover:text-black/70 transition-colors duration-200 text-center">
        {label}
      </span>
    </div>
  );
};
