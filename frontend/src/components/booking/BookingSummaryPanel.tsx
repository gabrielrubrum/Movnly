"use client";

import { useI18n } from "@/i18n/context";
import { cn, formatCurrency, getPricingMultiplier } from "@/lib/utils";
import { type BookingFormData } from "./BookingSteps";
import { VEHICLE_CATEGORIES } from "@/lib/constants";
import { MapPin, Calendar, Clock, ShieldCheck, Check } from "lucide-react";

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

  return (
    <aside className="relative">
      <div className="sticky top-10 font-sans">
        <div className="luxury-card border-brand-gold/10 overflow-hidden animate-luxury-reveal bg-[#0A0A0F]/80 backdrop-blur-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]">
          {/* God-Tier Header */}
          <div className="p-12 pb-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold text-white uppercase tracking-tight">{t("bookingFlow.summary.title")}</h3>
              <div className="w-12 h-12 rounded-full border border-brand-gold/10 flex items-center justify-center bg-brand-gold/5">
                <ShieldCheck className="w-6 h-6 text-brand-gold/60" />
              </div>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-brand-gold/30 via-white/5 to-transparent" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 leading-relaxed">
              {t("bookingFlow.summary.subtitle")}
            </p>
          </div>

          <div className="p-12 pt-6 space-y-10">
            {/* Immersive Vehicle Identity */}
            {step > 1 && (
              <div className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.01] p-8 transition-all hover:border-brand-gold/20">
                <div className="flex items-center gap-8 relative z-10">
                  <div className="w-28 h-20 rounded-xl overflow-hidden border border-white/10 bg-black/40">
                    <img
                      src={category?.image}
                      alt={category?.name}
                      className="w-full h-full object-contain p-2 grayscale group-hover:grayscale-0 transition-all duration-1000"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold/40 block mb-2">{t("bookingFlow.summary.selectedClass")}</span>
                    <p className="text-2xl font-bold text-white uppercase tracking-tight leading-none">{category ? t(`categories_list.${category.id}.name`) : ""}</p>
                  </div>
                </div>
                <div className="mt-8 flex flex-col gap-3 border-t border-white/5 pt-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  <div className="flex items-center gap-4">
                    <Check className="w-4 h-4 text-brand-gold/40" />
                    {t("bookingFlow.summary.meetGreetIncl")}
                  </div>
                  <div className="flex items-center gap-4">
                    <Check className="w-4 h-4 text-brand-gold/40" />
                    {t("bookingFlow.summary.freeCancel")}
                  </div>
                </div>
              </div>
            )}

            {/* Path visualization */}
            <div className="space-y-10 px-2">
              <div className="flex gap-8 relative">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full border-2 border-brand-gold bg-black mt-1 shadow-[0_0_15px_rgba(212,175,55,0.4)]" />
                  <div className="w-px h-full bg-gradient-to-b from-brand-gold/40 via-white/5 to-transparent my-2" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 block mb-3">{isTour ? "Tipo de Serviço" : t("bookingFlow.summary.origin")}</label>
                  <p className="text-xs font-bold text-white uppercase tracking-widest leading-relaxed">
                    {isTour ? "Roteiro Exclusivo" : (form.origin || t("bookingFlow.summary.notDefined"))}
                  </p>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="flex flex-col items-center">
                  <MapPin className="w-4 h-4 text-white/20 mt-1" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 block mb-3">{isTour ? "Destino do Tour" : t("bookingFlow.summary.destination")}</label>
                  <p className="text-xs font-bold text-white uppercase tracking-widest leading-relaxed">
                    {isTour ? tourData?.title : (form.destination || t("bookingFlow.summary.notDefined"))}
                  </p>
                </div>
              </div>
            </div>

            {/* Temporal Details - Aligned with Path */}
            <div className="space-y-10 px-2 border-t border-white/5 pt-10">
              <div className="flex gap-8 relative">
                <div className="flex flex-col items-center">
                  <Clock className="w-4 h-4 text-white/20 mt-1" />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 block mb-3">{t("bookingFlow.summary.pickup")}</label>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-white uppercase tracking-widest leading-relaxed">
                      {form.date} <span className="text-brand-gold/40 mx-2">•</span> {form.time}
                    </p>
                    {(form.flightNumber || form.airline) && (
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold/60 mt-2 flex items-center gap-2">
                         <span className="opacity-40">{t("booking.flightNumber")}:</span> {form.airline} {form.flightNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Financial Ledger */}
            <div className="pt-6 space-y-6">
              {total > 0 && (
                <>
                  <div className="flex justify-between items-start text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
                    <div className="space-y-3">
                      <span>{t("bookingFlow.summary.baseRate")}</span>
                      {(() => {
                        const pricing = getPricingMultiplier(form.date, form.time);
                        return pricing.reasons.length > 0 && (
                          <div className="flex flex-wrap gap-3">
                            {pricing.reasons.map((r: string) => (
                              <span key={r} className="text-[8px] text-brand-gold bg-brand-gold/5 border border-brand-gold/10 px-2 py-1 rounded-lg">
                                {t(`bookingFlow.summary.reasons.${r}`).toUpperCase()}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                    <span className="text-white/80">{formatCurrency(calculatedBasePrice)}</span>
                  </div>

                  {extrasTotal > 0 && (
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
                      <span>{t("bookingFlow.summary.exclusiveAmenities")}</span>
                      <span className="text-white/80">{formatCurrency(extrasTotal)}</span>
                    </div>
                  )}
                </>
              )}


              <div className="pt-12 mt-4 flex flex-col gap-6">
                <div className="flex justify-between items-center border-t border-brand-gold/20 pt-12">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">{t("bookingFlow.summary.totalAmount")}</span>
                  <div className="text-right">
                    <p className="text-5xl font-bold text-brand-gold tracking-tighter leading-none">
                      {total > 0 ? formatCurrency(total) : "—"}
                    </p>
                    <p className="text-[8px] font-black tracking-[0.3em] text-white/10 mt-2 uppercase">{t("bookingFlow.summary.vatIncluded")}</p>
                  </div>
                </div>

                <div className="mt-12 group/seal relative">
                  <div className="absolute -inset-4 bg-brand-gold/5 rounded-[2rem] blur-xl opacity-0 group-hover/seal:opacity-100 transition-opacity" />
                  <div className="relative flex items-center gap-6 p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 overflow-hidden">
                    <div className="w-12 h-12 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0 border border-brand-gold/10">
                      <ShieldCheck className="w-6 h-6 text-brand-gold" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 leading-relaxed">
                      {t("bookingFlow.summary.secureProtocol")}
                    </p>
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
