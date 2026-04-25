"use client";

import { useI18n } from "@/i18n/context";
import { MapPin, Calendar, Clock, Users, Briefcase, ArrowRight, PlaneTakeoff, ChevronDown } from "lucide-react";
import { type BookingFormData } from "../BookingSteps";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { useState, useRef, useEffect, ReactNode } from "react";
import { LocationInput } from "../LocationInput";

interface Props {
  form: BookingFormData;
  update: (p: Partial<BookingFormData>) => void;
  onNext: () => void;
}

/**
 * Unified Field Wrapper for all form elements to ensure perfect alignment
 */
function FieldWrapper({ label, icon: Icon, children, className }: { label: string; icon: any; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-4 group", className)}>
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 group-focus-within:text-brand-gold transition-colors flex items-center gap-3 font-sans">
        <Icon className="w-3.5 h-3.5" /> {label}
      </label>
      <div className="relative">
        {children}
      </div>
    </div>
  );
}

function LuxurySelect({ label, value, options, icon: Icon, onChange }: { label: string; value: number; options: number[]; icon: any; onChange: (v: number) => void }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <FieldWrapper label={label} icon={Icon} className="relative">
      <div ref={containerRef} className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between nx-input hover:border-white/20 h-[64px] px-6 transition-all text-sm font-bold"
        >
          <span>{value}</span>
          <ChevronDown className={cn("w-4 h-4 text-white/30 transition-transform duration-500", open && "rotate-180")} />
        </button>

        {open && (
          <div className="absolute top-[calc(100%+12px)] left-0 w-full bg-[#0A0A0F] border border-white/10 rounded-2xl shadow-[0_40px_80px_rgba(0,0,0,0.8)] p-2 z-[110] animate-luxury-reveal max-h-60 overflow-y-auto scrollbar-hide">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { 
                  onChange(opt); 
                  setOpen(false); 
                }}
                className={cn(
                  "w-full text-left px-5 py-4 text-xs font-semibold rounded-xl transition-all font-sans uppercase tracking-[0.15em] mb-1 last:mb-0",
                  value === opt ? "bg-brand-gold text-black shadow-lg" : "text-white/40 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}

export function StepDetails({ form, update, onNext }: Props) {
  const { t } = useI18n();

  return (
    <div className="animate-luxury-reveal space-y-16 pb-12">

      <div className="flex flex-col gap-3 mb-16">
        <span className="badge-editorial w-fit">{t("bookingFlow.steps.details")}</span>
        <h2 className="text-5xl font-bold tracking-tight text-white mt-4 uppercase font-sans leading-none">{t("booking.personalDetails")}</h2>
      </div>


      {/* Primary Route Selection */}
      <div className="grid md:grid-cols-2 gap-10">
        <FieldWrapper label={t("booking.origin")} icon={MapPin}>
          <LocationInput
            placeholder={t("booking.originPlaceholder")}
            value={form.origin}
            onChange={(val) => update({ origin: val })}
          />
        </FieldWrapper>
        <FieldWrapper label={t("booking.destination")} icon={MapPin}>
          <LocationInput
            placeholder={t("booking.destinationPlaceholder")}
            value={form.destination}
            onChange={(val) => update({ destination: val })}
          />
        </FieldWrapper>
      </div>

      {/* Flight Info - Animated Conditional Section */}
      {(() => {
        const isAirport =
          form.origin.toLowerCase().includes("aeroporto") ||
          form.origin.toLowerCase().includes("airport") ||
          form.destination.toLowerCase().includes("aeroporto") ||
          form.destination.toLowerCase().includes("airport");

        if (!isAirport) return null;

        return (
          <div className="animate-luxury-reveal space-y-8 p-10 rounded-[40px] bg-brand-gold/[0.03] border border-brand-gold/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex items-center gap-5 text-brand-gold relative z-10">
              <PlaneTakeoff className="w-6 h-6 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] font-sans">{t("booking.flightInfo")}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-10 relative z-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 font-sans">{t("booking.airline")}</label>
                <input
                  className="w-full bg-transparent border-b border-white/10 text-white focus:border-brand-gold transition-colors text-base font-bold uppercase tracking-[0.2em] placeholder:text-white/5 outline-none pb-2"
                  placeholder={t("booking.airlinePlaceholder")}
                  value={form.airline}
                  onChange={(e) => update({ airline: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 font-sans">{t("booking.flightNumber")}</label>
                <input
                  className="w-full bg-transparent border-b border-white/10 text-white focus:border-brand-gold transition-colors text-base font-bold uppercase tracking-[0.2em] placeholder:text-white/5 outline-none pb-2"
                  placeholder={t("booking.flightPlaceholder")}
                  value={form.flightNumber}
                  onChange={(e) => update({ flightNumber: e.target.value.toUpperCase() })}
                />
              </div>
            </div>
          </div>
        );
      })()}

      {/* DateTime & Specs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
        <FieldWrapper label={t("booking.date")} icon={Calendar}>
          <DatePicker value={form.date} onChange={(v) => update({ date: v })} />
        </FieldWrapper>

        <FieldWrapper label={t("booking.time")} icon={Clock}>
          <TimePicker value={form.time} onChange={(v) => update({ time: v })} />
        </FieldWrapper>

        <LuxurySelect
          label={t("booking.passengers")}
          value={form.passengers}
          options={[1, 2, 3, 4, 5, 6, 7, 8]}
          icon={Users}
          onChange={(v) => update({ passengers: v })}
        />

        <LuxurySelect
          label={t("booking.luggage")}
          value={form.luggage}
          options={[1, 2, 3, 4, 5, 6, 7, 8]}
          icon={Briefcase}
          onChange={(v) => update({ luggage: v })}
        />
      </div>


      {/* Action CTA */}
      <div className="pt-24">
        <button
          onClick={onNext}
          disabled={!form.origin || !form.destination || !form.date || !form.time}
          className={cn(
            "w-full flex items-center justify-between px-12 py-8 rounded-[24px] transition-all duration-700 group relative overflow-hidden",
            (!form.origin || !form.destination || !form.date || !form.time) 
              ? "bg-white/[0.05] text-white/20 cursor-not-allowed border border-white/5" 
              : "bg-brand-gold text-black shadow-[0_20px_60px_rgba(212,175,55,0.25)] hover:bg-white hover:text-black"
          )}
        >
          <span className="text-[12px] font-bold uppercase tracking-[0.4em] relative z-10 ml-4">{t("booking.viewPrices")}</span>
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 relative z-10 mr-4",
            (!form.origin || !form.destination || !form.date || !form.time) ? "bg-white/5" : "bg-black/5 group-hover:translate-x-3"
          )}>
            <ArrowRight className="w-7 h-7" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </button>
      </div>

    </div>
  );
}
