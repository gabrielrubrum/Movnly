export function getPricingMultiplier(dateStr: string, timeStr: string): { multiplier: number; reasons: string[] } {
  if (!dateStr || !timeStr) return { multiplier: 1, reasons: [] };

  const date = new Date(dateStr);
  const [hours] = timeStr.split(":").map(Number);
  let multiplier = 1.0;
  const reasons: string[] = [];

  if (hours >= 22 || hours < 6) {
    multiplier += 0.25;
    reasons.push("Noite");
  }

  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    multiplier += 0.15;
    reasons.push("Fim de semana");
  }

  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const holidays = ["1-1", "25-4", "1-5", "10-6", "15-8", "5-10", "1-11", "1-12", "8-12", "25-12"];
  if (holidays.includes(`${day}-${month}`)) {
    multiplier += 0.5;
    reasons.push("Feriado");
  }

  return { multiplier, reasons };
}
