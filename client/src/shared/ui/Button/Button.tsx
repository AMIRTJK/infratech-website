import React from "react";
import type { TTheme } from "@features/theme-switcher";
import { cn } from "@shared/lib/cn";

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  theme?: TTheme;
  children: React.ReactNode;
}

export const Button: React.FC<IButtonProps> = ({
  variant = "primary",
  size = "md",
  theme = "dark",
  className,
  children,
  type = "button",
  disabled,
  ...props
}) => {
  const isDark = theme === "dark";

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return isDark
          ? "border border-[#D4AF37] bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black shadow-[0_0_16px_rgba(212,175,55,0.15)] hover:shadow-[0_0_24px_rgba(212,175,55,0.3)] disabled:opacity-50"
          : "bg-black text-white hover:bg-neutral-800 active:bg-neutral-900 border border-black disabled:opacity-50";
      case "secondary":
        return isDark
          ? "bg-white/10 text-white hover:bg-white/15 active:bg-white/20 border border-white/10 disabled:opacity-50"
          : "bg-neutral-100 text-black hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200 disabled:opacity-50";
      case "outline":
        return isDark
          ? "bg-transparent text-neutral-300 border border-white/20 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 disabled:opacity-50"
          : "bg-transparent text-black border border-neutral-300 hover:border-black active:bg-neutral-50 disabled:opacity-50";
      case "ghost":
        return isDark
          ? "bg-transparent text-neutral-300 hover:bg-white/5 hover:text-white disabled:opacity-50"
          : "bg-transparent text-black hover:bg-neutral-100 active:bg-neutral-200 disabled:opacity-50";
    }
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs tracking-wider",
    md: "px-4 py-2 text-xs md:text-sm tracking-wider",
    lg: "px-6 py-3 text-xs md:text-sm tracking-widest font-medium",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer disabled:cursor-not-allowed select-none font-brand uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isDark
          ? "focus-visible:ring-[#D4AF37] focus-visible:ring-offset-[#121212]"
          : "focus-visible:ring-black focus-visible:ring-offset-white",
        getVariantStyles(),
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
