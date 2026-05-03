"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useBookings } from "@/hooks/useBookings";
import { useAuthStore } from "@/lib/auth-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import {
  Calendar, TrendingUp, Plus, Car, Loader2,
  Bell, CreditCard, ShieldCheck, ChevronRight,
  Activity, MapPin, Clock, ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { MissionHUD } from "@/components/dashboard/MissionHUD";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { bookings, upcoming, completed, live, loading, refresh } = useBookings();
  const user = useAuthStore(s => s.user);
  const { socket } = useSocket();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!socket) return;
    socket.on("booking_update", (data: any) => {
      refresh();
      if (data.status === 'DRIVER_ACCEPTED' || data.status === 'ON_ROUTE') {
        toast.success("Motorista a caminho!", {
          description: `${data.driverName || 'O seu motorista'} já se encontra em deslocação.`,
          duration: 8000,
        });
      } else if (data.status === 'DRIVER_ARRIVED') {
        toast.success("O seu transporte chegou!", {
          description: "O motorista já se encontra no ponto de recolha.",
          duration: 10000,
        });
      } else if (data.status === 'IN_PROGRESS') {
        toast.info("Viagem Iniciada", {
          description: "Tenha uma excelente viagem com a NexRice.",
        });
      } else if (data.status === 'COMPLETED') {
        toast.success("Viagem Concluída", {
          description: "Obrigado por escolher a NexRice. Esperamos vê-lo em breve.",
        });
      } else {
        toast.info("Reserva atualizada");
      }
    });
    socket.on("payment_update", () => { refresh(); toast.success("Pagamento confirmado"); });
    return () => { socket.off("booking_update"); socket.off("payment_update"); };
  }, [socket, refresh]);

  if (!mounted || loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-brand-gold text-[10px] uppercase tracking-[0.3em] font-black animate-pulse">Carregando</div>
    </div>
  );

  const activeTrip = live[0];
  const nextTrip = upcoming[0];
  const totalSpent = bookings.reduce((s, b) => s + b.totalPrice, 0);

  return (
    <div className="space-y-10 animate-luxury-reveal pb-10">

      {/* ── Cabeçalho ─────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8 relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10">
          <span className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] block mb-3 flex items-center gap-2">
            <Activity className="w-3 h-3" /> Painel de Bordo
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
            Bem-vindo, <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-[#a6862c]">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="text-white/40 text-sm font-light italic mt-3 tracking-wide">
            Aqui está o resumo da sua conta NexRice.
          </p>
        </div>
        <Link
          href="/book"
          className="inline-flex items-center justify-center gap-3 h-14 px-8 bg-gradient-to-br from-brand-gold to-[#a6862c] text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-[20px] hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_-10px_rgba(212,175,55,0.4)] relative z-10 w-full md:w-auto"
        >
          <Plus className="w-4 h-4" /> Agendar Viagem
        </Link>
      </div>

      {/* ── Viagem Ativa ───────────────────────────────────────── */}
      {activeTrip && <MissionHUD booking={activeTrip} />}

      {/* ── Resumo ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {[
          { label: "Viagens Realizadas", value: String(completed.length), icon: Car, color: "gold" },
          { label: "Gasto Total", value: formatCurrency(totalSpent), icon: TrendingUp, color: "white" },
          { label: "Sua Avaliação", value: "100%", icon: ShieldCheck, color: "gold" },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 md:p-8 rounded-[32px] bg-[#07070A] border border-white/5 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-[40px] rounded-full pointer-events-none group-hover:bg-brand-gold/10 transition-colors duration-700" />
            
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 relative z-10 transition-transform duration-500 group-hover:-translate-y-1",
              color === "gold" ? "bg-gradient-to-br from-brand-gold/20 to-black border border-brand-gold/20 text-brand-gold shadow-inner" : "bg-white/5 border border-white/10 text-white/50 group-hover:text-white"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-3xl font-bold text-white tracking-tight relative z-10">{value}</p>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] mt-2 relative z-10">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Grid Principal ─────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Próxima viagem */}
        <div className="lg:col-span-2 p-8 rounded-[32px] bg-[#07070A] border border-white/5 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] pointer-events-none" />
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-brand-gold/5 blur-[60px] rounded-full pointer-events-none" />
          
          <h3 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] mb-8 flex items-center gap-3 relative z-10">
            <Calendar className="w-4 h-4" /> Sua Próxima Viagem
          </h3>
          
          {nextTrip ? (
            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5 inline-flex backdrop-blur-sm">
                <Clock className="w-4 h-4 text-brand-gold" />
                <span className="text-xs font-black uppercase tracking-widest text-white/80">
                    {nextTrip.pickupDate} • {nextTrip.pickupTime}
                </span>
              </div>

              <div className="flex items-center gap-6 relative px-4">
                  <div className="absolute inset-0 top-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-brand-gold/50 via-white/10 to-transparent pointer-events-none" />
                  
                  <div className="relative z-10 bg-[#07070A] pr-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-brand-gold flex items-center justify-center bg-black shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                          <MapPin className="w-3 h-3 text-brand-gold" />
                      </div>
                      <p className="text-sm text-white font-medium truncate max-w-[150px]">{nextTrip.origin.split(',')[0]}</p>
                  </div>
                  
                  <div className="flex-1" />
                  
                  <div className="relative z-10 bg-[#07070A] pl-4 flex items-center gap-3">
                      <p className="text-sm text-white/60 font-light truncate max-w-[150px]">{nextTrip.destination.split(',')[0]}</p>
                      <div className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center bg-black">
                          <MapPin className="w-3 h-3 text-white/50" />
                      </div>
                  </div>
              </div>

              <Link
                href={`/dashboard/bookings/${nextTrip.id}`}
                className="flex items-center justify-between p-5 rounded-[20px] bg-gradient-to-r from-white/[0.03] to-transparent border border-white/5 hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all group/btn"
              >
                <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] group-hover/btn:text-brand-gold transition-colors">Acessar Detalhes da Reserva</span>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover/btn:text-brand-gold transition-colors" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center relative z-10">
              <div className="w-20 h-20 rounded-full border border-white/5 flex items-center justify-center mb-6">
                <MapPin className="w-8 h-8 text-white/10" />
              </div>
              <p className="text-white/40 font-light tracking-wide text-sm">Sua agenda está livre de compromissos.</p>
              <Link href="/book" className="mt-6 text-[10px] font-black text-brand-gold uppercase tracking-[0.2em] hover:underline hover:text-white transition-colors">
                Agendar Nova Viagem →
              </Link>
            </div>
          )}
        </div>

        {/* Ações rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          {[
            { label: "Nova Viagem", icon: Plus, href: "/book", gold: true },
            { label: "Faturas", icon: CreditCard, href: "/dashboard/payment", gold: false },
            { label: "Mensagens", icon: Bell, href: "/dashboard/chat", gold: false },
            { label: "Concluídas", icon: Clock, href: "/dashboard/history", gold: false },
          ].map(({ label, icon: Icon, href, gold }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                "p-5 rounded-[24px] border flex items-center gap-4 transition-all duration-500 group relative overflow-hidden",
                gold
                  ? "bg-gradient-to-r from-brand-gold/10 to-transparent border-brand-gold/30 hover:from-brand-gold/20 hover:border-brand-gold shadow-[0_0_20px_rgba(212,175,55,0.05)]"
                  : "bg-[#07070A] border-white/5 hover:bg-white/[0.03] hover:border-white/10"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-[16px] flex items-center justify-center transition-all duration-500 flex-shrink-0 shadow-inner",
                gold
                  ? "bg-brand-gold/20 text-brand-gold group-hover:bg-brand-gold group-hover:text-black"
                  : "bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300",
                gold ? "text-brand-gold group-hover:text-white" : "text-white/40 group-hover:text-white"
              )}>{label}</span>
              <ChevronRight className={cn(
                "w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0",
                gold ? "text-brand-gold" : "text-white/30"
              )} />
            </Link>
          ))}
        </div>

      </div>

      {/* ── Histórico Recente ──────────────────────────────────── */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2 className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] flex items-center gap-3">
             Registros Recentes
          </h2>
          <Link href="/dashboard/history" className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] hover:text-white transition-all flex items-center gap-2 group">
            Ver Todas <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {completed.length === 0 ? (
          <div className="p-16 rounded-[32px] bg-[#07070A] border border-white/5 text-center">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Nenhum registro encontrado</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {completed.slice(0, 3).map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-[28px] bg-[#07070A] border border-white/5 hover:border-brand-gold/30 hover:bg-white/[0.02] transition-all duration-500 group shadow-lg relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="flex items-start gap-4 mb-6 relative z-10">
                  <div className="w-12 h-12 rounded-[16px] bg-white/5 border border-white/5 flex items-center justify-center flex-shrink-0 group-hover:border-brand-gold/30 transition-colors">
                    <ShieldCheck className="w-5 h-5 text-brand-gold/50 group-hover:text-brand-gold transition-colors" />
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="text-sm font-bold text-white truncate tracking-wide">{b.origin.split(',')[0]} → {b.destination.split(',')[0]}</p>
                    <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-black mt-2">{formatDate(b.pickupDate)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-5 border-t border-white/5 relative z-10">
                  <span className="text-lg font-light text-white tracking-wide">{formatCurrency(b.totalPrice)}</span>
                  <span className="text-[8px] font-black text-brand-gold uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg bg-brand-gold/10 border border-brand-gold/20 shadow-inner">Concluído</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
