import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getPricingMultiplier(dateStr: string, timeStr: string): {
  multiplier: number;
  reasons: string[];
} {
  const date = new Date(dateStr);
  const [hours, minutes] = timeStr.split(":").map(Number);

  let multiplier = 1.0;
  const reasons: string[] = [];

  // Noturno (22:00 - 06:00) -> +25%
  if (hours >= 22 || hours < 6) {
    multiplier += 0.25;
    reasons.push("night_shift");
  }

  // Fim de Semana (Sábado = 6, Domingo = 0) -> +15%
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    multiplier += 0.15;
    reasons.push("weekend");
  }

  // Feriados (Sincronizado com Backend) -> +50%
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const holidays = [
    "1-1", "25-4", "1-5", "10-6", "15-8", "5-10", "1-11", "1-12", "8-12", "25-12"
  ];

  if (holidays.includes(`${day}-${month}`)) {
    multiplier += 0.50;
    reasons.push("holiday");
  }

  return { multiplier, reasons };
}
