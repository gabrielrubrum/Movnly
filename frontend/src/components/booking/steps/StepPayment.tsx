"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/i18n/context";
import { type BookingFormData } from "../BookingSteps";
import { Lock, ArrowLeft, Loader2, ShieldCheck, CreditCard, Globe, Shield, RefreshCw, AlertCircle, Smartphone, MapPin, CalendarClock, Users, Briefcase, Car } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "./CheckoutForm";
import { motion, AnimatePresence } from "framer-motion";
import { isMockStripeSecret } from "@/lib/stripe-errors";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface Props {
  form: BookingFormData;
  update: (p: Partial<BookingFormData>) => void;
  onConfirm: () => Promise<void>;
  onBack: () => void;
  loading: boolean;
  total: number;
  clientSecret: string | null;
  bookingId: string | null;
  initPaymentIntent: (email?: string, name?: string) => Promise<void>;
  paymentError: string | null;
  paymentAttemptKey: string;
}

const TRUST_BADGES = [
  { icon: Lock,        label: "Pagamento seguro processado pela Stripe", sub: "Encriptação SSL 256-bit" },
  { icon: Globe,       label: "Aceitamos cartões internacionais, Apple Pay e Google Pay", sub: "Cobrança em EUR (€)" },
  { icon: Shield,      label: "Proteção anti-fraude avançada",      sub: "Stripe Radar ativo" },
  { icon: RefreshCw,   label: "Cancelamento grátis",                sub: "Sem penalidade até 24h antes" },
];

const METHOD_BADGES = [
  { src: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg",         alt: "Visa",        h: "h-3" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg",   alt: "Mastercard",  h: "h-5" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg", alt: "Amex", h: "h-5" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg",    alt: "Apple Pay",   h: "h-4" },
  { src: "https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg",   alt: "Google Pay",  h: "h-5" },
];

const formatPickup = (date: string, time: string) => {
  if (!date && !time) return "Por definir";
  return `${date || "Data por definir"} ${time ? `às ${time}` : ""}`.trim();
};

export function StepPayment({ form, onConfirm, onBack, loading, total, clientSecret: propClientSecret, initPaymentIntent, bookingId, paymentError, paymentAttemptKey }: Props) {
  const { t } = useI18n();
  const [clientSecret,      setClientSecret]      = useState<string | null>(propClientSecret);
  const [paymentConfigError, setPaymentConfigError] = useState<string | null>(null);
  const [attemptedPaymentKey, setAttemptedPaymentKey] = useState<string | null>(null);

  useEffect(() => {
    setClientSecret(propClientSecret);
    setPaymentConfigError(null);
  }, [propClientSecret]);

  useEffect(() => {
    if (!clientSecret && !loading && !paymentError && attemptedPaymentKey !== paymentAttemptKey) {
      setAttemptedPaymentKey(paymentAttemptKey);
      const timer = setTimeout(() => {
        initPaymentIntent(form.email, form.name);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [attemptedPaymentKey, clientSecret, form.email, form.name, initPaymentIntent, loading, paymentAttemptKey, paymentError]);

  useEffect(() => {
    if (!stripePublishableKey && (!clientSecret || !isMockStripeSecret(clientSecret))) {
      setPaymentConfigError(t("bookingFlow.payment.stripeNotConfigured"));
    } else {
      setPaymentConfigError(null);
    }
  }, [clientSecret, t]);

  const isMock = clientSecret ? isMockStripeSecret(clientSecret) : false;

  return (
    <div className="animate-luxury-reveal space-y-8 sm:space-y-12 pb-12 overflow-hidden">

      {/* Header */}
      <div className="flex flex-col gap-5 pb-8 sm:pb-10 border-b border-white/[0.05]">
        <div className="flex flex-wrap items-center gap-3">
          <span className="badge-editorial">Etapa 5 · Pagamento</span>
          <div className="hidden sm:block h-px w-8 bg-white/10" />
          <div className="flex items-center gap-2 text-[9px] font-black tracking-[0.25em] text-emerald-400/60 uppercase">
            <ShieldCheck className="w-3.5 h-3.5" />
            Certificação de Segurança Bancária
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight font-sans">
            Pagamento Seguro
          </h2>
          <p className="text-white/35 text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] max-w-xl font-sans">
            A reserva é confirmada automaticamente após aprovação do pagamento via webhook
          </p>
        </div>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-2 gap-3">
        {TRUST_BADGES.map((badge, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-start gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-white/10 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-brand-gold/[0.08] border border-brand-gold/10 flex items-center justify-center shrink-0">
              <badge.icon className="w-3.5 h-3.5 text-brand-gold/60" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-white/50 leading-snug">{badge.label}</p>
              <p className="text-[8px] font-bold text-white/20 uppercase tracking-wider mt-0.5">{badge.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 sm:p-6">
        {[
          { icon: MapPin, label: "Origem", value: form.origin },
          { icon: MapPin, label: "Destino", value: form.destination },
          { icon: CalendarClock, label: "Data e hora", value: formatPickup(form.date, form.time) },
          { icon: Car, label: "Veículo", value: form.category },
          { icon: Users, label: "Passageiros", value: String(form.passengers) },
          { icon: Briefcase, label: "Malas", value: String(form.luggage) },
        ].map((item) => (
          <div key={item.label} className="flex items-start gap-3 min-w-0">
            <item.icon className="w-4 h-4 mt-0.5 text-brand-gold/70 shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/45">{item.label}</p>
              <p className="text-sm font-semibold text-white/85 truncate">{item.value || "Por definir"}</p>
            </div>
          </div>
        ))}
        <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/[0.06] pt-4 mt-1">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/45">Cancelamento e suporte</p>
            <p className="text-xs font-semibold text-white/70">Cancelamento grátis até 24h antes. Suporte MOVNLY 24/7.</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/45">Preço total</p>
            <p className="text-2xl font-black text-brand-gold">€{Math.round(total)} EUR</p>
          </div>
        </div>
      </div>

      {/* Payment Card */}
      <div className="flex flex-col gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col rounded-2xl overflow-hidden bg-[#0B0B11] border border-white/[0.08] shadow-[0_18px_60px_rgba(0,0,0,0.28)] w-full"
        >
          {/* Card Header */}
          <div className="p-5 sm:p-10 border-b border-white/[0.05] flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-center gap-5 w-full">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[1.5rem] bg-brand-gold/[0.08] flex items-center justify-center border border-brand-gold/15 shrink-0">
                <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-brand-gold" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-2xl font-black text-white uppercase tracking-tight leading-tight font-sans">
                  {t("bookingFlow.payment.transaction")}
                </h3>
                <p className="text-[8px] sm:text-[9px] text-brand-gold/35 uppercase tracking-[0.35em] font-black mt-1">
                  {t("bookingFlow.payment.securityNotice")}
                </p>
              </div>
            </div>
            {/* Payment method logos */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-start md:justify-end">
              {METHOD_BADGES.map((b) => (
                <span
                  key={b.alt}
                  className="h-8 min-w-14 px-2.5 rounded-lg bg-white/95 border border-white/10 flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.22)]"
                >
                  <img src={b.src} alt={b.alt} className={`${b.h} max-w-[64px] object-contain`} />
                </span>
              ))}
            </div>
          </div>

          {/* Mobile: Apple Pay / Google Pay banner */}
          <div className="flex items-center gap-3 px-5 sm:px-10 py-4 bg-brand-gold/[0.03] border-b border-white/[0.04] sm:hidden">
            <Smartphone className="w-4 h-4 text-brand-gold/50 shrink-0" />
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
              Apple Pay & Google Pay disponíveis no campo abaixo
            </p>
          </div>

          {/* Payment Form Area */}
          <div className="p-5 sm:p-10 relative flex flex-col min-h-[420px]">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center space-y-6"
                >
                  <div className="relative">
                    <Loader2 className="w-14 h-14 text-brand-gold animate-spin" strokeWidth={1} />
                    <div className="absolute inset-0 bg-brand-gold/10 blur-2xl rounded-full animate-pulse" />
                  </div>
                  <p className="text-[10px] uppercase font-black tracking-[0.5em] text-white/25 animate-pulse">
                    A preparar pagamento...
                  </p>
                </motion.div>

              ) : paymentConfigError ? (
                <motion.div
                  key="config-error"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center text-center space-y-6 my-12 px-6"
                >
                  <AlertCircle className="w-10 h-10 text-red-400/60" />
                  <div>
                    <p className="text-white/60 text-sm font-black uppercase tracking-widest mb-2">Configuração em andamento</p>
                    <p className="text-white/25 text-xs font-bold max-w-sm">{paymentConfigError}</p>
                  </div>
                </motion.div>

              ) : paymentError ? (
                <motion.div
                  key="payment-init-error"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center text-center space-y-6 my-12 px-6"
                >
                  <AlertCircle className="w-10 h-10 text-amber-400/70" />
                  <div>
                    <p className="text-white/70 text-sm font-black uppercase tracking-widest mb-2">Pagamento não inicializado</p>
                    <p className="text-white/45 text-xs font-bold max-w-md leading-relaxed">{paymentError}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAttemptedPaymentKey(paymentAttemptKey);
                      initPaymentIntent(form.email, form.name);
                    }}
                    className="px-8 py-4 bg-brand-gold text-black rounded-xl text-[10px] font-black uppercase tracking-[0.24em] hover:bg-[#e4c766] transition-all disabled:opacity-50"
                    disabled={loading}
                  >
                    Tentar novamente
                  </button>
                </motion.div>

              ) : isMock ? (
                /* Mock mode — no manual card fields */
                <motion.div
                  key="mock-payment"
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-4xl mx-auto space-y-8"
                >
                  <MockPaymentSimulator total={total} bookingId={bookingId} onConfirm={onConfirm} />
                </motion.div>

              ) : clientSecret && stripePromise ? (
                <motion.div
                  key="stripe"
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                  className="w-full max-w-4xl mx-auto space-y-10"
                >
                  <div className="rounded-2xl border border-white/[0.08] bg-[#101018]">
                    <div className="p-5 sm:p-8">
                      <Elements
                        key={clientSecret}
                        stripe={stripePromise}
                        options={{
                          clientSecret,
                          locale: "auto",
                          appearance: {
                            theme: "night",
                            variables: {
                              colorPrimary:     "#D4AF37",
                              colorBackground:  "#101018",
                              colorText:        "#ffffff",
                              colorDanger:      "#df1b41",
                              fontFamily:       "Inter, system-ui, sans-serif",
                              spacingUnit:      "4px",
                              borderRadius:     "8px",
                            },
                          },
                        }}
                      >
                        <CheckoutForm
                          onConfirm={onConfirm}
                          loading={loading}
                          total={total}
                          bookingId={bookingId}
                          customerName={form.name || ""}
                          customerEmail={form.email || ""}
                          customerPhone={form.phone || ""}
                        />
                      </Elements>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 opacity-[0.12]">
                    <Lock className="w-3 h-3" />
                    <span className="text-[8px] font-black uppercase tracking-[0.3em]">
                      {t("bookingFlow.payment.securityNotice")}
                    </span>
                  </div>
                </motion.div>

              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-10 my-16">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-brand-gold/40 animate-spin" strokeWidth={1} />
                    <div className="absolute inset-0 bg-brand-gold/5 blur-xl rounded-full" />
                  </div>
                  <div>
                    <p className="text-white/25 text-base font-black uppercase tracking-[0.25em] font-sans mb-2">A inicializar...</p>
                    <p className="text-white/15 text-xs font-bold uppercase tracking-widest">Aguarde um momento</p>
                  </div>
                  <button
                    onClick={() => {
                      setAttemptedPaymentKey(paymentAttemptKey);
                      initPaymentIntent(form.email, form.name);
                    }}
                    className="px-12 py-5 bg-brand-gold text-black rounded-full text-[11px] font-black uppercase tracking-[0.4em] hover:scale-105 transition-all"
                  >
                    {t("bookingFlow.payment.initialize")}
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Back navigation */}
      <div className="flex justify-start pt-12 border-t border-white/[0.04]">
        <button
          onClick={onBack}
          className="group flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.5em] text-white/20 hover:text-white transition-all"
        >
          <div className="w-12 h-12 rounded-full border border-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.04] group-hover:border-white/20 transition-all">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-400" />
          </div>
          Voltar para Informações do Cliente
        </button>
      </div>
    </div>
  );
}

// ─── Mock Payment Simulator (dev only — no manual card inputs) ────────────────
function MockPaymentSimulator({ total, bookingId, onConfirm }: { total: number; bookingId: string | null; onConfirm: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);

  const handleSimulate = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = `/booking/confirmation/${bookingId || "processing"}?mock=true`;
    }, 2000);
  };

  return (
    <div className="space-y-6 text-center">
      <div className="p-4 rounded-2xl bg-amber-500/[0.08] border border-amber-500/15 text-amber-400/70 text-[9px] font-black uppercase tracking-widest">
        Modo simulação · Sem cobrança real · Dev only
      </div>
      <p className="text-white/30 text-xs font-bold">
        Total simulado: <span className="text-brand-gold font-black">€{Math.round(total)} EUR</span>
      </p>
      <button
        onClick={handleSimulate}
        disabled={loading}
        className="w-full py-5 bg-gradient-to-br from-brand-gold via-[#C5A028] to-brand-gold text-black text-[11px] font-black uppercase tracking-[0.3em] rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 flex items-center justify-center gap-3 disabled:opacity-50"
      >
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" />A simular...</> : "Confirmar Reserva (Simulação)"}
      </button>
    </div>
  );
}
