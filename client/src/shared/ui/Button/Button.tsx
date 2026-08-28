import React from "react";
import { cn } from "@shared/lib/cn";

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button: React.FC<IButtonProps> = ({
  variant = "primary",
  size = "md",
  className,
  children,
  type = "button",
  disabled,
  ...props
}) => {
  const variantStyles = {
    primary:
      "bg-black text-white hover:bg-neutral-800 active:bg-neutral-900 border border-black disabled:opacity-50",
    secondary:
      "bg-neutral-100 text-black hover:bg-neutral-200 active:bg-neutral-300 border border-neutral-200 disabled:opacity-50",
    outline:
      "bg-transparent text-black border border-neutral-300 hover:border-black active:bg-neutral-50 disabled:opacity-50",
    ghost:
      "bg-transparent text-black hover:bg-neutral-100 active:bg-neutral-200 disabled:opacity-50",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs tracking-wider",
    md: "px-4 py-2 text-xs md:text-sm tracking-wider",
    lg: "px-6 py-3 text-sm md:text-base tracking-widest font-medium",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer disabled:cursor-not-allowed select-none font-brand uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
