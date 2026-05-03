"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";
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
  passenger?: {
    name: string;
  };
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuthStore();
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
    <div className="container-premium max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Success Header */}
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-full bg-brand-gold/10 border-2 border-brand-gold/30 flex items-center justify-center mx-auto mb-5 shadow-[0_0_60px_rgba(197,160,89,0.15)]">
          <CheckCircle className="w-10 h-10 text-brand-gold" />
        </div>
        <Badge variant="gold" className="mb-3 px-4 py-1">Reserva Confirmada</Badge>
        <h1 className="text-4xl font-normal text-white mb-2 italic text-serif tracking-tight leading-tight">Experiência <span className="text-brand-gold not-italic">Garantida</span></h1>
        <p className="text-white/40 text-sm font-light">
          A sua reserva foi confirmada com sucesso.
        </p>
      </div>

      {/* Booking Card */}
      <div className="card-premium p-10 mb-8 border-brand-gold/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Número da Reserva</p>
            <p className="text-2xl font-black text-white tracking-tighter">{ref}</p>
          </div>
          <div className="text-right">
             <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mb-1">Status</p>
             <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Pago & Reservado
             </div>
          </div>
        </div>

        <div className="space-y-4 mb-8 pb-8 border-b border-white/5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-0.5">Ponto de Partida</p>
              <p className="text-base font-medium text-white leading-tight">{booking.from}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-0.5">Destino da Viagem</p>
              <p className="text-base font-medium text-white leading-tight">{booking.to}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8 pb-8 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-white/20 mb-2">
              <Calendar className="w-3 h-3 text-brand-gold" /> Data
            </div>
            <p className="text-sm font-bold text-white italic">{pickupDate.toLocaleDateString('pt-PT', { day: 'numeric', month: 'long' })}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-white/20 mb-2">
              <Clock className="w-3 h-3 text-brand-gold" /> Hora
            </div>
            <p className="text-sm font-bold text-white italic">{pickupDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-white/20 mb-2">
              <Car className="w-3 h-3 text-brand-gold" /> Categoria
            </div>
            <p className="text-sm font-bold text-white uppercase tracking-widest text-brand-400">{booking.category}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
             <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Passageiro</p>
             <p className="text-sm text-white/60">{booking.passenger?.name || "Cliente NexRice"}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-1">Montante Liquidado</p>
            <p className="text-3xl font-black text-white tracking-tighter">{formatCurrency(booking.price)}</p>
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
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/dashboard" className="btn-primary flex-1 justify-center py-4 text-xs font-black uppercase tracking-widest">
          Aceder ao MyNexRice
          <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
        <button 
          onClick={() => window.print()}
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          Voucher PDF
        </button>
      </div>

      <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.3em] mt-12 font-medium">
        NexRice — Private Chauffeur Services
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
