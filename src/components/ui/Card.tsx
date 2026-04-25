import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "blue" | "gold" | "none";
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

export function Card({
  children,
  className,
  hover = false,
  glow = "none",
  padding = "md",
  onClick,
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "card-premium",
        paddings[padding],
        hover && "cursor-pointer",
        glow === "blue" && "glow-blue",
        glow === "gold" && "glow-gold",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: CardHeaderProps) {
  return (
    <h3 className={cn("text-lg font-semibold text-white tracking-tight", className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className }: CardHeaderProps) {
  return (
    <p className={cn("text-sm text-slate-400 mt-1", className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className }: CardHeaderProps) {
  return <div className={cn("", className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("mt-4 pt-4 border-t border-white/06", className)}>
      {children}
    </div>
  );
}
