"use client";

import { type BookingStatus } from "@/lib/types";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { t } = useI18n();

  const STATUS_CONFIG: Record<string, { cls: string; dot: string; label?: string }> = {
    pending_payment: { cls: "px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", dot: "bg-amber-400" },
    pending: { cls: "px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", dot: "bg-amber-400" },
    paid: { cls: "px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", dot: "bg-emerald-400" },
    confirmed: { cls: "px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", dot: "bg-emerald-400" },
    driver_assigned: { cls: "px-3 py-1 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", dot: "bg-brand-gold" },
    driver_en_route: { cls: "px-3 py-1 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", dot: "bg-brand-gold" },
    driver_arrived: { cls: "px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", dot: "bg-amber-400" },
    in_progress: { cls: "px-3 py-1 bg-brand-gold/20 text-brand-gold border border-brand-gold/30 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_8px_rgba(212,175,55,0.2)]", dot: "bg-brand-gold animate-pulse" },
    completed: { cls: "px-3 py-1 bg-white/5 text-white/40 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", dot: "bg-white/20" },
    cancelled: { cls: "px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", dot: "bg-red-400" },
    no_show: { cls: "px-3 py-1 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", dot: "bg-red-400" },
  };

  const cfg = STATUS_CONFIG[status as string] || { cls: "px-3 py-1 bg-white/5 text-white/40 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5", dot: "bg-white/20" };

  const rawTranslation = t(`dashboard.status.${status}`);
  const label = rawTranslation.includes("dashboard.status")
    ? status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")
    : rawTranslation;

  return (
    <span className={cfg.cls}>
      <span className={cn("w-1 h-1 rounded-full", cfg.dot)} />
      {label}
    </span>
  );
}
