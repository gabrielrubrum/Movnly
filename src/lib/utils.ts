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

  // Madrugada (00:00 - 06:00)
  if (hours >= 0 && hours < 6) {
    multiplier += 0.20;
    reasons.push("night_shift");
  }

  // Peak Hours (07:30 - 09:30, 17:00 - 19:30)
  const timeInMinutes = hours * 60 + minutes;
  const morningPeakStart = 7 * 60 + 30;
  const morningPeakEnd = 9 * 60 + 30;
  const eveningPeakStart = 17 * 60;
  const eveningPeakEnd = 19 * 60 + 30;

  if (
    (timeInMinutes >= morningPeakStart && timeInMinutes <= morningPeakEnd) ||
    (timeInMinutes >= eveningPeakStart && timeInMinutes <= eveningPeakEnd)
  ) {
    multiplier += 0.15;
    reasons.push("peak_hour");
  }

  // Weekends (Saturday = 6, Sunday = 0)
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    multiplier += 0.10;
    reasons.push("weekend");
  }
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const holidays = [
    "1-1", "10-4", "12-4", "25-4", "1-5", "4-6", "10-6", "15-8", "5-10", "1-11", "1-12", "8-12", "25-12",
    "13-6", // Santo António (Lisboa)
    "16-2", // Carnaval (approx)
  ];

  if (holidays.includes(`${day}-${month}`)) {
    multiplier += 0.25;
    reasons.push("holiday");
  }

  return { multiplier, reasons };
}
