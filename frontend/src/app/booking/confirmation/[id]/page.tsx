"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { formatCurrency, cn } from "@/lib/utils";
import { useI18n } from "@/i18n/context";
import { useAuthStore } from "@/lib/auth-store";
import {
  CheckCircle, MapPin, Calendar, Clock, Car, AlertCircle,
  Mail, Phone, Download, ArrowRight, Loader2, Share2,
  ShieldCheck, ArrowUpRight, RefreshCw, MessageSquare
} from "lucide-react";
import axios from "axios";

type RedirectStatus = "succeeded" | "failed" | "processing" | null;
type BookingStatus = "confirmed" | "PENDING" | "payment_failed" | "disputed" | "refunded" | string;

const MAX_POLLS  = 12;   // 12 × 5s = 60s max polling
const POLL_INTERVAL = 5000;

export default function ConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams   = useSearchParams();
  const redirectStatus = searchParams.get("redirect_status") as RedirectStatus;
  const paymentIntent  = searchParams.get("payment_intent");

  const [booking,      setBooking]      = useState<any>(null);
  const [loadError,    setLoadError]    = useState<string | null>(null);
  const [mounted,      setMounted]      = useState(false);
  const [pollCount,    setPollCount]    = useState(0);
  const [polling,      setPolling]      = useState(false);
  const { t }  = useI18n();
  const { user } = useAuthStore();

  // ─── Fetch booking once ────────────────────────────────────────────────────
  const fetchBooking = useCallback(async () => {
    if (!id || id === "processing") return null;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
      const res = await axios.get(`${apiUrl}/bookings/${id}`);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch booking:", err);
      return null;
    }
  }, [id]);

  // ─── Mount: handle Stripe redirect + initial load ─────────────────────────
  useEffect(() => {
    setMounted(true);

    // If Stripe redirect says failed → redirect immediately
    if (redirectStatus === "failed") {
      window.location.href = `/booking/failed?bookingId=${id}&pi=${paymentIntent || ""}`;
      return;
    }

    const load = async () => {
      const data = await fetchBooking();
      if (data) {
        setBooking(data);
        // If webhook hasn't fired yet, start polling
        const status: BookingStatus = data.status || data.paymentStatus;
        if (status === "PENDING" || redirectStatus === "processing") {
          setPolling(true);
        }
      } else {
        setLoadError("Não foi possível carregar os detalhes da reserva.");
      }
    };

    load();
  }, []);

  // ─── Polling loop (waits for webhook confirmation) ────────────────────────
  useEffect(() => {
    if (!polling) return;
    if (pollCount >= MAX_POLLS) {
      setPolling(false);
      return;
    }

    const timer = setTimeout(async () => {
      const data = await fetchBooking();
      if (data) {
        setBooking(data);
        const status: BookingStatus = data.status || data.paymentStatus;
        if (status === "confirmed" || status === "PAID") {
          setPolling(false);
        } else {
          setPollCount((c) => c + 1);
        }
      } else {
        setPollCount((c) => c + 1);
      }
    }, POLL_INTERVAL);

    return () => clearTimeout(timer);
  }, [polling, pollCount, fetchBooking]);

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const formatDate = (iso: string) => {
    try {
      if (!iso) return "-";
      return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
    } catch { return iso; }
  };

  const formatTime = (iso: string) => {
    try {
      if (!iso) return "-";
      return new Intl.DateTimeFormat("pt-PT", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
    } catch { return iso; }
  };

  const passengerEmail = booking?.passenger?.email?.trim() || user?.email || null;
  const passengerName  = booking?.passenger?.name?.trim()  || user?.name  || null;
  const bookingStatus: BookingStatus = booking?.status || booking?.paymentStatus || "PENDING";
  const isConfirmed = bookingStatus === "confirmed" || bookingStatus === "PAID";
  const isPending   = !isConfirmed && polling;

  // ─── States ─────────────────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#07070A] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
      </div>
    );
  }

  // Processing / polling state (webhook not yet fired)
  if (isPending || (redirectStatus === "processing" && !booking)) {
    return (
      <div className="min-h-screen bg-[#07070A] flex flex-col items-center justify-center p-8 font-sans">
        <Navbar />
        <div className="text-center space-y-10 mt-24 max-w-md">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full border-2 border-brand-gold/20 border-dashed animate-spin" />
            <div className="w-24 h-24 rounded-full bg-brand-gold/5 border border-brand-gold/20 flex items-center justify-center">
              <RefreshCw className="w-10 h-10 text-brand-gold animate-spin" />
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-gold/60 mb-3">
              A Confirmar Pagamento
            </p>
            <h1 className="text-3xl font-light text-white tracking-tight mb-4">
              A processar a sua reserva…
            </h1>
            <p className="text-white/30 text-sm leading-relaxed max-w-sm mx-auto">
              Estamos a aguardar a confirmação do pagamento. Isto demora normalmente menos de 10 segundos.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 text-white/20 text-[10px] font-black uppercase tracking-widest">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-ping" />
            Verificando com o banco…
          </div>
        </div>
      </div>
    );
  }

  // Load error or booking not found
  if (loadError || (!booking && pollCount >= MAX_POLLS)) {
    return (
      <div className="min-h-screen bg-[#07070A] flex flex-col items-center justify-center p-8 text-center font-sans">
        <Navbar />
        <div className="max-w-md space-y-8 mt-24">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto animate-pulse">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-light text-white tracking-tight">Reserva não encontrada</h1>
          <p className="text-white/40 text-sm leading-relaxed max-w-sm mx-auto">
            {loadError || "Não foi possível verificar o estado do pagamento. Verifique o seu e-mail ou contacte o suporte."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/reservar" className="px-8 py-3.5 bg-brand-gold text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
              Nova Reserva
            </Link>
            <a href="mailto:support@movnly.com" className="px-8 py-3.5 bg-white/[0.03] border border-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:border-white/20 transition-all">
              Contactar Suporte
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#07070A] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
      </div>
    );
  }

  // ─── Main confirmed view ─────────────────────────────────────────────────────
  return (
    <div className="bg-[#07070A] min-h-screen font-sans">
      <Navbar />
      <main className="pt-32 pb-32">
        <div className="nx-container max-w-5xl mx-auto px-6">

          {/* Hero success - Enhanced */}
          <div className="text-center mb-20 animate-luxury-reveal">
            <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-brand-gold/[0.08] to-brand-gold/[0.02] border border-brand-gold/20 mb-8 shadow-[0_0_120px_rgba(212,175,55,0.15)] relative overflow-hidden">
              <div className="absolute inset-0 rounded-full border border-brand-gold/15 border-dashed animate-spin-slow opacity-30" />
              <div className="absolute inset-3 rounded-full border border-brand-gold/5" />
              <div className="absolute inset-0 bg-brand-gold/10 blur-[60px] rounded-full animate-pulse" />
              <CheckCircle className="w-20 h-20 text-brand-gold/90 drop-shadow-[0_0_30px_rgba(212,175,55,0.5)] animate-pulse relative z-10" />
            </div>
            <div className="flex flex-col items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-gold/60">
                {t("confirmation.badge")}
              </span>
              <h1 className="text-4xl sm:text-6xl font-light text-white tracking-tight leading-tight max-w-2xl mx-auto">
                {t("confirmation.title")}
              </h1>
              <p className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed">
                {t("confirmation.sentTo")}{" "}
                <span className="text-brand-gold/80 border-b border-brand-gold/20 pb-0.5 font-medium">
                  {passengerEmail || "o seu email"}
                </span>
              </p>
              {/* Payment method pill - Enhanced */}
              {paymentIntent && (
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-emerald-500/[0.06] border border-emerald-500/20 mt-3 backdrop-blur-md">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400/90">
                    Pagamento verificado via Stripe
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
              )}
              {/* Trust badges */}
              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2 text-white/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-[8px] font-black uppercase tracking-wider">SSL 256-bit</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-2 text-white/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-[8px] font-black uppercase tracking-wider">PCI DSS</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-2 text-white/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-[8px] font-black uppercase tracking-wider">Anti-fraude</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-start">

            {/* Main Booking Card */}
            <div className="space-y-8 animate-luxury-reveal" style={{ animationDelay: "200ms" }}>
              <div className="p-8 md:p-12 rounded-[2.5rem] bg-[#09090D]/90 border border-brand-gold/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-xl">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 relative z-10">
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20 block mb-1">
                      {t("confirmation.reference")}
                    </span>
                    <p className="text-2xl font-bold text-white tracking-wider font-mono">
                      {booking.id?.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/[0.03] border border-emerald-500/20 backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-emerald-400">
                      {t("confirmation.statusConfirmed")}
                    </span>
                  </div>
                </div>

                {/* Route */}
                <div className="relative py-8 px-6 bg-white/[0.01] rounded-2xl border border-white/5 mb-10 overflow-hidden">
                  <div className="absolute left-[39px] top-16 bottom-16 w-px bg-gradient-to-b from-brand-gold/40 via-white/10 to-emerald-500/40" />
                  <div className="space-y-12 relative z-10">
                    <div className="flex items-center gap-8">
                      <div className="w-12 h-12 rounded-2xl bg-brand-gold/5 border border-brand-gold/20 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-brand-gold/80" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-1">
                          {t("confirmation.pickup")}
                        </span>
                        <p className="text-base font-semibold text-white tracking-tight uppercase leading-tight">{booking.from}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-emerald-500/80" />
                      </div>
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-white/20 block mb-1">
                          {t("confirmation.dropoff")}
                        </span>
                        <p className="text-base font-semibold text-white tracking-tight uppercase leading-tight">{booking.to}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details grid */}
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
                      {t(`categories_list.${booking.category || "smart"}.name`)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-4">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center">
                      <Car className="w-6 h-6 text-white/20" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] block mb-1">{t("confirmation.passenger")}</span>
                      <p className="text-base font-bold text-white uppercase tracking-tight">{passengerName || "VIP Guest"}</p>
                    </div>
                  </div>
                  <div className="md:text-right">
                    <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.5em] block mb-1">{t("confirmation.totalPaid")}</span>
                    <p className="text-4xl font-light text-white tracking-tight leading-none">
                      {formatCurrency(Number(booking.price || 0))}
                    </p>
                  </div>
                </div>
              </div>

              {/* PIN */}
              <div className="p-8 rounded-[2.5rem] bg-[#09090D]/90 border border-brand-gold/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-xl animate-luxury-reveal" style={{ animationDelay: "300ms" }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-[100px] rounded-full" />
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-center md:text-left">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-brand-gold/5 border border-brand-gold/20 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-7 h-7 text-brand-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-light text-white tracking-tight">Código Privado</h3>
                      <p className="text-[9px] text-white/30 uppercase font-black tracking-[0.25em] mt-1">Apresente no final da viagem</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-center md:items-end">
                    <div className="flex gap-3 mb-2">
                      {booking.pin?.split("").map((digit: string, idx: number) => (
                        <div key={idx} className="w-12 h-16 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center text-2xl font-light text-brand-gold shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
                          {digit}
                        </div>
                      )) || (
                        <div className="px-6 py-4 rounded-xl bg-white/[0.02] border border-white/5 text-base font-black text-white/20 uppercase tracking-widest">
                          PENDENTE
                        </div>
                      )}
                    </div>
                    <p className="text-[8px] text-white/20 uppercase font-black tracking-widest italic">Garantimos total privacidade</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid sm:grid-cols-3 gap-4 pt-4">
                <Link href="/dashboard" className="px-6 py-4 rounded-full bg-gradient-to-br from-brand-gold via-[#C5A028] to-brand-gold text-black text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-700 group shadow-[0_15px_30px_rgba(197,160,40,0.15)]">
                  {t("confirmation.viewDashboard")} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
                </Link>
                <a
                  href={`https://wa.me/351924851105?text=Olá, tenho uma reserva confirmada (${booking.id?.slice(0, 8).toUpperCase()})`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-4 rounded-full bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#25D366]/20 transition-all duration-500"
                >
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </a>
                <button
                  onClick={() => {
                    const text = `Reserva MOVNLY: ${booking.from} para ${booking.to}`;
                    const dates = `${booking.pickupTime?.replace(/[-:]/g, "").split(".")[0]}Z/${booking.pickupTime?.replace(/[-:]/g, "").split(".")[0]}Z`;
                    window.open(`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(text)}&dates=${dates}&details=${encodeURIComponent(`Referência: ${booking.id?.slice(0, 8).toUpperCase()}`)}`, '_blank');
                  }}
                  className="px-6 py-4 rounded-full bg-white/[0.02] border border-white/5 text-white/50 text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white/[0.05] hover:text-white transition-all duration-500"
                >
                  <Calendar className="w-4 h-4" /> Calendário
                </button>
              </div>
            </div>

            {/* Sidebar */}
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
                    { icon: Mail,  text: t("confirmation.step1"), done: true },
                    { icon: Car,   text: t("confirmation.step2"), done: false },
                    { icon: Phone, text: t("confirmation.step3"), done: false },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <div key={i} className="flex gap-6 group relative z-10 items-start">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-1000",
                          s.done
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                            : "bg-white/[0.02] text-white/10 border border-white/5"
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
                  <a href="tel:+351924851105" className="text-3xl font-light text-brand-gold hover:text-white transition-all duration-700 tracking-tight group-hover/hotline:scale-105 inline-block">
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
