"use client";

import { useI18n } from "@/i18n/context";
import { type BookingFormData } from "../BookingSteps";
import { User, Mail, Phone, MessageSquare, ArrowLeft, ChevronRight, MapPin, Calendar, Clock, Check, Shield } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { VEHICLE_CATEGORIES, EXTRAS } from "@/lib/constants";

interface Props {
  form: BookingFormData;
  update: (p: Partial<BookingFormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepCustomer({ form, update, onNext, onBack }: Props) {
  const { t } = useI18n();
  const isComplete = form.name && form.email && form.phone;
  const category = VEHICLE_CATEGORIES.find(c => c.id === form.category);
  const selectedExtras = form.extras.map(id => EXTRAS.find(e => e.id === id)).filter(Boolean);

  return (
    <div className="animate-luxury-reveal min-h-screen pb-40">
      {/* Header */}
      <div className="flex items-center gap-6 mb-14">
        <button
          onClick={onBack}
          className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/30 hover:text-brand-gold hover:border-brand-gold/40 transition-all duration-500 group shrink-0"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold/60 mb-2 font-sans">
            Etapa 4 · Dados do Passageiro
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-sans uppercase tracking-tight leading-none">
            Informações de Contacto
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Form */}
        <div className="space-y-6">
          <div className="p-8 md:p-10 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] space-y-7 shadow-luxury">
            <h3 className="text-base font-black text-white uppercase tracking-tight font-sans">
              Detalhes Pessoais
            </h3>

            {/* Name */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] text-white/30 ml-2 font-sans">
                <User className="w-3.5 h-3.5 text-brand-gold/40" /> Nome Completo *
              </label>
              <input
                type="text" required
                value={form.name}
                onChange={(e) => update({ name: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-4 px-5 text-white focus:border-brand-gold/40 focus:bg-brand-gold/[0.02] transition-all font-medium text-sm outline-none placeholder:text-white/15"
                placeholder="Seu nome completo"
              />
            </div>

            {/* Email */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] text-white/30 ml-2 font-sans">
                <Mail className="w-3.5 h-3.5 text-brand-gold/40" /> E-mail *
              </label>
              <input
                type="email" required
                value={form.email}
                onChange={(e) => update({ email: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-4 px-5 text-white focus:border-brand-gold/40 focus:bg-brand-gold/[0.02] transition-all font-medium text-sm outline-none placeholder:text-white/15"
                placeholder="exemplo@email.com"
              />
            </div>

            {/* Phone */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] text-white/30 ml-2 font-sans">
                <Phone className="w-3.5 h-3.5 text-brand-gold/40" /> Telefone / WhatsApp *
              </label>
              <input
                type="tel" required
                value={form.phone}
                onChange={(e) => update({ phone: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-4 px-5 text-white focus:border-brand-gold/40 focus:bg-brand-gold/[0.02] transition-all font-medium text-sm outline-none placeholder:text-white/15"
                placeholder="+351 912 345 678"
              />
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] text-white/30 ml-2 font-sans">
                <MessageSquare className="w-3.5 h-3.5 text-brand-gold/40" /> Observações Especiais
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => update({ notes: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-4 px-5 text-white focus:border-brand-gold/40 focus:bg-brand-gold/[0.02] transition-all font-medium text-sm resize-none outline-none placeholder:text-white/15"
                placeholder="Instruções para o motorista, necessidades especiais..."
              />
            </div>
          </div>

          {/* Privacy note */}
          <div className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <Shield className="w-4 h-4 text-brand-gold/40 mt-0.5 shrink-0" />
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/25 leading-relaxed">
              Os seus dados são utilizados apenas para gerir a reserva. Nunca partilhamos informação com terceiros.
            </p>
          </div>
        </div>

        {/* Booking Review */}
        <div className="space-y-6">
          <div className="p-8 md:p-10 rounded-[2rem] bg-[#08080f] border border-brand-gold/15 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-56 h-56 bg-brand-gold/[0.04] rounded-full blur-[80px] -translate-y-1/4 translate-x-1/4 pointer-events-none" />

            <h3 className="text-base font-black text-white uppercase tracking-tight font-sans mb-7 relative z-10">
              Revisão da Reserva
            </h3>

            <div className="space-y-5 relative z-10 font-sans">
              {/* Route */}
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-brand-gold/50 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/25 block mb-1">Origem</span>
                    <p className="text-xs font-bold text-white leading-snug">{form.origin || "—"}</p>
                  </div>
                </div>
                <div className="w-px h-4 bg-white/[0.08] ml-2" />
                <div className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/25 block mb-1">Destino</span>
                    <p className="text-xs font-bold text-white leading-snug">{form.destination || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Date / Time */}
              <div className="grid grid-cols-2 gap-3 border-t border-white/[0.05] pt-5">
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-gold/40" />
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/25 block">Data</span>
                    <p className="text-xs font-bold text-white">{form.date || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-3.5 h-3.5 text-brand-gold/40" />
                  <div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-white/25 block">Horário</span>
                    <p className="text-xs font-bold text-white">{form.time || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Vehicle */}
              {category && (
                <div className="flex items-center justify-between border-t border-white/[0.05] pt-5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/35">Veículo</span>
                  <span className="text-xs font-black text-brand-gold uppercase tracking-wide">
                    {category.name}
                  </span>
                </div>
              )}

              {/* Extras */}
              {selectedExtras.length > 0 && (
                <div className="space-y-2 border-t border-white/[0.05] pt-4">
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/25 block mb-2">Opcionais</span>
                  {selectedExtras.map(extra => extra && (
                    <div key={extra.id} className="flex items-center justify-between bg-white/[0.02] px-3 py-2 rounded-xl border border-white/[0.04]">
                      <div className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-brand-gold/50" strokeWidth={3} />
                        <span className="text-[9px] font-bold text-white/60">{extra.name}</span>
                      </div>
                      <span className="text-[9px] font-black text-brand-gold/70">
                        {extra.price === 0 ? "Grátis" : `+${formatCurrency(extra.price)}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-16 pt-10 border-t border-white/[0.05] hidden lg:flex items-center justify-between gap-8">
        <div>
          <h4 className="text-base font-bold text-white font-sans uppercase tracking-[0.05em] mb-1">
            Tudo correto?
          </h4>
          <p className="text-[10px] text-white/25 leading-relaxed uppercase tracking-widest font-sans font-bold max-w-xs">
            Verifique os dados antes de avançar para o pagamento seguro
          </p>
        </div>

        <button
          onClick={onNext}
          disabled={!isComplete}
          className={cn(
            "relative overflow-hidden btn-editorial btn-editorial-primary !px-14 !py-7 font-sans font-black group shadow-[0_30px_80px_-20px_rgba(212,175,55,0.4)]",
            !isComplete && "opacity-40 grayscale cursor-not-allowed"
          )}
        >
          <span className="relative z-10 flex items-center gap-5 text-sm">
            <span className="text-xs opacity-40 font-black tracking-tighter">04</span>
            Ir para pagamento
            <ChevronRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-700 ease-in-out" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1200ms] ease-in-out" />
        </button>
      </div>
    </div>
  );
}
