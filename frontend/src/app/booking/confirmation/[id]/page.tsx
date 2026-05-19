"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { formatCurrency, cn } from "@/lib/utils";
import { useI18n } from "@/i18n/context";
import { useAuthStore } from "@/lib/auth-store";
import {
  CheckCircle, MapPin, Calendar, Clock, Car,
  Mail, Phone, Download, ArrowRight, Loader2, Share2,
  ShieldCheck, ArrowUpRight
} from "lucide-react";
import axios from "axios";

export default function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const fetchBooking = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
        const res = await axios.get(`${apiUrl}/bookings/${id}`);
        setBooking(res.data);
      } catch (err) {
        console.error("Failed to fetch booking:", err);
        setError("Não foi possível carregar os detalhes da reserva.");
      }
    };

    if (id && id !== 'processing') {
      fetchBooking();
    }
  }, [id]);

  if (!mounted || (!booking && !error)) {
    return (
      <div className="min-h-screen bg-[#07070A] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#07070A] flex flex-col items-center justify-center p-8 text-center font-sans tracking-tight">
        <Navbar />
        <div className="max-w-md space-y-8 mt-24">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(239,68,68,0.15)] animate-pulse">
            <ShieldCheck className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">Reserva não encontrada</h1>
          <p className="text-white/40 font-sans text-sm leading-relaxed max-w-sm mx-auto">{error || "A referência da sua reserva é inválida ou expirou."}</p>
          <Link href="/reservar" className="px-8 py-3.5 bg-white/[0.03] border border-white/10 hover:border-brand-gold/50 text-white rounded-full inline-block transition-all duration-500 font-black text-[10px] uppercase tracking-widest">Tentar Novamente</Link>
        </div>
      </div>
    );
  }

  // Robust formatting helpers
  const formatDate = (iso: string) => {
    try {
      if (!iso) return '-';
      return new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(iso));
    } catch { return iso; }
  };

  const formatTime = (iso: string) => {
    try {
      if (!iso) return '-';
      return new Intl.DateTimeFormat('pt-PT', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
    } catch { return iso; }
  };

  // Resolve passenger data: prefer DB → auth-store (same session) → placeholder
  const passengerEmail = (booking?.passenger?.email?.trim()) || user?.email || null;
  const passengerName = (booking?.passenger?.name?.trim()) || user?.name || null;

  return (
    <div className="bg-[#07070A] min-h-screen font-sans">
      <Navbar />

      <main className="pt-32 pb-32">
        <div className="nx-container max-w-5xl mx-auto px-6">

          {/* Hero Success Section */}
          <div className="text-center mb-20 animate-luxury-reveal">
            <div className="inline-flex items-center justify-center w-36 h-36 rounded-full bg-brand-gold/5 border border-brand-gold/20 mb-8 shadow-[0_0_120px_rgba(212,175,55,0.15)] relative">
              <div className="absolute inset-0 rounded-full border border-brand-gold/15 border-dashed animate-spin-slow opacity-30" />
              <div className="absolute inset-3 rounded-full border border-brand-gold/5" />
              <CheckCircle className="w-16 h-16 text-brand-gold/90 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-pulse" />
            </div>

            <div className="flex flex-col items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-gold/60">{t("confirmation.badge")}</span>
              <h1 className="text-4xl sm:text-6xl font-light text-white tracking-tight leading-tight max-w-2xl mx-auto">{t("confirmation.title")}</h1>
              <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed">
                {t("confirmation.sentTo")} <span className="text-brand-gold/80 border-b border-brand-gold/20 pb-0.5 font-medium">{passengerEmail || 'o seu email'}</span>
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-start">

            {/* Main Booking Summary Card */}
            <div className="space-y-8 animate-luxury-reveal" style={{ animationDelay: "200ms" }}>
              <div className="p-8 md:p-12 rounded-[2.5rem] bg-[#09090D]/90 border border-brand-gold/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 relative z-10">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 block mb-1">{t("confirmation.reference")}</span>
                    <p className="text-2xl font-bold text-white tracking-wider font-mono">{booking.id?.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/[0.03] border border-emerald-500/20 backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400">{t("confirmation.statusConfirmed")}</span>
                  </div>
                </div>

                {/* Immersive Route Display */}
                <div className="relative py-8 px-6 bg-white/[0.01] rounded-2xl border border-white/5 mb-10 overflow-hidden">
                  <div className="absolute left-[39px] top-16 bottom-16 w-px bg-gradient-to-b from-brand-gold/40 via-white/10 to-emerald-500/40" />

                  <div className="space-y-12 relative z-10">
                    <div className="flex items-center gap-8">
                      <div className="w-12 h-12 rounded-2xl bg-brand-gold/5 border border-brand-gold/20 flex items-center justify-center shadow-lg flex-shrink-0">
                        <MapPin className="w-5 h-5 text-brand-gold/80" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-1">{t("confirmation.pickup")}</span>
                        <p className="text-base font-semibold text-white tracking-tight uppercase leading-tight">{booking.from}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center shadow-lg flex-shrink-0">
                        <MapPin className="w-5 h-5 text-emerald-500/80" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-1">{t("confirmation.dropoff")}</span>
                        <p className="text-base font-semibold text-white tracking-tight uppercase leading-tight">{booking.to}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Technical Tableau */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-8 border-y border-white/[0.04] mb-8">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-brand-gold/30" />
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">{t("confirmation.date")}</span>
                    </div>
                    <p className="text-sm font-semibold text-white/90">{formatDate(booking.pickupTime)}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-brand-gold/30" />
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">{t("confirmation.time")}</span>
                    </div>
                    <p className="text-sm font-semibold text-white/90">{formatTime(booking.pickupTime)}</p>
                  </div>
                  <div className="space-y-2 col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2.5">
                      <Car className="w-4 h-4 text-brand-gold/30" />
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">{t("confirmation.category")}</span>
                    </div>
                    <p className="text-sm font-black text-brand-gold uppercase tracking-[0.2em]">
                      {t(`categories_list.${booking.category || 'smart'}.name`)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center p-0.5">
                      <Car className="w-6 h-6 text-white/20" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] block mb-1">{t("confirmation.passenger")}</span>
                      <p className="text-base font-bold text-white uppercase tracking-tight">{passengerName || 'VIP Guest'}</p>
                    </div>
                  </div>
                  <div className="md:text-right">
                    <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.5em] block mb-1">{t("confirmation.totalPaid")}</span>
                    <p className="text-4xl font-light text-white tracking-tight leading-none font-sans">
                      {formatCurrency(Number(booking.price || 0))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security PIN Protocol */}
              <div className="p-8 rounded-[2.5rem] bg-[#09090D]/90 border border-brand-gold/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-xl animate-luxury-reveal" style={{ animationDelay: "300ms" }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-[100px] rounded-full" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-center md:text-left">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-brand-gold/5 border border-brand-gold/20 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-7 h-7 text-brand-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-white tracking-tight">Código Privado</h3>
                      <p className="text-[9px] text-white/30 uppercase font-black tracking-[0.25em] mt-1">Apresente este código no final da viagem</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end">
                    <div className="flex gap-3 mb-2">
                      {booking.pin?.split('').map((digit: string, idx: number) => (
                        <div key={idx} className="w-12 h-16 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-2xl font-light text-brand-gold shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
                          {digit}
                        </div>
                      )) || (
                        <div className="px-6 py-4 rounded-xl bg-white/[0.02] border border-white/5 text-base font-black text-white/20 uppercase tracking-widest">
                          PENDENTE
                        </div>
                      )}
                    </div>
                    <p className="text-[8px] text-white/20 uppercase font-black tracking-widest italic">Garantimos a total privacidade do seu trajeto</p>
                  </div>
                </div>
              </div>

              {/* Action Suite */}
              <div className="grid sm:grid-cols-3 gap-4 pt-4">
                <Link href="/dashboard" className="px-6 py-4.5 rounded-full bg-gradient-to-br from-brand-gold via-[#C5A028] to-brand-gold text-black text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all duration-700 group shadow-[0_15px_30px_rgba(197,160,40,0.15)] cursor-pointer">
                  {t("confirmation.viewDashboard")} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
                </Link>
                <button className="px-6 py-4.5 rounded-full bg-white/[0.02] border border-white/5 text-white/50 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-white/[0.05] hover:text-white transition-all duration-500 cursor-pointer">
                  <Download className="w-4 h-4" /> {t("confirmation.downloadPdf")}
                </button>
                <button className="px-6 py-4.5 rounded-full bg-white/[0.02] border border-white/5 text-white/50 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-white/[0.05] hover:text-white transition-all duration-500 cursor-pointer">
                  <Share2 className="w-4 h-4" /> {t("confirmation.share")}
                </button>
              </div>
            </div>

            {/* Protocol Sidebar */}
            <div className="space-y-8 animate-luxury-reveal" style={{ animationDelay: "400ms" }}>
              <div className="p-8 md:p-10 rounded-[2.5rem] bg-[#09090D]/90 border border-brand-gold/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-xl">
                <div className="absolute -left-10 top-0 w-40 h-40 bg-brand-gold/5 blur-[80px] rounded-full pointer-events-none" />

                <div className="flex items-center gap-4 mb-10 relative z-10">
                  <ShieldCheck className="w-8 h-8 text-brand-gold/80" />
                  <h3 className="text-xl font-light text-white tracking-tight">{t("confirmation.nextStepsTitle")}</h3>
                </div>

                <div className="space-y-10 relative">
                  <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-brand-gold/20 via-white/5 to-transparent opacity-20" />

                  {[
                    { icon: Mail, text: t("confirmation.step1"), done: true },
                    { icon: Car, text: t("confirmation.step2"), done: false },
                    { icon: Phone, text: t("confirmation.step3"), done: false },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className="flex gap-6 group relative z-10 items-start">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-1000",
                          s.done ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "bg-white/[0.02] text-white/10 border border-white/5"
                        )}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="pt-2">
                          <p className="text-xs leading-relaxed text-white/40 group-hover:text-white/60 transition-colors duration-500">{s.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-10 rounded-[2.5rem] border border-brand-gold/10 bg-gradient-to-br from-brand-gold/[0.02] to-transparent text-center backdrop-blur-xl group/hotline">
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mb-6">
                  {t("confirmation.changeSomething")}
                </p>
                <div className="flex flex-col gap-4">
                  <a href="tel:+351924851105" className="text-3xl font-light text-brand-gold font-sans hover:text-white transition-all duration-700 tracking-tight group-hover/hotline:scale-105 inline-block">
                    +351 924 851 105
                  </a>
                  <div className="pt-6 border-t border-brand-gold/10">
                    <Link href="/dashboard" className="text-[10px] font-black text-brand-gold/40 uppercase tracking-[0.5em] hover:text-brand-gold transition-all duration-500 flex items-center justify-center gap-3">
                      {t("confirmation.customerArea")} <ArrowUpRight className="w-4 h-4 animate-pulse" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
