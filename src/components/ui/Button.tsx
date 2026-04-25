"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { forwardRef, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gold" | "ghost" | "outline" | "danger" | "success";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const variants = {
  primary: "btn-primary",
  gold: "btn-gold",
  ghost: "btn-ghost",
  outline:
    "inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-transparent text-slate-200 font-medium text-[0.9375rem] rounded-xl border border-white/15 hover:bg-white/06 hover:border-white/25 hover:text-white transition-all duration-200 cursor-pointer whitespace-nowrap",
  danger:
    "inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-br from-red-600 to-red-700 text-white font-semibold text-[0.9375rem] rounded-xl border border-white/10 shadow-[0_4px_16px_rgba(239,68,68,0.3)] hover:from-red-500 hover:to-red-600 hover:shadow-[0_8px_24px_rgba(239,68,68,0.4)] hover:-translate-y-px transition-all duration-200 cursor-pointer whitespace-nowrap",
  success:
    "inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white font-semibold text-[0.9375rem] rounded-xl border border-white/10 shadow-[0_4px_16px_rgba(34,197,94,0.3)] hover:from-emerald-500 hover:to-emerald-600 hover:shadow-[0_8px_24px_rgba(34,197,94,0.4)] hover:-translate-y-px transition-all duration-200 cursor-pointer whitespace-nowrap",
};

const sizes = {
  xs: "!px-3 !py-1.5 !text-xs !rounded-lg",
  sm: "!px-4 !py-2 !text-sm !rounded-lg",
  md: "",
  lg: "!px-8 !py-4 !text-base !rounded-xl",
  xl: "!px-10 !py-5 !text-lg !rounded-2xl",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          (disabled || loading) && "opacity-50 cursor-not-allowed pointer-events-none",
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          icon && iconPosition === "left" && icon
        )}
        {children}
        {!loading && icon && iconPosition === "right" && icon}
      </button>
    );
  }
);

Button.displayName = "Button";
