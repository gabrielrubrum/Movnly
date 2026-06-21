"use client";

import { useI18n } from "@/i18n/context";
import { MapPin, Calendar, Clock, Users, Briefcase, ArrowRight, PlaneTakeoff, ChevronDown, Route, Car, Shield } from "lucide-react";
import { type BookingFormData } from "../BookingSteps";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/DatePicker";
import { TimePicker } from "@/components/ui/TimePicker";
import { ReactNode } from "react";
import { createPortal } from "react-dom";
import { LocationInput } from "../LocationInput";
import { usePortalDropdown } from "@/hooks/usePortalDropdown";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  form: BookingFormData;
  update: (p: Partial<BookingFormData>) => void;
  onNext: () => void;
}

function FieldWrapper({ label, icon: Icon, children, className }: { label: string; icon: any; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-4 group relative", className)}>
      <div className="absolute -inset-4 bg-brand-gold/5 rounded-[32px] blur-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-1000 scale-95 group-focus-within:scale-100" />
      <div className="relative z-10">
        <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 group-focus-within:text-brand-gold transition-all duration-500 flex items-center gap-5 font-sans mb-5">
          <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center group-focus-within:bg-brand-gold group-focus-within:text-black group-focus-within:shadow-[0_0_20px_rgba(212,175,55,0.4)] group-focus-within:border-transparent transition-all duration-700">
            <Icon className="w-3.5 h-3.5 group-focus-within:scale-110 transition-transform" />
          </div>
          {label}
        </label>
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}

const LUXURY_SELECT_HEIGHT = 320;
const LUXURY_SELECT_WIDTH = 200;

function LuxurySelect({ label, value, options, icon: Icon, onChange }: { label: string; value: number; options: number[]; icon: any; onChange: (v: number) => void }) {
  const { triggerRef, open, setOpen, popoverStyle, togglePortal } = usePortalDropdown({
    popoverHeight: LUXURY_SELECT_HEIGHT,
    popoverWidth: LUXURY_SELECT_WIDTH,
    gap: 8,
    portalDataAttribute: "data-movnly-luxuryselect",
  });

  const dropdown = open ? (
    <div
      data-movnly-luxuryselect
      style={{
        position: "fixed",
        top: popoverStyle.top,
        left: popoverStyle.left,
        zIndex: 9999,
        width: Math.max(popoverStyle.width, LUXURY_SELECT_WIDTH),
      }}
      className="bg-[#050508] border border-white/10 rounded-2xl shadow-[0_40px_100px_rgba(0,0,0,0.9)] p-2 animate-luxury-reveal max-h-60 overflow-y-auto scrollbar-hide backdrop-blur-3xl"
    >
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
  ) : null;

  return (
    <FieldWrapper label={label} icon={Icon} className="relative">
      <div className="relative w-full">
        <button
          ref={triggerRef}
          type="button"
          onClick={togglePortal}
          className="w-full flex items-center justify-between nx-input hover:border-white/20 h-[64px] px-6 transition-all text-sm font-bold"
        >
          <span>{value}</span>
          <ChevronDown className={cn("w-4 h-4 text-white/30 transition-transform duration-500", open && "rotate-180")} />
        </button>

        {typeof document !== "undefined" && dropdown
          ? createPortal(dropdown, document.body)
          : null}
      </div>
    </FieldWrapper>
  );
}

export function StepDetails({ form, update, onNext }: Props) {
  const { t } = useI18n();
  const today = new Date().toISOString().split("T")[0];

  // Airport detection — only from the origin/destination text, NOT from pre-filled flight data
  const isAirportRoute =
    form.origin.toLowerCase().includes("aeroporto") ||
    form.origin.toLowerCase().includes("airport") ||
    form.destination.toLowerCase().includes("aeroporto") ||
    form.destination.toLowerCase().includes("airport");

  const isReady = !!form.origin && !!form.destination && !!form.date && !!form.time;

  return (
    <div className="animate-luxury-reveal space-y-16 pb-12">

      {/* Page Header */}
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-4">
          <span className="badge-editorial w-fit">Etapa 1 · Trajeto</span>
        </div>
        <h2 className="text-5xl font-bold tracking-tight text-white mt-4 uppercase font-sans leading-none">
          Planeje sua viagem
        </h2>
        <p className="text-white/25 text-xs font-bold uppercase tracking-[0.25em] mt-3 font-sans max-w-md">
          Indique o percurso, data e horário para ver os veículos disponíveis
        </p>
      </div>

      {/* Primary Route Selection */}
      <div className="glass-bento-luxury p-8 md:p-12 mb-12">
        <div className="grid md:grid-cols-2 gap-12 relative">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent -translate-x-1/2" />
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

        {/* Route Info - Distance & Time */}
        {form.origin && form.destination && (
          <div className="mt-8 pt-8 border-t border-white/[0.06]">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <Route className="w-4 h-4 text-brand-gold/50" />
                <div>
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 block">Distância</span>
                  <p className="text-sm font-black text-white">{form.distance ? `${form.distance} km` : "Calculando..."}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-brand-gold/50" />
                <div>
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 block">Tempo</span>
                  <p className="text-sm font-black text-white">{form.duration ? `${form.duration} min` : "Calculando..."}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Car className="w-4 h-4 text-brand-gold/50" />
                <div>
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 block">Tipo</span>
                  <p className="text-sm font-black text-white">Transfer Privado</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-brand-gold/50" />
                <div>
                  <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20 block">Monitoramento</span>
                  <p className="text-sm font-black text-white">Voo em tempo real</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flight Info — only shown if route includes an airport */}
      <AnimatePresence>
        {isAirportRoute && (
          <motion.div
            key="flight-info"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8 p-10 rounded-[40px] bg-brand-gold/[0.03] border border-brand-gold/20 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

            <div className="flex items-center gap-5 text-brand-gold relative z-10">
              <PlaneTakeoff className="w-6 h-6 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] font-sans">{t("booking.flightInfo")}</span>
              <span className="ml-auto text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Opcional</span>
            </div>

            <div className="grid md:grid-cols-2 gap-10 relative z-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 font-sans">{t("booking.airline")}</label>
                <input
                  className="w-full bg-transparent border-b border-white/10 text-white focus:border-brand-gold transition-colors text-base font-bold uppercase tracking-[0.2em] placeholder:text-white/10 outline-none pb-2"
                  placeholder={t("booking.airlinePlaceholder")}
                  value={form.airline}
                  onChange={(e) => update({ airline: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 font-sans">{t("booking.flightNumber")}</label>
                <input
                  className="w-full bg-transparent border-b border-white/10 text-white focus:border-brand-gold transition-colors text-base font-bold uppercase tracking-[0.2em] placeholder:text-white/10 outline-none pb-2"
                  placeholder={t("booking.flightPlaceholder")}
                  value={form.flightNumber}
                  onChange={(e) => update({ flightNumber: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/15 relative z-10">
              O motorista monitorizará o voo em tempo real para ajustar o horário de chegada
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Service Features - Always visible */}
      <div className="glass-bento-luxury p-8 md:p-12">
        <div className="mb-6">
          <h3 className="text-[11px] font-black uppercase tracking-[0.35em] text-brand-gold/60 mb-2 font-sans">Características do Serviço</h3>
          <p className="text-[9px] text-white/25 leading-relaxed">Transfer Privado Premium · Monitorização em Tempo Real</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <Shield className="w-4 h-4 text-brand-gold/50" />
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40">Cancelamento Grátis</span>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <Clock className="w-4 h-4 text-brand-gold/50" />
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40">Suporte 24/7</span>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <PlaneTakeoff className="w-4 h-4 text-brand-gold/50" />
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40">Monitoramento Voo</span>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <Route className="w-4 h-4 text-brand-gold/50" />
            <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40">Atualização Tempo Real</span>
          </div>
        </div>
      </div>

      {/* DateTime & Specs Grid */}
      <div className="glass-bento-luxury p-8 md:p-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-12 relative">
          <FieldWrapper label={t("booking.date")} icon={Calendar}>
            <DatePicker value={form.date} onChange={(v) => update({ date: v })} minDate={today} />
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
            options={[0, 1, 2, 3, 4, 5, 6, 7, 8]}
            icon={Briefcase}
            onChange={(v) => update({ luggage: v })}
          />
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-16">
        <button
          id="btn-view-vehicles"
          data-testid="btn-view-vehicles"
          onClick={onNext}
          disabled={!isReady}
          className={cn(
            "w-full flex items-center justify-between px-16 py-10 rounded-[32px] transition-all duration-1000 group relative overflow-hidden isolate",
            !isReady
              ? "bg-white/[0.03] text-white/10 cursor-not-allowed border border-white/5"
              : "bg-brand-gold text-black shadow-[0_30px_100px_-20px_rgba(212,175,55,0.4)] hover:shadow-[0_40px_120px_-20px_rgba(212,175,55,0.6)] hover:scale-[1.01]"
          )}
        >
          {/* Animated Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1500ms] ease-in-out z-0" />

          <div className="relative z-10 flex items-center gap-8">
            <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center bg-black/5 group-hover:bg-black group-hover:text-brand-gold transition-all duration-700">
              <Car className="w-5 h-5" />
            </div>
            <span className="text-[13px] font-black uppercase tracking-[0.4em] font-sans">
              {!isReady ? "Preencha todos os campos" : "Ver opções disponíveis"}
            </span>
          </div>

          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-700 relative z-10",
            !isReady ? "bg-white/5" : "bg-black/10 group-hover:bg-black group-hover:text-brand-gold group-hover:translate-x-4 group-hover:shadow-[0_0_40px_rgba(0,0,0,0.5)]"
          )}>
            <ArrowRight className="w-8 h-8" />
          </div>
        </button>

        {/* Hint text */}
        {isReady && (
          <p className="text-center text-[9px] font-black uppercase tracking-[0.25em] text-white/15 mt-6">
            Sem compromisso · Você escolhe o veículo na próxima etapa
          </p>
        )}
      </div>

    </div>
  );
}
