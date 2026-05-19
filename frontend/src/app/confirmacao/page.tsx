"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import { useI18n } from "@/i18n/context";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  CheckCircle, MapPin, Calendar, Clock, Car,
  Mail, Phone, Download, Share2, ArrowRight,
  Loader2, ShieldCheck, ArrowUpRight
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface BookingDetails {
  id: string;
  pickupTime: string;
  from: string;
  to: string;
  category: string;
  price: number;
  pin: string;
  passenger?: {
    name: string;
    email?: string;
  };
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingId = searchParams.get("id");

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError("ID da reserva não encontrado.");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/bookings/${bookingId}`);
        setBooking(res.data);
      } catch (err: unknown) {
        console.error("Failed to fetch booking:", err);
        setError("Não foi possível carregar os detalhes da reserva.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
        <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em] animate-pulse">Sincronizando Reserva...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#07070A] flex flex-col items-center justify-center p-8 text-center font-sans tracking-tight">
        <div className="max-w-md space-y-8">
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

  const ref = String(parseInt(booking.id.replace(/-/g, '').slice(0, 8), 16) % 900000 + 100000);
  const pickupDate = new Date(booking.pickupTime);

  return (
    <div className="container-premium max-w-5xl mx-auto px-6 animate-luxury-reveal">
      {/* Success Header with Orbital Celebration */}
      <div className="text-center mb-20 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-gold/10 blur-[100px] rounded-full animate-pulse pointer-events-none" />
        
        <div className="relative z-10">
          <div className="w-36 h-36 rounded-full bg-brand-gold/5 border border-brand-gold/20 flex items-center justify-center mx-auto mb-8 shadow-[0_0_120px_rgba(212,175,55,0.15)] group relative">
            <div className="absolute inset-0 rounded-full border border-brand-gold/15 border-dashed animate-spin-slow opacity-30" />
            <CheckCircle className="w-16 h-16 text-brand-gold group-hover:scale-110 transition-transform duration-1000" />
          </div>
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-brand-gold/5 border border-brand-gold/20 shadow-lg">
             <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping" />
             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-gold">{t("confirmation.badge")}</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-light text-white tracking-tight leading-tight max-w-2xl mx-auto">
            {t("confirmation.title")}
          </h1>
          <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed mt-4">
            {t("confirmation.sentTo")} <span className="text-brand-gold/80 border-b border-brand-gold/20 pb-0.5 font-medium">{booking.passenger?.email || 'o seu email'}</span>
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-start">
        
        {/* Main Booking Summary Card */}
        <div className="space-y-8">
          <div className="p-8 md:p-12 rounded-[2.5rem] bg-[#09090D]/90 border border-brand-gold/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-xl group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 relative z-10">
              <div>
                <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.4em] mb-1">{t("confirmation.reference")}</p>
                <p className="text-2xl font-bold text-white tracking-wider font-mono">{ref}</p>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/[0.03] border border-emerald-500/20 backdrop-blur-md">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400">{t("confirmation.statusConfirmed")}</span>
              </div>
            </div>

            {/* Route Map/Details */}
            <div className="relative py-8 px-6 bg-white/[0.01] rounded-2xl border border-white/5 mb-10 overflow-hidden">
              <div className="absolute left-[39px] top-16 bottom-16 w-px bg-gradient-to-b from-brand-gold/40 via-white/10 to-emerald-500/40" />
              
              <div className="space-y-12 relative z-10">
                <div className="flex items-start gap-8">
                  <div className="w-12 h-12 rounded-2xl bg-brand-gold/5 border border-brand-gold/20 flex items-center justify-center flex-shrink-0 group-hover:border-brand-gold/40 transition-colors">
                    <MapPin className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.4em] mb-1">{t("confirmation.pickup")}</p>
                    <p className="text-base font-semibold text-white uppercase tracking-wider leading-tight">{booking.from}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-8">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:border-emerald-500/40 transition-colors">
                    <MapPin className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.4em] mb-1">{t("confirmation.dropoff")}</p>
                    <p className="text-base font-semibold text-white uppercase tracking-wider leading-tight">{booking.to}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-8 border-y border-white/[0.04] mb-8">
              <div className="space-y-2">
                <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.4em]">{t("confirmation.date")}</p>
                <p className="text-sm font-semibold text-white uppercase tracking-wider">{pickupDate.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.4em]">{t("confirmation.time")}</p>
                <p className="text-sm font-semibold text-white uppercase tracking-wider">{pickupDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.4em]">{t("confirmation.category")}</p>
                <p className="text-sm font-black text-brand-gold uppercase tracking-wider">{booking.category}</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4">
              <div>
                 <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.4em] mb-1">{t("confirmation.passenger")}</p>
                 <p className="text-xs font-black text-white uppercase tracking-widest">{booking.passenger?.name || "Cliente MOVNLY"}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-white/20 uppercase font-black tracking-[0.4em] mb-1">{t("confirmation.totalPaid")}</p>
                <p className="text-4xl font-light text-white tracking-tighter leading-none">{formatCurrency(booking.price)}</p>
              </div>
            </div>
          </div>

          {/* Code PIN Block */}
          <div className="p-8 rounded-[2.5rem] bg-[#09090D]/90 border border-brand-gold/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-xl">
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
        </div>

        {/* Protocol Sidebar */}
        <div className="space-y-8">
          <div className="p-8 md:p-10 rounded-[2.5rem] bg-[#09090D]/90 border border-brand-gold/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-xl">
            <div className="absolute -left-10 top-0 w-40 h-40 bg-brand-gold/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex items-center gap-4 mb-10 relative z-10">
              <ShieldCheck className="w-8 h-8 text-brand-gold/80" />
              <h3 className="text-xl font-light text-white tracking-tight">{t("confirmation.nextStepsTitle")}</h3>
            </div>

            <div className="space-y-10 relative">
              <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-brand-gold/20 via-white/5 to-transparent opacity-20" />

              {[
                { icon: Mail, text: "Um email de confirmação foi enviado com o seu voucher digital.", done: true },
                { icon: Car, text: "O seu chauffeur será designado e os detalhes do veículo enviados 24h antes.", done: false },
                { icon: Phone, text: "Suporte prioritário via WhatsApp disponível 24/7 para esta reserva.", done: false },
              ].map((step, i) => (
                <div key={i} className="flex gap-6 group relative z-10 items-start">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-1000",
                    step.done ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]" : "bg-white/[0.02] border-white/5 text-white/10"
                  )}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="pt-2">
                    <p className={cn("text-xs leading-relaxed transition-colors duration-500", step.done ? "text-white/60" : "text-white/30")}>{step.text}</p>
                  </div>
                </div>
              ))}
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

      {/* Action suite at bottom */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 max-w-xl">
        <Link href="/dashboard" className="px-6 py-4.5 rounded-full bg-gradient-to-br from-brand-gold via-[#C5A028] to-brand-gold text-black text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all duration-700 group shadow-[0_15px_30px_rgba(197,160,40,0.15)] flex-1 cursor-pointer">
          Aceder ao MyMOVNLY <ArrowRight className="w-4 h-4" />
        </Link>
        <button 
          onClick={() => window.print()}
          className="px-6 py-4.5 rounded-full bg-white/[0.02] border border-white/5 text-white/50 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-white/[0.05] hover:text-white transition-all duration-500 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Voucher PDF
        </button>
      </div>
    </div>
  );
}

export default function ConfirmacaoPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#07070A] pt-32 pb-20 relative overflow-hidden font-sans">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-gold/5 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full" />
        </div>

        <Suspense fallback={
          <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
            <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em] animate-pulse">A carregar detalhes...</p>
          </div>
        }>
          <ConfirmationContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
