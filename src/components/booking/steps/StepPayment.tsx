"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";
import { type BookingFormData } from "../BookingSteps";
import { useAuthStore } from "@/lib/auth-store";
import {
  Lock, ArrowLeft, User, Key, Phone, Loader2, ShieldCheck, CreditCard, MessageSquare, Check, LogOut
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { CheckoutForm } from "./CheckoutForm";
import { motion, AnimatePresence } from "framer-motion";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

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
}

export function StepPayment({ form, update, onConfirm, onBack, loading, total, clientSecret: propClientSecret, initPaymentIntent, bookingId }: Props) {
  const { t } = useI18n();
  const { user, setAuth, logout } = useAuthStore();
  const [authForm, setAuthForm] = useState({ name: "", email: "" });
  const [clientSecret, setClientSecret] = useState<string | null>(propClientSecret);

  useEffect(() => {
    if (user && (!form.name || !form.email)) {
      update({ name: user.name, email: user.email });
    }
  }, [user]);

  useEffect(() => {
    if (user && !clientSecret && !loading) {
      const timer = setTimeout(() => {
        initPaymentIntent(user.email, user.name);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [user, clientSecret, loading]);

  useEffect(() => {
    setClientSecret(propClientSecret);
  }, [propClientSecret]);

  const handleFakeAuth = () => {
    // Redirect to login — fake tokens are rejected by the backend
    const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/reservar';
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
  };

  return (
    <div className="animate-luxury-reveal space-y-12 pb-12">
      {/* 1. Header Section - Clean & Minimal */}
      <div className="flex flex-col gap-6 pb-12 border-b border-white/5">
        <div className="flex items-center gap-4">
            <span className="badge-editorial">{t("bookingFlow.payment.encrypted")}</span>
            <div className="h-px w-10 bg-white/10" />
            <div className="flex items-center gap-2 text-[9px] font-black tracking-[0.3em] text-emerald-500/60 uppercase">
                <ShieldCheck className="w-3.5 h-3.5" />
                Certificação de Segurança Bancária
            </div>
        </div>
        <div className="flex flex-col gap-4">
            <h2 className="text-5xl md:text-7xl font-bold text-white uppercase tracking-tighter leading-none font-sans italic">
                {t("bookingFlow.payment.title")}
            </h2>
            <p className="text-white/40 text-sm md:text-base font-light tracking-wide max-w-xl italic font-serif">
                {t("bookingFlow.payment.sub")}
            </p>
        </div>
      </div>

      {!user ? (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-16 text-center bg-[#0C0C11] border border-brand-gold/20 rounded-[48px] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-gold/40 to-transparent" />
          <div className="w-24 h-24 rounded-full bg-brand-gold/10 flex items-center justify-center mx-auto mb-10 border border-brand-gold/20 shadow-xl">
            <Key className="w-12 h-12 text-brand-gold animate-pulse" />
          </div>
          <h3 className="text-4xl font-black text-white uppercase tracking-tighter font-sans mb-6">{t("bookingFlow.payment.authRequired")}</h3>
          <p className="text-white/40 text-sm max-w-sm mx-auto mb-16 font-sans">{t("bookingFlow.payment.authDesc")}</p>
          <div className="grid md:grid-cols-2 gap-10 text-left max-w-2xl mx-auto">
            <div className="space-y-4">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-2">Nome Completo</label>
                <input
                    className="w-full nx-input py-6 px-8 rounded-2xl bg-white/[0.03] text-white focus:border-brand-gold/50 transition-all font-sans"
                    placeholder="Alexander Pierce"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                />
            </div>
            <div className="space-y-4">
                <label className="text-[10px] uppercase font-bold tracking-widest text-white/30 ml-2">E-mail</label>
                <input
                    className="w-full nx-input py-6 px-8 rounded-2xl bg-white/[0.03] text-white focus:border-brand-gold/50 transition-all font-sans"
                    type="email"
                    placeholder="vip@concierge.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                />
            </div>
          </div>
          <button onClick={handleFakeAuth} className="mt-16 w-full max-w-2xl py-8 bg-brand-gold text-black rounded-full uppercase tracking-[0.5em] font-black hover:scale-[1.02] transition-transform shadow-luxury">
            {t("bookingFlow.payment.verify")}
          </button>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-8">
          
          {/* 2. Client Dossier - Full Width Top */}
          <div className="relative p-10 md:p-12 rounded-[56px] bg-[#0A0A0F] border border-white/5 overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10 grid md:grid-cols-2 gap-12">
                  <div className="space-y-12">
                      <div className="flex items-center justify-between border-b border-white/5 pb-10">
                          <div className="flex items-center gap-6">
                              <div className="w-24 h-24 rounded-3xl bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20 shadow-glow relative">
                                  <User className="w-10 h-10 text-brand-gold" />
                                  <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-4 border-[#0A0A0F] flex items-center justify-center">
                                      <Check className="w-4 h-4 text-white" />
                                  </div>
                              </div>
                              <div>
                                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter font-sans leading-none">{user.name}</h3>
                                  <p className="text-[10px] text-brand-gold/60 uppercase tracking-[0.4em] font-black mt-2">Sua Conta NexRice</p>
                              </div>
                          </div>
                      </div>

                      <div className="space-y-6">
                          <div className="flex items-center justify-between px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/5">
                              <span className="text-[9px] font-black text-white/20 uppercase tracking-widest font-sans">E-mail</span>
                              <span className="text-xs font-bold text-white/60">{user.email}</span>
                          </div>
                          <button 
                              onClick={() => logout()} 
                              className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-red-500/10 hover:bg-red-500/5 hover:border-red-500/30 text-[10px] font-black text-red-500/60 uppercase tracking-widest transition-all"
                          >
                              <LogOut className="w-3.5 h-3.5" />
                              {t("bookingFlow.payment.signOut")}
                          </button>
                      </div>
                  </div>

                  <div className="space-y-8">
                      <div className="space-y-4">
                          <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2 font-sans">
                              <Phone className="w-3.5 h-3.5 text-brand-gold/40" /> {t("bookingFlow.payment.phone")}
                          </label>
                          <input 
                              className="w-full bg-white/[0.03] border border-white/10 rounded-[32px] py-6 px-10 text-white focus:border-brand-gold/50 transition-all font-bold tracking-[0.2em] text-sm" 
                              placeholder="+351 9XX XXX XXX"
                              value={form.phone} 
                              onChange={(e) => update({ phone: e.target.value })} 
                          />
                      </div>

                      <div className="space-y-4">
                          <label className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-white/20 ml-2 font-sans">
                              <MessageSquare className="w-3.5 h-3.5 text-brand-gold/40" /> {t("bookingFlow.payment.notes")}
                          </label>
                          <textarea 
                              rows={3}
                              className="w-full bg-white/[0.03] border border-white/10 rounded-[32px] py-6 px-10 text-white focus:border-brand-gold/50 transition-all text-sm font-medium resize-none placeholder:opacity-10 leading-relaxed" 
                              placeholder={t("bookingFlow.payment.notesPlaceholder")}
                              value={form.notes} 
                              onChange={(e) => update({ notes: e.target.value })} 
                          />
                      </div>
                  </div>
              </div>
          </div>

          {/* 3. Payment Card - Full Width Bottom */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col rounded-[56px] overflow-hidden bg-[#0C0C11] border border-white/5 shadow-luxury"
          >
            <div className="p-10 md:p-14 pb-12 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[2.5rem] bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20 shadow-glow shrink-0">
                        <CreditCard className="w-10 h-10 text-brand-gold" />
                    </div>
                    <div>
                        <h3 className="text-4xl font-black text-white uppercase tracking-tighter font-sans leading-none">{t("bookingFlow.payment.transaction")}</h3>
                        <p className="text-[10px] text-brand-gold/40 uppercase tracking-[0.4em] font-black mt-3">Transação Segura Protegida por SSL</p>
                    </div>
                </div>
                <div className="hidden sm:flex flex-col items-end gap-3 shrink-0">
                    <div className="flex items-center gap-5 mb-1 opacity-80">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/d/d6/Visa_2021.svg" alt="Visa" className="h-4 md:h-5" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 md:h-8" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" className="h-6 md:h-7 ml-2" />
                    </div>
                    <span className="text-[8px] font-black tracking-[0.2em] uppercase text-brand-gold/40">Pagamento Processado via Stripe</span>
                </div>
            </div>

            <div className="p-10 md:p-14 relative flex flex-col min-h-[500px]">
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div 
                            key="loader"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 flex flex-col items-center justify-center space-y-8"
                        >
                            <Loader2 className="w-16 h-16 text-brand-gold animate-spin" strokeWidth={1} />
                            <p className="text-[10px] uppercase font-black tracking-[0.5em] text-white/30 animate-pulse">{t("bookingFlow.payment.processing")}</p>
                        </motion.div>
                    ) : clientSecret ? (
                        <motion.div 
                            key="stripe"
                            initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-4xl mx-auto space-y-12"
                        >
                            <div className="p-1 md:p-2 bg-gradient-to-b from-white/[0.05] to-transparent rounded-[48px] border border-white/5 shadow-2xl">
                                <div className="p-8 md:p-12 bg-[#0C0C11] rounded-[44px] shadow-inner">
                                    <Elements 
                                        stripe={stripePromise} 
                                        options={{ 
                                            clientSecret, 
                                            appearance: { 
                                                theme: 'night',
                                                variables: { 
                                                    colorPrimary: '#D4AF37', 
                                                    colorBackground: '#0C0C11', 
                                                    colorText: '#ffffff', 
                                                    colorDanger: '#df1b41',
                                                    fontFamily: 'Outfit, sans-serif',
                                                    spacingUnit: '5px',
                                                    borderRadius: '20px',
                                                },
                                                rules: {
                                                    '.Input': {
                                                        border: '1px solid rgba(255,255,255,0.05)',
                                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                                        padding: '18px 20px',
                                                        fontSize: '15px',
                                                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                                        transition: 'all 0.4s ease',
                                                    },
                                                    '.Input:focus': {
                                                        border: '1px solid rgba(212,175,55,0.5)',
                                                        backgroundColor: 'rgba(212,175,55,0.02)',
                                                        boxShadow: '0 0 0 4px rgba(212,175,55,0.1), 0 10px 30px rgba(0,0,0,0.4)',
                                                    },
                                                    '.Label': {
                                                        fontSize: '10px',
                                                        fontWeight: '800',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.25em',
                                                        color: 'rgba(255,255,255,0.4)',
                                                        marginBottom: '10px',
                                                        marginLeft: '10px',
                                                    }
                                                }
                                            } 
                                        }}
                                    >
                                        <CheckoutForm onConfirm={onConfirm} loading={loading} total={total} bookingId={bookingId} />
                                    </Elements>
                                </div>
                            </div>

                            {/* Security Seal */}
                            <div className="pt-6 flex items-center justify-center gap-4 opacity-20">
                                <ShieldCheck className="w-4 h-4" />
                                <span className="text-[8px] font-black uppercase tracking-[0.5em]">Transação Segura via Encriptação SSL</span>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center space-y-12 my-20">
                            <p className="text-white/30 text-2xl font-serif italic">{t("bookingFlow.payment.waitingDetails")}</p>
                            <button 
                                onClick={() => initPaymentIntent(user.email, user.name)} 
                                className="px-16 py-8 bg-brand-gold text-black rounded-full text-[12px] font-black uppercase tracking-[0.5em] hover:scale-105 transition-all shadow-luxury-gold"
                            >
                                {t("bookingFlow.payment.initialize")}
                            </button>
                        </div>
                    )}
                </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}

      {/* Nav Footer */}
      <div className="flex justify-start pt-20 border-t border-white/5">
        <button 
            onClick={onBack} 
            className="group flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.5em] text-white/20 hover:text-white transition-all"
        >
          <div className="w-14 h-14 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white/5 group-hover:border-white/20 transition-all">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-500" />
          </div>
          {t("bookingFlow.stepVehicle.back")}
        </button>
      </div>
    </div>
  );
}
