"use client";

import React from "react";
import { useI18n } from "@/i18n/context";
import { cn, formatCurrency, getPricingMultiplier } from "@/lib/utils";
import { VEHICLE_CATEGORIES } from "@/lib/constants";
import { type BookingFormData } from "../BookingSteps";
import { type VehicleCategory } from "@/lib/types";
import { Users, Briefcase, Check, ArrowLeft, ChevronRight, Star, Shield, Wifi, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  form: BookingFormData;
  update: (p: Partial<BookingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORY_ACCENTS: Record<string, { from: string; glow: string; badge: string; text: string }> = {
  smart: { from: "from-slate-500/10", glow: "rgba(100,116,139,0.3)", badge: "bg-slate-700/80 text-slate-200", text: "text-slate-300" },
  comfort: { from: "from-blue-500/10", glow: "rgba(59,130,246,0.3)", badge: "bg-blue-900/80 text-blue-200", text: "text-blue-300" },
  group: { from: "from-amber-500/10", glow: "rgba(245,158,11,0.3)", badge: "bg-amber-900/80 text-amber-200", text: "text-amber-300" },
  executive: { from: "from-yellow-400/10", glow: "rgba(212,175,55,0.4)", badge: "bg-brand-gold text-black font-black", text: "text-brand-gold" },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  smart: <Wifi className="w-3.5 h-3.5" />,
  comfort: <Star className="w-3.5 h-3.5" />,
  group: <Users className="w-3.5 h-3.5" />,
  executive: <Shield className="w-3.5 h-3.5" />,
};

export function StepVehicle({ form, update, onNext, onBack }: Props) {
  const { t } = useI18n();

  return (
    <div className="animate-luxury-reveal min-h-screen pb-40">
      {/* Header */}
      <div className="flex items-center gap-6 mb-16">
        <button
          onClick={onBack}
          className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/30 hover:text-brand-gold hover:border-brand-gold/40 transition-all duration-500 group shrink-0"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold/60 mb-2 font-sans">
            {t("bookingFlow.stepVehicle.sub")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-sans uppercase tracking-tight leading-none">
            {t("bookingFlow.stepVehicle.title")}
          </h2>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {VEHICLE_CATEGORIES.map((cat, idx) => {
          const selected = form.category === cat.id;
          const accent = CATEGORY_ACCENTS[cat.id] || CATEGORY_ACCENTS.smart;

          const pricing1 = getPricingMultiplier(form.date, form.time);
          const ratePerKm = { smart: 1.0, comfort: 1.5, group: 1.8, executive: 2.5 }[cat.id] || 1.2;
          const distLeg = form.distance || 0;
          const baseLeg = distLeg ? Math.round(cat.basePrice + distLeg * ratePerKm) : cat.basePrice;
          let finalPrice = Math.round(baseLeg * pricing1.multiplier);

          if (form.tripType === "roundtrip" && form.returnDate && form.returnTime) {
            const pricing2 = getPricingMultiplier(form.returnDate, form.returnTime);
            finalPrice = Math.round((finalPrice + baseLeg * pricing2.multiplier) * 0.95);
          }

          const handleClick = () => {
            if (selected) {
              onNext();
              return;
            }
            update({ category: cat.id as VehicleCategory });
            // Auto-advance after selection for premium "snappy" feel
            setTimeout(() => {
              onNext();
            }, 500);
          };

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.12, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="relative group"
            >
              <button
                onClick={handleClick}
                className={cn(
                  "w-full text-left relative overflow-hidden transition-all duration-700",
                  "rounded-[2rem] border isolate",
                  selected
                    ? "border-brand-gold/60 shadow-[0_0_80px_-20px_rgba(212,175,55,0.5),0_0_0_1px_rgba(212,175,55,0.2)] bg-[#0c0b08]"
                    : "border-white/[0.07] bg-[#0a0a0f] hover:border-white/15"
                )}
              >
                {/* Ambient glow on selected */}
                <AnimatePresence>
                  {selected && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 pointer-events-none z-0"
                      style={{
                        background: `radial-gradient(ellipse 80% 60% at 60% 10%, ${accent.glow} 0%, transparent 70%)`,
                      }}
                    />
                  )}
                </AnimatePresence>

                {/* Hover ambient glow */}
                <div
                  className="absolute inset-0 pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                  style={{
                    background: `radial-gradient(ellipse 70% 50% at 60% 0%, ${accent.glow.replace("0.3", "0.12").replace("0.4", "0.15")} 0%, transparent 70%)`,
                  }}
                />

                <div className="relative z-10 flex flex-col sm:flex-row min-h-[280px]">

                  {/* Vehicle Image Panel */}
                  <div className="sm:w-[45%] relative flex items-center justify-center p-6 sm:py-10 overflow-hidden">
                    {/* Decorative line */}
                    <div className="absolute top-6 left-6 right-6 h-px bg-white/5" />
                    <div className="absolute bottom-6 left-6 right-6 h-px bg-white/5" />

                    {/* Floor shadow */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-8 blur-2xl rounded-[100%] bg-black/50 opacity-60" />

                    {/* Car image */}
                    <motion.img
                      src={cat.image}
                      alt={cat.name}
                      animate={selected
                        ? { scale: 1.18, y: -12, rotate: -1.5 }
                        : { scale: 1.05, y: 0, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 70, damping: 18 }}
                      className={cn(
                        "w-full max-w-[260px] h-auto object-contain drop-shadow-[0_20px_60px_rgba(0,0,0,0.9)] z-10",
                        !selected && "opacity-60 grayscale-[0.5] group-hover:opacity-90 group-hover:grayscale-0 transition-all duration-700"
                      )}
                    />
                  </div>

                  {/* Content Panel */}
                  <div className="flex-1 flex flex-col justify-between p-7 sm:p-8 sm:pl-4 border-t sm:border-t-0 sm:border-l border-white/[0.05]">

                    {/* Top: Badge + Name */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-[0.2em]",
                            accent.badge
                          )}>
                            {CATEGORY_ICONS[cat.id]}
                            {t(`categories_list.${cat.id}.badge`)}
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[8px] font-black uppercase tracking-widest">
                            <Zap className="w-3 h-3" />
                            MEET & GREET
                          </div>
                        </div>

                        {/* Selection indicator */}
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                          selected
                            ? "border-brand-gold bg-brand-gold shadow-[0_0_12px_rgba(212,175,55,0.6)]"
                            : "border-white/15"
                        )}>
                          {selected && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
                        </div>
                      </div>

                      <div>
                        <h3 className={cn(
                          "text-2xl sm:text-3xl font-bold font-sans uppercase tracking-tight leading-none mb-1.5 transition-colors duration-500",
                          selected ? "text-white" : "text-white/80"
                        )}>
                          {t(`categories_list.${cat.id}.name`)}
                        </h3>
                        <p className={cn(
                          "text-[10px] font-bold uppercase tracking-[0.3em]",
                          accent.text,
                          !selected && "opacity-60"
                        )}>
                          {t(`categories_list.${cat.id}.tagline`)}
                        </p>
                      </div>

                      <p className="text-[11px] text-white/35 leading-relaxed font-sans">
                        {t(`categories_list.${cat.id}.desc`)}
                      </p>

                      {/* Features */}
                      <div className="space-y-2 pt-1">
                        {(cat.features || []).slice(0, 4).map((f, fi) => (
                          <div key={fi} className="flex items-center gap-2.5">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-500",
                              selected ? "bg-brand-gold" : "bg-white/20"
                            )} />
                            <span className="text-[10px] text-white/50 font-sans font-semibold tracking-wide uppercase">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom: Specs + Price */}
                    <div className="pt-5 mt-5 border-t border-white/[0.06] space-y-4">
                      {/* Specs row */}
                      <div className="flex items-center gap-5">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-white/20" />
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-sans">
                            {cat.passengers} PAX
                          </span>
                        </div>
                        <div className="w-px h-3 bg-white/10" />
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-white/20" />
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest font-sans">
                            {cat.luggage} MALAS
                          </span>
                        </div>
                        <div className="w-px h-3 bg-white/10" />
                        <div className="flex items-center gap-1.5">
                          <Star className="w-3 h-3 fill-brand-gold text-brand-gold" />
                          <span className="text-[10px] font-bold text-brand-gold/60 font-sans">5.0</span>
                        </div>
                      </div>

                      {/* Price row */}
                      <div className="flex items-center justify-between gap-4 mt-auto">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 font-sans mb-1">
                            {form.tripType === "roundtrip" ? "Total (Ida e Volta)" : "Valor Total"}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className={cn(
                              "text-3xl sm:text-[2.2rem] font-bold tracking-tight font-sans transition-colors duration-500",
                              selected ? "text-brand-gold" : "text-white/80"
                            )}>
                              {finalPrice}
                            </span>
                            <span className="text-sm font-bold text-white/40">€</span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <div className={cn(
                          "flex items-center gap-3 px-8 py-4 rounded-2xl transition-all duration-700 shrink-0",
                          selected 
                            ? "bg-brand-gold text-black shadow-[0_10px_30px_rgba(212,175,55,0.3)]" 
                            : "border border-white/10 text-white/20 group-hover:border-white/20 group-hover:text-white/40"
                        )}>
                          <span className="text-[10px] font-black uppercase tracking-[0.35em] font-sans">
                            {selected ? "Reservar" : "Escolher"}
                          </span>
                          <ChevronRight className={cn("w-4 h-4 transition-transform", selected ? "translate-x-0.5" : "group-hover:translate-x-0.5")} />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Bottom accent strip on selected */}
                <AnimatePresence>
                  {selected && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent"
                    />
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation Bar */}
      <div className="mt-20 pt-10 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-8">
        <div>
          <h4 className="text-base font-bold text-white font-sans uppercase tracking-[0.05em] mb-1">
            {t("categories.choiceTitle")}
          </h4>
          <p className="text-[10px] text-white/25 leading-relaxed uppercase tracking-widest font-sans font-bold max-w-xs">
            {t("categories.choiceDesc")}
          </p>
        </div>

        <div className="flex items-center gap-8 font-sans">
          <button
            onClick={onBack}
            className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20 hover:text-white transition-all flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-full border border-white/[0.07] flex items-center justify-center group-hover:bg-white/5 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </div>
            {t("bookingFlow.stepVehicle.back")}
          </button>

          <button
            onClick={onNext}
            disabled={!form.category}
            className={cn(
              "relative overflow-hidden btn-editorial btn-editorial-primary !px-16 !py-7 text-base font-sans font-bold group shadow-[0_30px_60px_rgba(212,175,55,0.35)]",
              !form.category && "opacity-40 grayscale cursor-not-allowed"
            )}
          >
            <span className="relative z-10 flex items-center gap-6">
              {t("bookingFlow.stepVehicle.next")}
              <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-900" />
          </button>
        </div>
      </div>
    </div>
  );
}
