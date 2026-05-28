"use client";

import React from "react";
import { useI18n } from "@/i18n/context";
import { cn, formatCurrency, getPricingMultiplier } from "@/lib/utils";
import { VEHICLE_CATEGORIES } from "@/lib/constants";
import { type BookingFormData } from "../BookingSteps";
import { type VehicleCategory } from "@/lib/types";
import { Users, Briefcase, Check, ArrowLeft, ChevronRight, Star, Shield, Wifi, Zap, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  form: BookingFormData;
  update: (p: Partial<BookingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const CATEGORY_ACCENTS: Record<string, { glow: string; badge: string; text: string }> = {
  smart:     { glow: "rgba(100,116,139,0.3)", badge: "bg-slate-700/80 text-slate-200",      text: "text-slate-300" },
  comfort:   { glow: "rgba(59,130,246,0.3)",  badge: "bg-blue-900/80 text-blue-200",        text: "text-blue-300" },
  group:     { glow: "rgba(245,158,11,0.3)",  badge: "bg-amber-900/80 text-amber-200",      text: "text-amber-300" },
  executive: { glow: "rgba(212,175,55,0.4)",  badge: "bg-brand-gold text-black font-black", text: "text-brand-gold" },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  smart:     <Wifi className="w-3.5 h-3.5" />,
  comfort:   <Star className="w-3.5 h-3.5" />,
  group:     <Users className="w-3.5 h-3.5" />,
  executive: <Shield className="w-3.5 h-3.5" />,
};

const CATEGORY_INCLUDED: Record<string, string[]> = {
  smart:     ["Wi-Fi gratuito", "Águas a bordo", "15 min espera"],
  comfort:   ["Meet & Greet", "15 min espera", "Estofos em pele"],
  group:     ["Meet & Greet", "30 min espera", "Configuração conferência"],
  executive: ["Meet & Greet VIP", "60 min espera", "Amenities premium"],
};

export function StepVehicle({ form, update, onNext, onBack }: Props) {
  const { t } = useI18n();

  return (
    <div className="animate-luxury-reveal min-h-screen pb-40">
      {/* Header */}
      <div className="flex items-center gap-6 mb-10">
        <button onClick={onBack} className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/30 hover:text-brand-gold hover:border-brand-gold/40 transition-all duration-500 group shrink-0">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold/60 mb-2 font-sans">Etapa 2 · Veículo</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-sans uppercase tracking-tight leading-none">Escolha o seu veículo</h2>
        </div>
      </div>

      {/* Transparency notice */}
      <div className="flex items-start gap-4 p-5 rounded-2xl bg-brand-gold/[0.04] border border-brand-gold/15 mb-10">
        <Info className="w-4 h-4 text-brand-gold/60 shrink-0 mt-0.5" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 leading-relaxed">
          Todos os preços incluem encargos, IVA e serviços indicados · Sem taxas escondidas
        </p>
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
          const included = CATEGORY_INCLUDED[cat.id] || [];

          return (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="relative group">
              <button
                onClick={() => {
                  update({ category: cat.id as VehicleCategory });
                  setTimeout(() => onNext(), 600);
                }}
                className={cn(
                  "w-full text-left relative overflow-hidden transition-all duration-700 rounded-[2.5rem] border isolate group/card",
                  selected
                    ? "border-brand-gold/60 shadow-[0_0_80px_-20px_rgba(212,175,55,0.35)] bg-[#08080C] scale-[1.01] z-20"
                    : "border-white/[0.06] bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02] z-10"
                )}
              >
                <AnimatePresence>
                  {selected && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="absolute inset-0 pointer-events-none z-0"
                      style={{ background: `radial-gradient(ellipse 80% 60% at 60% 10%, ${accent.glow} 0%, transparent 70%)` }}
                    />
                  )}
                </AnimatePresence>
                <div className="absolute inset-0 pointer-events-none z-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700"
                  style={{ background: `radial-gradient(ellipse 70% 50% at 60% 0%, ${accent.glow.replace("0.3","0.1").replace("0.4","0.12")} 0%, transparent 70%)` }}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.025] to-transparent -translate-x-full group-hover/card:translate-x-full transition-transform duration-[2000ms] ease-in-out pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full">
                  {/* Image Panel */}
                  <div className="relative h-[200px] flex items-center justify-center p-8 overflow-hidden bg-gradient-to-b from-white/[0.03] to-transparent">
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[70%] h-10 bg-black/60 blur-2xl rounded-[100%]" />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[80%] h-6 bg-brand-gold/10 blur-[30px] rounded-full opacity-0 group-hover/card:opacity-100 transition-all duration-1000" />
                    <motion.img
                      src={cat.image} alt={cat.name}
                      animate={selected ? { scale: 1.1, y: -6 } : { scale: 1, y: 0 }}
                      whileHover={{ scale: 1.06, y: -3 }}
                      transition={{ type: "spring", stiffness: 40, damping: 20 }}
                      className={cn("w-full max-w-[300px] h-auto object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.8)] z-10 relative", !selected && "opacity-55 grayscale group-hover/card:opacity-100 group-hover/card:grayscale-0 transition-all duration-1000")}
                    />
                    <div className="absolute top-5 right-5 z-20">
                      <div className={cn("w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500", selected ? "border-brand-gold bg-brand-gold shadow-[0_0_20px_rgba(212,175,55,0.8)]" : "border-white/10 bg-black/20 group-hover/card:border-white/30")}>
                        {selected && <Check className="w-3.5 h-3.5 text-black" strokeWidth={3} />}
                      </div>
                    </div>
                    <div className="absolute top-5 left-5 z-20 flex flex-col gap-2">
                      <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl backdrop-blur-md", accent.badge)}>
                        {CATEGORY_ICONS[cat.id]}
                        {t(`categories_list.${cat.id}.badge`)}
                      </div>
                      {cat.id === "executive" && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[9px] font-black uppercase tracking-[0.25em] backdrop-blur-md">
                          <Zap className="w-3 h-3 animate-pulse" /> MEET & GREET
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col p-6 sm:p-8 border-t border-white/[0.04]">
                    <div className="mb-5">
                      <h3 className={cn("text-3xl font-black font-sans uppercase tracking-tighter leading-none mb-1.5 transition-colors duration-500", selected ? "text-white" : "text-white/75")}>
                        {t(`categories_list.${cat.id}.name`)}
                      </h3>
                      <p className={cn("text-[10px] font-black uppercase tracking-[0.35em]", accent.text, !selected && "opacity-50")}>
                        {t(`categories_list.${cat.id}.tagline`)}
                      </p>
                    </div>

                    {/* Price Breakdown */}
                    <div className={cn("rounded-2xl border p-5 mb-5 transition-all duration-500", selected ? "bg-brand-gold/[0.04] border-brand-gold/20" : "bg-white/[0.02] border-white/[0.04]")}>
                      <div className="flex items-baseline justify-between mb-3">
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/30">Tarifa base</span>
                        <span className="text-sm font-black text-white/45">{formatCurrency(cat.basePrice)}</span>
                      </div>
                      <div className="space-y-1.5 mb-4 pb-4 border-b border-white/[0.05]">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20 mb-2">Incluído:</p>
                        {["Cancelamento grátis", ...included.slice(0, 2)].map((item) => (
                          <div key={item} className="flex items-center gap-2">
                            <Check className={cn("w-3 h-3 shrink-0", selected ? "text-brand-gold" : "text-white/20")} strokeWidth={3} />
                            <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/30">{item}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25 block mb-1">
                            {form.tripType === "roundtrip" ? "Total estimado (ida+volta)" : "Total estimado"}
                          </span>
                          {pricing1.reasons.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {pricing1.reasons.map((r: string) => (
                                <span key={r} className="text-[8px] text-brand-gold bg-brand-gold/10 border border-brand-gold/20 px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                                  {r === "night_shift" ? "Noturno" : r === "peak_hour" ? "Ponta" : r === "weekend" ? "Fim de semana" : r}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className={cn("text-4xl font-black tracking-tighter font-sans transition-colors duration-500", selected ? "text-brand-gold" : "text-white")}>
                          {finalPrice}<span className="text-xs font-black text-white/20 ml-1">EUR</span>
                        </div>
                      </div>
                    </div>

                    {/* Specs */}
                    <div className="flex flex-wrap items-center gap-4 mb-5">
                      <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5 text-white/20" /><span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{cat.passengers} pax</span></div>
                      <div className="w-px h-3 bg-white/10" />
                      <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-white/20" /><span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{cat.luggage} malas</span></div>
                      <div className="w-px h-3 bg-white/10" />
                      <div className="flex items-center gap-2"><Star className="w-3.5 h-3.5 fill-brand-gold/40 text-brand-gold/40" /><span className="text-[10px] font-black text-brand-gold/40">5.0</span></div>
                    </div>

                    {/* Select CTA */}
                    <div className={cn("w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl transition-all duration-500 text-[11px] font-black uppercase tracking-[0.3em] font-sans pointer-events-none",
                      selected ? "bg-brand-gold text-black" : "bg-white/[0.04] border border-white/10 text-white/35 group-hover/card:border-brand-gold/40 group-hover/card:text-white/70"
                    )}>
                      {selected ? (<><Check className="w-4 h-4" strokeWidth={3} /> Selecionado</>) : (<>Selecionar <ChevronRight className="w-4 h-4" /></>)}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {selected && (
                    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
                      className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent"
                    />
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="mt-20 pt-10 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="text-center md:text-left">
          <h4 className="text-base font-bold text-white font-sans uppercase tracking-[0.05em] mb-1">Próximo passo</h4>
          <p className="text-[10px] text-white/25 leading-relaxed uppercase tracking-widest font-sans font-bold max-w-xs mx-auto md:mx-0">
            Confirme sua seleção e escolha os opcionais na próxima etapa
          </p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row items-center gap-6 w-full md:w-auto font-sans">
          <button onClick={onBack} className="w-full sm:w-auto text-[10px] font-black uppercase tracking-[0.5em] text-white/20 hover:text-white transition-all flex items-center justify-center gap-3 py-4 sm:py-0 group">
            <div className="w-10 h-10 rounded-full border border-white/[0.07] flex items-center justify-center group-hover:bg-white/5 transition-all"><ArrowLeft className="w-4 h-4" /></div>
            Voltar
          </button>
          <button
            onClick={onNext} disabled={!form.category}
            className={cn("w-full sm:w-auto relative overflow-hidden btn-editorial btn-editorial-primary !px-10 md:!px-14 !py-5 md:!py-7 font-sans font-black group shadow-[0_30px_80px_-20px_rgba(212,175,55,0.4)]", !form.category && "opacity-40 grayscale cursor-not-allowed")}
          >
            <span className="relative z-10 flex items-center justify-center gap-5 text-xs md:text-sm">
              <span className="text-[10px] md:text-xs opacity-40 font-black tracking-tighter">02</span>
              Escolher opcionais
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-3 transition-transform duration-700 ease-in-out" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1200ms] ease-in-out" />
          </button>
        </div>
      </div>
    </div>
  );
}
