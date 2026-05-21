"use client";

import { useI18n } from "@/i18n/context";
import { cn, formatCurrency, getPricingMultiplier } from "@/lib/utils";
import { type BookingFormData } from "./BookingSteps";
import { VEHICLE_CATEGORIES, EXTRAS } from "@/lib/constants";
import { MapPin, Clock, ShieldCheck, Check, Users, Briefcase, Calendar, Lock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  form: BookingFormData;
  total: number;
  extrasTotal: number;
  calculatedBasePrice: number;
  step: number;
  isTour?: boolean;
  tourData?: any;
}

export function BookingSummaryPanel({ form, total, extrasTotal, calculatedBasePrice, step, isTour, tourData }: Props) {
  const { t } = useI18n();
  const category = VEHICLE_CATEGORIES.find((c) => c.id === form.category);
  const selectedExtras = form.extras.map(id => EXTRAS.find(e => e.id === id)).filter(Boolean);

  const stepLabel = step === 1 ? "Prévia da viagem" :
                    step === 2 ? "Resumo da viagem" :
                    step >= 3  ? "Resumo da reserva" : "Prévia da viagem";

  return (
    <aside className="relative lg:block">
      <div className="sticky top-24 font-sans">
        <div className="glass-bento-luxury border-white/[0.06] overflow-hidden animate-luxury-reveal bg-[#080810]/70 backdrop-blur-[40px] shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9)]">

          {/* Header */}
          <div className="p-6 sm:p-10 pb-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-gold/50 mb-2">{stepLabel}</p>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">
                  {step <= 1 ? "Detalhes" : "Resumo da viagem"}
                </h3>
              </div>
              <div className="w-12 h-12 rounded-2xl border border-brand-gold/15 flex items-center justify-center bg-brand-gold/[0.06] shadow-[0_0_30px_rgba(212,175,55,0.08)]">
                <ShieldCheck className="w-6 h-6 text-brand-gold/50" />
              </div>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-brand-gold/25 via-white/[0.04] to-transparent" />
          </div>

          <div className="p-6 sm:p-10 pt-4 space-y-7">

            {/* Vehicle Card — shows from step 2+ */}
            <AnimatePresence>
              {step > 1 && category && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-white/[0.015] p-5 transition-all hover:border-brand-gold/20"
                >
                  <div className="flex items-center gap-5 relative z-10">
                    <div className="w-24 h-16 rounded-xl overflow-hidden border border-white/[0.08] bg-black/40 shrink-0">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-contain p-1.5 grayscale group-hover:grayscale-0 transition-all duration-700"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-[0.35em] text-brand-gold/40 block mb-1">
                        Veículo selecionado
                      </span>
                      <p className="text-lg font-black text-white uppercase tracking-tight leading-none">
                        {t(`categories_list.${category.id}.name`)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/[0.04] pt-4">
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-brand-gold/50" strokeWidth={3} />
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/25">Meet & Greet</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-brand-gold/50" strokeWidth={3} />
                      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/25">Cancelamento grátis</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Route */}
            <div className="space-y-7 px-2 relative">
              <div className="absolute left-[7px] top-3 bottom-3 w-[1px] bg-gradient-to-b from-brand-gold/60 via-brand-gold/15 to-emerald-500/30 z-0" />

              <div className="flex gap-6 relative z-10">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-gold bg-[#080810] mt-0.5 shadow-[0_0_12px_rgba(212,175,55,0.5)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <label className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 block mb-1.5">
                    {isTour ? "Tipo" : t("bookingFlow.summary.origin")}
                  </label>
                  <p className="text-[11px] font-black text-white uppercase tracking-wide leading-snug truncate">
                    {isTour ? "Roteiro exclusivo" : (form.origin || t("bookingFlow.summary.notDefined"))}
                  </p>
                </div>
              </div>

              <div className="flex gap-6 relative z-10">
                <div className="w-3 h-3 rounded-sm bg-emerald-500 mt-0.5 shadow-[0_0_10px_rgba(16,185,129,0.35)] shrink-0 ml-[1px]" />
                <div className="flex-1 min-w-0">
                  <label className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 block mb-1.5">
                    {isTour ? "Destino" : t("bookingFlow.summary.destination")}
                  </label>
                  <p className="text-[11px] font-black text-white uppercase tracking-wide leading-snug truncate">
                    {isTour ? tourData?.title : (form.destination || t("bookingFlow.summary.notDefined"))}
                  </p>
                </div>
              </div>
            </div>

            {/* Date / Time / Pax */}
            <div className="grid grid-cols-2 gap-3 border-t border-white/[0.04] pt-6">
              {form.date && (
                <div className="flex items-start gap-3">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold/40 mt-0.5 shrink-0" />
                  <div>
                    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 block mb-1">Data</label>
                    <p className="text-[10px] font-black text-white uppercase tracking-wide">{form.date}</p>
                  </div>
                </div>
              )}
              {form.time && (
                <div className="flex items-start gap-3">
                  <Clock className="w-3.5 h-3.5 text-brand-gold/40 mt-0.5 shrink-0" />
                  <div>
                    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 block mb-1">Horário</label>
                    <p className="text-[10px] font-black text-white uppercase tracking-wide">{form.time}</p>
                  </div>
                </div>
              )}
              {form.passengers > 0 && (
                <div className="flex items-start gap-3">
                  <Users className="w-3.5 h-3.5 text-brand-gold/40 mt-0.5 shrink-0" />
                  <div>
                    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 block mb-1">Passageiros</label>
                    <p className="text-[10px] font-black text-white uppercase tracking-wide">{form.passengers} pax</p>
                  </div>
                </div>
              )}
              {form.luggage > 0 && (
                <div className="flex items-start gap-3">
                  <Briefcase className="w-3.5 h-3.5 text-brand-gold/40 mt-0.5 shrink-0" />
                  <div>
                    <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 block mb-1">Bagagem</label>
                    <p className="text-[10px] font-black text-white uppercase tracking-wide">{form.luggage} mala{form.luggage !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Flight info */}
            {(form.flightNumber || form.airline) && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-gold/[0.05] border border-brand-gold/15">
                <span className="text-[8px] font-black uppercase tracking-widest text-brand-gold/50">Voo:</span>
                <span className="text-[9px] font-black text-brand-gold uppercase tracking-widest">{form.airline} {form.flightNumber}</span>
              </div>
            )}

            {/* Extras */}
            <AnimatePresence>
              {selectedExtras.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2 border-t border-white/[0.04] pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-3 h-3 text-brand-gold/40" />
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">Opcionais</span>
                  </div>
                  {selectedExtras.map((extra) => extra && (
                    <div key={extra.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.1em]">{extra.name}</span>
                      <span className="text-[9px] font-black text-brand-gold">
                        {extra.price === 0 ? "Incluído" : `+${formatCurrency(extra.price)}`}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Financial Ledger */}
            <div className="pt-2 space-y-4">
              {total > 0 && (
                <div className="space-y-3">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.35em]">
                    <span className="text-white/25">Subtotal (veículo)</span>
                    <span className="text-white/50">{formatCurrency(calculatedBasePrice)}</span>
                  </div>

                  {/* Dynamic reasons */}
                  {(() => {
                    const pricing = getPricingMultiplier(form.date, form.time);
                    return pricing.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {pricing.reasons.map((r: string) => (
                          <span key={r} className="text-[8px] text-brand-gold bg-brand-gold/[0.06] border border-brand-gold/15 px-2 py-1 rounded-lg font-black uppercase tracking-wider">
                            {t(`bookingFlow.summary.reasons.${r}`)}
                          </span>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Extras total */}
                  {extrasTotal > 0 && (
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.35em]">
                      <span className="text-white/25">Opcionais</span>
                      <span className="text-white/50">+{formatCurrency(extrasTotal)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Total */}
              <div className="pt-6 mt-2 flex justify-between items-center border-t border-brand-gold/20 relative overflow-hidden group/price">
                <span className="text-[9px] font-black uppercase tracking-[0.45em] text-white/20">Total estimado</span>
                <div className="text-right">
                  <div className="flex items-baseline gap-2">
                    <motion.p
                      key={total}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className="text-6xl font-black text-brand-gold tracking-tighter leading-none"
                    >
                      {total > 0 ? Math.round(total) : "—"}
                    </motion.p>
                    <span className="text-xl font-black text-brand-gold/30 tracking-widest">EUR</span>
                  </div>
                  <p className="text-[7px] font-black tracking-[0.4em] text-white/10 mt-2 uppercase">IVA incluído</p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-gold/[0.04] to-transparent -translate-x-full group-hover/price:translate-x-full transition-transform duration-[2000ms] ease-in-out" />
              </div>

              {/* Security Seal */}
              <div className="mt-8 group/seal relative">
                <div className="absolute -inset-3 bg-brand-gold/[0.04] rounded-[1.5rem] blur-xl opacity-0 group-hover/seal:opacity-100 transition-opacity" />
                <div className="relative flex items-center gap-5 p-5 rounded-[1.5rem] bg-white/[0.02] border border-white/[0.04]">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/[0.08] flex items-center justify-center shrink-0 border border-brand-gold/10">
                    <Lock className="w-4 h-4 text-brand-gold/60" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25 leading-relaxed">
                      Pagamento 100% seguro via Stripe
                    </p>
                    <p className="text-[8px] font-bold text-white/12 uppercase tracking-wider mt-0.5">Encriptação SSL · Anti-fraude ativo</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </aside>
  );
}
