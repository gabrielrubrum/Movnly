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
                  "w-full text-left relative overflow-hidden transition-all duration-1000",
                  "rounded-[2.5rem] border isolate group/card",
                  selected
                    ? "border-brand-gold/60 shadow-[0_0_100px_-20px_rgba(212,175,55,0.4),0_0_0_1px_rgba(212,175,55,0.2)] bg-[#08080C] scale-[1.02] z-20"
                    : "border-white/[0.05] bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02] z-10"
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

                {/* Atmospheric light streak inside card */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-[2000ms] ease-in-out pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">

                  {/* Vehicle Image Panel - Top Half */}
                  <div className="relative h-[280px] flex items-center justify-center p-8 overflow-hidden bg-gradient-to-b from-white/[0.04] to-transparent">
                    {/* Decorative Grid */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />
                    
                    {/* Floor reflection / Podium */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-8 bg-brand-gold/15 blur-[40px] rounded-full opacity-0 group-hover/card:opacity-100 transition-all duration-1000" />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[70%] h-12 bg-black/60 blur-2xl rounded-[100%] opacity-90" />

                    {/* Car image */}
                    <motion.img
                      src={cat.image}
                      alt={cat.name}
                      animate={selected
                        ? { scale: 1.15, y: -10, rotate: -1.5 }
                        : { scale: 1, y: 0, rotate: 0 }}
                      whileHover={{ scale: 1.08, y: -5 }}
                      transition={{ type: "spring", stiffness: 40, damping: 20 }}
                      className={cn(
                        "w-full max-w-[360px] h-auto object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,0.8)] z-10 relative",
                        !selected && "opacity-60 grayscale group-hover/card:opacity-100 group-hover/card:grayscale-0 transition-all duration-1000"
                      )}
                    />

                    {/* Selection indicator - Top Right */}
                    <div className="absolute top-8 right-8 z-20">
                      <div className={cn(
                        "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-700",
                        selected
                          ? "border-brand-gold bg-brand-gold shadow-[0_0_20px_rgba(212,175,55,0.8)] scale-110"
                          : "border-white/10 bg-black/20"
                      )}>
                        {selected && <Check className="w-5 h-5 text-black" strokeWidth={4} />}
                      </div>
                    </div>

                    {/* Category Badge - Top Left */}
                    <div className="absolute top-8 left-8 z-20 flex flex-col gap-3">
                        <div className={cn(
                          "inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md",
                          accent.badge
                        )}>
                          {CATEGORY_ICONS[cat.id]}
                          {t(`categories_list.${cat.id}.badge`)}
                        </div>
                        {cat.id === "executive" && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[9px] font-black uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(212,175,55,0.2)] backdrop-blur-md">
                            <Zap className="w-3.5 h-3.5 animate-pulse" />
                            MEET & GREET
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Content Panel - Bottom Half */}
                  <div className="flex-1 flex flex-col p-10 space-y-10 border-t border-white/[0.05]">
                    
                    <div className="flex flex-col gap-4">
                      <div>
                        <h3 className={cn(
                          "text-4xl font-black font-sans uppercase tracking-tighter leading-none mb-3 transition-colors duration-700",
                          selected ? "text-white" : "text-white/80"
                        )}>
                          {t(`categories_list.${cat.id}.name`)}
                        </h3>
                        <p className={cn(
                          "text-[10px] font-black uppercase tracking-[0.4em]",
                          accent.text,
                          !selected && "opacity-50"
                        )}>
                          {t(`categories_list.${cat.id}.tagline`)}
                        </p>
                      </div>

                      <p className="text-xs text-white/30 leading-relaxed font-sans max-w-sm">
                        {t(`categories_list.${cat.id}.desc`)}
                      </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5 py-8 border-y border-white/[0.03]">
                      {(cat.features || []).slice(0, 4).map((f, fi) => (
                        <div key={fi} className="flex items-center gap-4 group/feat">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-700",
                            selected ? "bg-brand-gold shadow-[0_0_12px_rgba(212,175,55,1)]" : "bg-white/10 group-hover/feat:bg-white/30"
                          )} />
                          <span className="text-[10px] text-white/30 font-sans font-black tracking-[0.15em] uppercase group-hover/feat:text-white/60 transition-colors">{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom row: Specs + Price & CTA */}
                    <div className="flex flex-col gap-10">
                      {/* Specs Row */}
                      <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-white/20" />
                          <span className="text-[11px] font-black text-white/40 uppercase tracking-widest font-sans">
                            {cat.passengers} PAX
                          </span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-4 h-4 text-white/20" />
                          <span className="text-[11px] font-black text-white/40 uppercase tracking-widest font-sans">
                            {cat.luggage} MALAS
                          </span>
                        </div>
                        <div className="w-px h-4 bg-white/10" />
                        <div className="flex items-center gap-2">
                          <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                          <span className="text-[11px] font-black text-brand-gold/60 font-sans">5.0</span>
                        </div>
                      </div>

                      {/* Financials & CTA */}
                      <div className="flex items-center justify-between gap-4 pt-6">
                        <div className="flex flex-col min-w-[120px]">
                          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20 font-sans mb-2">
                            {form.tripType === "roundtrip" ? "Total (Ida e Volta)" : "Valor Total"}
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className={cn(
                              "text-5xl font-black tracking-tighter font-sans transition-colors duration-700",
                              selected ? "text-brand-gold" : "text-white"
                            )}>
                              {finalPrice}
                            </span>
                            <span className="text-base font-black text-white/10 tracking-widest uppercase">EUR</span>
                          </div>
                        </div>

                        {/* CTA Button */}
                        <div className={cn(
                          "flex items-center gap-4 px-8 py-5 rounded-2xl transition-all duration-700 shrink-0 isolate relative overflow-hidden",
                          selected 
                            ? "bg-brand-gold text-black shadow-[0_20px_40px_rgba(212,175,55,0.4)]" 
                            : "bg-white/[0.04] border border-white/10 text-white/40 group-hover/card:border-brand-gold/50 group-hover/card:text-white group-hover/card:bg-brand-gold/10"
                        )}>
                          <span className="text-[11px] font-black uppercase tracking-[0.4em] font-sans relative z-10">
                            {selected ? "Reservado" : "Escolher"}
                          </span>
                          <ChevronRight className={cn("w-5 h-5 transition-transform relative z-10", selected ? "translate-x-1.5" : "group-hover/card:translate-x-1.5")} />
                          {selected && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[200%] animate-[shimmer_1.5s_infinite] z-0" />
                          )}
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
              "relative overflow-hidden btn-editorial btn-editorial-primary !px-20 !py-8 text-lg font-sans font-black group shadow-[0_40px_100px_-20px_rgba(212,175,55,0.45)] hover:shadow-[0_50px_120px_-20px_rgba(212,175,55,0.6)]",
              !form.category && "opacity-40 grayscale cursor-not-allowed"
            )}
          >
            <span className="relative z-10 flex items-center gap-8">
              <span className="text-xs opacity-40 font-black tracking-tighter">02</span>
              {t("bookingFlow.stepVehicle.next")}
              <ChevronRight className="w-8 h-8 group-hover:translate-x-4 transition-transform duration-700 ease-in-out" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1200ms] ease-in-out" />
          </button>
        </div>
      </div>
    </div>
  );
}
