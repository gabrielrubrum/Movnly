import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type BadgeVariant = "blue" | "gold" | "emerald" | "amber" | "red" | "purple" | "slate" | "white";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  dot?: boolean;
  size?: "sm" | "md";
}

const variants: Record<BadgeVariant, string> = {
  blue: "badge badge-blue",
  gold: "badge badge-gold",
  emerald: "badge badge-emerald",
  amber: "badge badge-amber",
  red: "badge badge-red",
  purple: "badge bg-purple-500/15 text-purple-300 border border-purple-500/20",
  slate: "badge bg-slate-500/15 text-slate-300 border border-slate-500/20",
  white: "badge bg-white/10 text-white border border-white/15",
};

export function Badge({ variant = "blue", children, className, dot, size = "md" }: BadgeProps) {
  return (
    <span
      className={cn(
        variants[variant],
        size === "sm" && "text-[0.65rem] px-2 py-0.5",
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "blue" && "bg-blue-400",
            variant === "gold" && "bg-yellow-400",
            variant === "emerald" && "bg-emerald-400",
            variant === "amber" && "bg-amber-400",
            variant === "red" && "bg-red-400",
            variant === "purple" && "bg-purple-400",
            variant === "slate" && "bg-slate-400",
            variant === "white" && "bg-white"
          )}
        />
      )}
      {children}
    </span>
  );
}
