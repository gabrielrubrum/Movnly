"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useBooking } from "@/hooks/useBookings";
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
        <div className="max-w-md space-y-10">
          <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(239,68,68,0.1)]">
            <ShieldCheck className="w-12 h-12 text-red-500" />
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter font-sans">Reserva não encontrada</h1>
          <p className="text-white/40 italic font-sans text-lg leading-relaxed">{error || "A referência da sua reserva é inválida ou expirou."}</p>
          <Link href="/book" className="btn-editorial inline-block mt-10">Tentar Novamente</Link>
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
    <div className="bg-[#07070A] min-h-screen">
      <Navbar />

      <main className="pt-40 pb-40">
        <div className="nx-container max-w-6xl">

          {/* Hero Success Section */}
          <div className="text-center mb-24 animate-luxury-reveal">
            <div className="inline-flex items-center justify-center w-48 h-48 rounded-full bg-brand-gold/5 border border-brand-gold/20 mb-14 shadow-[0_0_150px_rgba(212,175,55,0.15)] relative">
              <div className="absolute inset-0 rounded-full border border-brand-gold/10 border-dashed animate-spin-slow opacity-30" />
              <div className="absolute inset-4 rounded-full border border-brand-gold/5" />
              <CheckCircle className="w-24 h-24 text-brand-gold/90 drop-shadow-[0_0_30px_rgba(212,175,55,0.5)]" />
            </div>

            <div className="flex flex-col items-center gap-8">
              <span className="text-[11px] font-black uppercase tracking-[0.6em] text-brand-gold/50">{t("confirmation.badge")}</span>
              <h1 className="luxury-headline text-7xl sm:text-9xl text-white tracking-tighter leading-none">{t("confirmation.title")}</h1>
              <p className="luxury-subheadline text-white/30 italic font-normal max-w-2xl mx-auto text-2xl leading-relaxed font-sans">
                {t("confirmation.sentTo")} <span className="text-brand-gold/80 border-b border-brand-gold/10 pb-0.5">{passengerEmail || 'o seu email'}</span>
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-24 items-start">

            {/* Main Booking Summary Card */}
            <div className="space-y-16 animate-luxury-reveal" style={{ animationDelay: "200ms" }}>
              <div className="p-14 lg:p-20 rounded-[5rem] bg-[#09090D] border border-white/[0.04] shadow-4xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent opacity-50" />
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-12 mb-20 relative z-10">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20 block mb-4">{t("confirmation.reference")}</span>
                    <p className="text-4xl font-black text-white tracking-widest font-sans">{booking.id?.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="flex items-center gap-5 px-10 py-4.5 rounded-full bg-emerald-500/[0.04] border border-emerald-500/20 backdrop-blur-xl">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-400">{t("confirmation.statusConfirmed")}</span>
                  </div>
                </div>

                {/* Immersive Route Display */}
                <div className="relative py-16 px-12 bg-white/[0.015] rounded-[4rem] border border-white/[0.04] mb-16 overflow-hidden backdrop-blur-3xl">
                  <div className="absolute left-[79px] top-28 bottom-28 w-px bg-gradient-to-b from-brand-gold/60 via-white/10 to-emerald-500/60" />

                  <div className="space-y-24 relative z-10">
                    <div className="flex items-center gap-14 group/loc">
                      <div className="w-16 h-16 rounded-3xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center transition-all duration-700 group-hover/loc:bg-brand-gold group-hover/loc:text-black group-hover/loc:scale-110 shadow-lg">
                        <MapPin className="w-8 h-8 text-brand-gold transition-colors" />
                      </div>
                      <div>
                        <span className="text-[12px] font-black uppercase tracking-[0.6em] text-white/20 block mb-4">{t("confirmation.pickup")}</span>
                        <p className="text-2xl font-bold text-white tracking-tight leading-none uppercase">{booking.from}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-14 group/loc">
                      <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center transition-all duration-700 group-hover/loc:bg-emerald-500 group-hover/loc:text-black group-hover/loc:scale-110 shadow-lg">
                        <MapPin className="w-8 h-8 text-emerald-500 transition-colors" />
                      </div>
                      <div>
                        <span className="text-[12px] font-black uppercase tracking-[0.6em] text-white/20 block mb-4">{t("confirmation.dropoff")}</span>
                        <p className="text-2xl font-bold text-white tracking-tight leading-none uppercase">{booking.to}</p>
                      </div>
                    </div>
                  </div>

                  <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-brand-gold/[0.03] to-transparent pointer-events-none" />
                </div>

                {/* Technical Tableau */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-14 py-14 border-y border-white/[0.04] mb-14">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <Calendar className="w-5 h-5 text-brand-gold/40" />
                      <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">{t("confirmation.date")}</span>
                    </div>
                    <p className="text-lg font-bold text-white tracking-wide">{formatDate(booking.pickupTime)}</p>
                  </div>
                  <div className="space-y-5">
                    <div className="flex items-center gap-4">
                      <Clock className="w-5 h-5 text-brand-gold/40" />
                      <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">{t("confirmation.time")}</span>
                    </div>
                    <p className="text-lg font-bold text-white tracking-wide">{formatTime(booking.pickupTime)}</p>
                  </div>
                  <div className="space-y-5 col-span-2 md:col-span-1">
                    <div className="flex items-center gap-4">
                      <Car className="w-5 h-5 text-brand-gold/40" />
                      <span className="text-[11px] font-black uppercase tracking-[0.5em] text-white/20">{t("confirmation.category")}</span>
                    </div>
                    <p className="text-lg font-black text-brand-gold uppercase tracking-[0.3em]">
                      {t(`categories_list.${booking.category || 'smart'}.name`)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-14 border-t border-white/[0.02] pt-14">
                  <div className="flex items-center gap-10">
                    <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/5 flex items-center justify-center p-1 shadow-inner">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center">
                        <Car className="w-9 h-9 text-white/20" />
                      </div>
                    </div>
                    <div>
                      <span className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em] block mb-2">{t("confirmation.passenger")}</span>
                      <p className="text-2xl font-bold text-white uppercase tracking-tighter">{passengerName || 'VIP Guest'}</p>
                    </div>
                  </div>
                  <div className="md:text-right">
                    <span className="text-[12px] font-black text-brand-gold uppercase tracking-[0.6em] block mb-3">{t("confirmation.totalPaid")}</span>
                    <p className="text-8xl font-black text-white tracking-tighter leading-none drop-shadow-2xl font-sans">
                      {formatCurrency(Number(booking.price || 0))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Security PIN Protocol */}
              <div className="p-12 rounded-[5rem] bg-gradient-to-br from-[#0C0C11] to-black border border-brand-gold/20 shadow-4xl relative overflow-hidden animate-luxury-reveal" style={{ animationDelay: "300ms" }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-[100px] rounded-full" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10 text-center md:text-left">
                  <div className="flex items-center gap-8">
                    <div className="w-20 h-20 rounded-[32px] bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
                      <ShieldCheck className="w-10 h-10 text-brand-gold" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-normal text-white text-serif italic tracking-tight">Código Privado</h3>
                      <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.3em] mt-2">Apresente este código no final da viagem</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end">
                    <div className="flex gap-4 mb-4">
                      {booking.pin?.split('').map((digit: string, idx: number) => (
                        <div key={idx} className="w-16 h-20 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-4xl font-black text-brand-gold shadow-highlight">
                          {digit}
                        </div>
                      )) || (
                        <div className="px-10 py-6 rounded-2xl bg-white/[0.03] border border-white/10 text-2xl font-black text-white/20 uppercase tracking-widest">
                          PENDENTE
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] text-white/20 uppercase font-black tracking-widest italic">Garantimos a total privacidade do seu trajeto</p>
                  </div>
                </div>
              </div>

              {/* Action Suite */}
              <div className="grid sm:grid-cols-3 gap-8 pt-12">
                <Link href="/dashboard" className="px-12 py-8 rounded-[2.5rem] bg-brand-gold text-black text-[12px] font-black uppercase tracking-[0.6em] flex items-center justify-center gap-5 hover:bg-white transition-all duration-500 group shadow-[0_30px_60px_rgba(212,175,55,0.3)]">
                  {t("confirmation.viewDashboard")} <ArrowRight className="w-6 h-6 group-hover:translate-x-4 transition-transform duration-500" />
                </Link>
                <button className="px-12 py-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 text-white/50 text-[12px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-5 hover:bg-white/10 hover:text-white transition-all duration-500">
                  <Download className="w-6 h-6" /> {t("confirmation.downloadPdf")}
                </button>
                <button className="px-12 py-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 text-white/50 text-[12px] font-black uppercase tracking-[0.5em] flex items-center justify-center gap-5 hover:bg-white/10 hover:text-white transition-all duration-500">
                  <Share2 className="w-6 h-6" /> {t("confirmation.share")}
                </button>
              </div>
            </div>

            {/* Protocol Sidebar */}
            <div className="space-y-16 animate-luxury-reveal" style={{ animationDelay: "400ms" }}>
              <div className="p-16 lg:p-20 rounded-[5rem] bg-gradient-to-b from-[#09090D] to-transparent border border-white/[0.04] shadow-2xl relative overflow-hidden">
                <div className="absolute -left-10 top-0 w-40 h-40 bg-brand-gold/5 blur-[80px] rounded-full pointer-events-none" />

                <div className="flex items-center gap-8 mb-16 relative z-10">
                  <ShieldCheck className="w-12 h-12 text-brand-gold/80" />
                  <h3 className="text-4xl font-bold text-white italic font-sans tracking-tight">{t("confirmation.nextStepsTitle")}</h3>
                </div>

                <div className="space-y-20 relative">
                  <div className="absolute left-[23px] top-6 bottom-6 w-px bg-gradient-to-b from-brand-gold/30 via-white/5 to-transparent opacity-30" />

                  {[
                    { icon: Mail, text: t("confirmation.step1"), done: true },
                    { icon: Car, text: t("confirmation.step2"), done: false },
                    { icon: Phone, text: t("confirmation.step3"), done: false },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className="flex gap-12 group relative z-10 items-start">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-1000",
                          s.done ? "bg-emerald-500 text-black shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "bg-white/[0.03] text-white/10 border border-white/5"
                        )}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="pt-2.5">
                          <p className="text-lg leading-relaxed text-white/30 italic font-sans group-hover:text-white/50 transition-colors duration-500">{s.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-20 rounded-[5rem] border border-brand-gold/10 bg-gradient-to-br from-brand-gold/[0.03] to-transparent text-center backdrop-blur-4xl group/hotline">
                <p className="text-[12px] font-black text-white/20 uppercase tracking-[0.6em] mb-12">
                  {t("confirmation.changeSomething")}
                </p>
                <div className="flex flex-col gap-8">
                  <a href="tel:+351924851105" className="text-5xl font-black text-brand-gold font-sans hover:text-white transition-all duration-700 tracking-tighter group-hover/hotline:scale-105 inline-block">
                    +351 924 851 105
                  </a>
                  <div className="pt-8 border-t border-brand-gold/10">
                    <Link href="/dashboard" className="text-[12px] font-black text-brand-gold/40 uppercase tracking-[0.7em] hover:text-brand-gold hover:tracking-[0.8em] transition-all duration-500 flex items-center justify-center gap-5">
                      {t("confirmation.customerArea")} <ArrowUpRight className="w-5 h-5 animate-pulse" />
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
