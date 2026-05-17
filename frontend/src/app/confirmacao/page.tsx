"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
import { useI18n } from "@/i18n/context";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/lib/auth-store";
import {
  CheckCircle, MapPin, Calendar, Clock, Car,
  Mail, Phone, Download, Share2, ArrowRight,
  Loader2, AlertTriangle
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
  };
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const { t } = useI18n();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookingId = searchParams.get("id");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

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
      <div className="card-premium p-12 text-center max-w-lg mx-auto">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white mb-2">Ops! Algo correu mal.</h2>
        <p className="text-white/40 text-sm mb-8">{error || "Sessão expirada ou reserva inexistente."}</p>
        <Link href="/dashboard" className="btn-primary w-full justify-center">Voltar ao Portal</Link>
      </div>
    );
  }

  // Formatting helpers
  const ref = String(parseInt(booking.id.replace(/-/g, '').slice(0, 8), 16) % 900000 + 100000);
  const pickupDate = new Date(booking.pickupTime);

  return (
    <div className="container-premium max-w-2xl animate-luxury-reveal">
      {/* Success Header with Orbital Celebration */}
      <div className="text-center mb-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-gold/10 blur-[100px] rounded-full animate-pulse" />
        
        <div className="relative z-10">
          <div className="w-32 h-32 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mx-auto mb-10 shadow-[0_0_100px_rgba(212,175,55,0.3)] group">
            <CheckCircle className="w-16 h-16 text-brand-gold group-hover:scale-110 transition-transform duration-1000" />
          </div>
          <div className="inline-flex items-center gap-3 mb-8 px-8 py-3 rounded-full bg-brand-gold/10 border border-brand-gold/20 shadow-lg">
             <span className="w-2 h-2 rounded-full bg-brand-gold animate-ping" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-gold">{t("bookingFlow.confirmation.status")}</span>
          </div>
          <h1 className="text-6xl sm:text-8xl font-black text-white mb-6 uppercase tracking-tighter leading-none">
            {t("bookingFlow.confirmation.titlePart1")} <br />
            <span className="text-brand-gold">{t("bookingFlow.confirmation.titlePart2")}</span>
          </h1>
          <p className="text-white/30 text-xs font-black uppercase tracking-[0.5em] mt-8 max-w-md mx-auto leading-relaxed">
            {t("bookingFlow.confirmation.subtitle")}
          </p>
        </div>
      </div>

      {/* Futuristic Booking Voucher */}
      <div className="glass-bento-luxury p-12 mb-12 border-brand-gold/10 relative overflow-hidden group shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        {/* Perforated edge effect */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-[#07070A] rounded-full border border-white/5" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-[#07070A] rounded-full border border-white/5" />

        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.4em] mb-2">{t("bookingFlow.confirmation.ref")}</p>
            <p className="text-4xl font-black text-white tracking-tighter">{ref}</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.4em] mb-2">STATUS</p>
             <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[10px] uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                VERIFICADO
             </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-12 pb-12 border-b border-white/5 relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 hidden md:block" />
          <div className="space-y-8">
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-brand-gold/40 transition-colors">
                <MapPin className="w-6 h-6 text-brand-gold" />
              </div>
              <div>
                <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.4em] mb-1">{t("bookingFlow.confirmation.from")}</p>
                <p className="text-sm font-black text-white uppercase tracking-wider leading-tight">{booking.from}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:border-emerald-500/40 transition-colors">
                <MapPin className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.4em] mb-1">{t("bookingFlow.confirmation.to")}</p>
                <p className="text-sm font-black text-white uppercase tracking-wider leading-tight">{booking.to}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.4em] mb-2">{t("bookingFlow.confirmation.date")}</p>
                <p className="text-xs font-black text-white uppercase tracking-widest">{pickupDate.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.4em] mb-2">{t("bookingFlow.confirmation.time")}</p>
                <p className="text-xs font-black text-white uppercase tracking-widest">{pickupDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.4em] mb-2">{t("bookingFlow.confirmation.category")}</p>
                <p className="text-xs font-black text-brand-gold uppercase tracking-widest">{booking.category}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.4em] mb-2">PIN</p>
                <p className="text-xl font-black text-white tracking-[0.3em]">{booking.pin}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
             <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.4em] mb-2">{t("bookingFlow.confirmation.passenger")}</p>
             <p className="text-xs font-black text-white uppercase tracking-widest">{booking.passenger?.name || "Cliente MOVNLY"}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/20 uppercase font-black tracking-[0.4em] mb-2">{t("bookingFlow.confirmation.amount")}</p>
            <p className="text-4xl font-black text-white tracking-tighter leading-none">{formatCurrency(booking.price)}</p>
          </div>
        </div>
      </div>

      {/* Action Plan */}
      <div className="card-premium p-8 mb-10 bg-white/[0.01]">
        <h3 className="font-black text-xs uppercase tracking-[0.3em] text-white/40 mb-6">Próximos Passos</h3>
        <div className="space-y-6">
          {[
            { icon: Mail, text: "Um email de confirmação foi enviado com o seu voucher digital.", done: true },
            { icon: Car, text: "O seu chauffeur será designado e os detalhes do veículo enviados 24h antes.", done: false },
            { icon: Phone, text: "Suporte prioritário via WhatsApp disponível 24/7 para esta reserva.", done: false },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all duration-500", step.done ? "bg-brand-gold/10 border-brand-gold/20 text-brand-gold" : "bg-white/5 border-white/10 text-white/20")}>
                <step.icon className="w-4 h-4" />
              </div>
              <p className={cn("text-sm leading-relaxed pt-1.5", step.done ? "text-white/80" : "text-white/30")}>{step.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-6 mt-12">
        <Link href="/dashboard" className="btn-editorial btn-editorial-primary flex-1">
          Aceder ao MyMOVNLY
          <ArrowRight className="w-4 h-4 ml-3" />
        </Link>
        <button 
          onClick={() => window.print()}
          className="btn-editorial btn-editorial-outline group"
        >
          <Download className="w-4 h-4 mr-3 group-hover:-translate-y-1 transition-transform" />
          Voucher PDF
        </button>
      </div>

      <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.3em] mt-12 font-medium">
        MOVNLY — Private Chauffeur Services
      </p>
    </div>
  );
}

export default function ConfirmacaoPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#07070A] pt-32 pb-20 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full">
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
