"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { EXTRAS } from "@/lib/constants";
import { type BookingFormData } from "../BookingSteps";
import { ArrowLeft, ChevronRight, Plus, Check, Sparkles } from "lucide-react";
import { useI18n } from "@/i18n/context";

interface Props {
  form: BookingFormData;
  update: (p: Partial<BookingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepExtras({ form, update, onNext, onBack }: Props) {
  const { t } = useI18n();

  const toggle = (id: string) => {
    const extras = form.extras.includes(id)
      ? form.extras.filter((e) => e !== id)
      : [...form.extras, id];
    update({ extras });
  };

  return (
    <div className="animate-luxury-reveal space-y-12 pb-12">
      <div className="flex flex-col gap-2 mb-12">
        <span className="badge-editorial w-fit">{t("bookingFlow.steps.extras")}</span>
        <div className="flex items-center gap-6 mt-4">
          <button onClick={onBack} className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white transition-all border border-white/5">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="luxury-headline text-white">{t("bookingFlow.stepExtras.title")}</h2>
            <p className="luxury-subheadline text-white/40 mt-3">{t("bookingFlow.stepExtras.sub")}</p>
          </div>
        </div>
      </div>

      {/* Featured Offer: Meet & Greet */}
      {(() => {
        const mg = EXTRAS.find(e => e.id === "meet_greet");
        if (!mg) return null;
        const selected = form.extras.includes(mg.id);
        return (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6 px-1">
              <Sparkles className="w-5 h-5 text-brand-gold" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-brand-gold/80 font-sans">{t("bookingFlow.stepExtras.recommendation")}</span>
            </div>
            <button
              onClick={() => toggle(mg.id)}
              className={cn(
                "w-full text-left transition-all duration-700 group/featured rounded-[48px] overflow-hidden border",
                selected
                  ? "bg-brand-gold/[0.03] border-brand-gold/40 shadow-2xl shadow-brand-gold/5"
                  : "bg-white/[0.02] border-white/5 hover:border-brand-gold/30"
              )}
            >
              <div className="flex flex-col md:flex-row items-stretch">
                <div className="md:w-64 bg-gradient-to-br from-brand-gold/10 to-transparent flex items-center justify-center p-12 border-b md:border-b-0 md:border-r border-white/[0.05]">
                  <div className={cn(
                    "w-24 h-24 rounded-[32px] flex items-center justify-center transition-all duration-700",
                    selected
                      ? "bg-brand-gold text-black shadow-2xl shadow-brand-gold/40 scale-110"
                      : "bg-white/[0.06] text-brand-gold/40 group-hover/featured:scale-105"
                  )}>
                    <Sparkles className="w-12 h-12" />
                  </div>
                </div>
                <div className="flex-1 p-8 md:p-12 relative overflow-hidden">
                  {/* Glass decorative element */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-3xl font-bold text-white font-sans uppercase tracking-tight mb-3">{t("bookingFlow.stepExtras.mgTitle")}</h3>
                        <p className="text-xs font-medium text-white/50 leading-relaxed font-sans max-w-sm">{t("bookingFlow.stepExtras.mgDesc")}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-black text-brand-gold font-sans tracking-tighter">
                          {mg.price === 0 ? "INCLUÍDO" : `+${formatCurrency(mg.price)}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/5">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 font-sans">{t("bookingFlow.stepExtras.exclusiveService")}</span>
                      <div className={cn(
                        "flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all font-sans",
                        selected ? "text-brand-gold" : "text-white/40 group-hover/featured:text-white"
                      )}>
                        {selected ? (
                          <><Check className="w-5 h-5" /> {t("bookingFlow.stepExtras.selected")}</>
                        ) : (
                          <><Plus className="w-5 h-5" /> {t("bookingFlow.stepExtras.add")}</>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          </div>
        );
      })()}

      <div className="grid md:grid-cols-2 gap-6">
        {EXTRAS.filter(e => e.id !== "meet_greet").map((extra) => {
          const selected = form.extras.includes(extra.id);
          return (
            <button
              key={extra.id}
              onClick={() => toggle(extra.id)}
              className={cn(
                "p-8 text-left flex items-center gap-6 transition-all duration-500 rounded-[32px] border group",
                selected
                  ? "bg-brand-gold/[0.03] border-brand-gold/30"
                  : "bg-white/[0.02] border-white/5 hover:border-brand-gold/20"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500",
                selected ? "bg-brand-gold text-black shadow-lg shadow-brand-gold/20" : "bg-white/[0.06] text-white/30 group-hover:bg-white/10"
              )}>
                {selected ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-colors font-sans">{t(`bookingFlow.extras.${extra.id}`)}</p>
              </div>
              <span className="text-xl font-black text-brand-gold font-sans tracking-tighter">+{formatCurrency(extra.price)}</span>
            </button>
          );
        })}
      </div>

      {form.extras.length === 0 && (
        <p className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-white/20 pt-8 animate-fade-in font-sans">
          {t("bookingFlow.stepExtras.noExtras")}
        </p>
      )}

      {/* Action CTAs */}
      <div className="pt-16 flex flex-col sm:flex-row gap-6">
        <button
          onClick={onBack}
          className="flex-1 flex items-center justify-center gap-6 py-6 border border-white/10 text-white/40 rounded-[40px] hover:bg-white/5 hover:text-white transition-all font-sans"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-[11px] font-black uppercase tracking-[0.4em]">{t("bookingFlow.stepExtras.back")}</span>
        </button>
        <button
          onClick={onNext}
          className="flex-[2] flex items-center justify-center gap-8 py-8 bg-brand-gold text-black rounded-[40px] shadow-2xl hover:bg-white transition-all group overflow-hidden font-sans"
        >
          <span className="text-[13px] font-black uppercase tracking-[0.5em]">{t("bookingFlow.stepExtras.next")}</span>
          <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-4 transition-transform text-black">
            <ChevronRight className="w-6 h-6" />
          </div>
        </button>
      </div>

    </div>
  );
}
