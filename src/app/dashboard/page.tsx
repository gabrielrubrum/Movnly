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
    socket.on("booking_update", () => { refresh(); toast.info("Reserva atualizada"); });
    socket.on("payment_update", () => { refresh(); toast.success("Pagamento confirmado"); });
    return () => { socket.off("booking_update"); socket.off("payment_update"); };
  }, [socket, refresh]);

  if (!mounted || loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
    </div>
  );

  const activeTrip = live[0];
  const nextTrip = upcoming[0];
  const totalSpent = bookings.reduce((s, b) => s + b.totalPrice, 0);

  return (
    <div className="space-y-8 animate-luxury-reveal">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.4em] block mb-3">Painel do Cliente</span>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-none">
            Olá, <span className="text-brand-gold">{user?.name?.split(" ")[0]}</span>
          </h1>
          <p className="text-white/30 text-sm font-light italic mt-2">Que bom tê-lo de volta.</p>
        </div>
        <Link
          href="/reservar"
          className="inline-flex items-center gap-3 h-14 px-8 bg-brand-gold text-black text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-[0_20px_40px_-10px_rgba(212,175,55,0.4)] group relative overflow-hidden flex-shrink-0"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <Plus className="w-4 h-4" /> Nova Reserva
        </Link>
      </div>

      {/* ── Viagem Ativa ───────────────────────────────────────── */}
      {activeTrip && <MissionHUD booking={activeTrip} />}

      {/* ── Stats ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Viagens", value: String(completed.length), icon: Car, color: "gold" },
          { label: "Total Gasto", value: formatCurrency(totalSpent), icon: TrendingUp, color: "white" },
          { label: "Qualidade", value: "100%", icon: ShieldCheck, color: "gold" },
        ].map(({ label, value, icon: Icon, color }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 sm:p-6 rounded-3xl bg-[#0C0C11] border border-white/5 hover:border-brand-gold/20 transition-all group"
          >
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center mb-4",
              color === "gold" ? "bg-brand-gold/10 text-brand-gold" : "bg-white/5 text-white/30 group-hover:bg-white group-hover:text-black"
            )}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-light text-white tracking-tight">{value}</p>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Grid Principal ─────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Próxima viagem */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#0A0A0F] border border-white/5">
          <h3 className="text-[9px] font-black text-brand-gold uppercase tracking-widest mb-6 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" /> Próxima Viagem
          </h3>
          {nextTrip ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Clock className="w-4 h-4 text-brand-gold" />
                {nextTrip.pickupDate} · {nextTrip.pickupTime}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-gold flex-shrink-0" />
                  <p className="text-sm text-white font-medium truncate">{nextTrip.origin.split(',')[0]}</p>
                </div>
                <div className="ml-[3px] w-px h-4 bg-white/10" />
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white flex-shrink-0" />
                  <p className="text-sm text-white font-medium truncate">{nextTrip.destination.split(',')[0]}</p>
                </div>
              </div>
              <Link
                href={`/dashboard/bookings/${nextTrip.id}`}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-brand-gold/30 hover:bg-brand-gold/5 transition-all group"
              >
                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest group-hover:text-brand-gold transition-colors">Ver Detalhes</span>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-brand-gold transition-colors" />
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="w-10 h-10 text-white/5 mb-4" />
              <p className="text-white/20 font-light italic">Sem viagens agendadas</p>
              <Link href="/reservar" className="mt-4 text-[9px] font-black text-brand-gold uppercase tracking-widest hover:underline">
                Reservar agora →
              </Link>
            </div>
          )}
        </div>

        {/* Ações rápidas */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          {[
            { label: "Nova Reserva", icon: Plus, href: "/reservar", gold: true },
            { label: "Faturas", icon: CreditCard, href: "/dashboard/payment", gold: false },
            { label: "Suporte", icon: Bell, href: "/contact", gold: false },
            { label: "Histórico", icon: Clock, href: "/dashboard/history", gold: false },
          ].map(({ label, icon: Icon, href, gold }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                "p-5 rounded-2xl border flex items-center gap-4 transition-all duration-300 group relative overflow-hidden",
                gold
                  ? "bg-brand-gold/10 border-brand-gold/20 hover:bg-brand-gold hover:border-brand-gold hover:shadow-[0_8px_24px_-8px_rgba(212,175,55,0.5)]"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/15"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0",
                gold
                  ? "bg-brand-gold/20 text-brand-gold group-hover:bg-black/10 group-hover:text-black group-hover:rotate-12"
                  : "bg-white/5 text-white/30 group-hover:bg-brand-gold/10 group-hover:text-brand-gold group-hover:scale-110"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-colors duration-300",
                gold ? "text-brand-gold group-hover:text-black" : "text-white/30 group-hover:text-white"
              )}>{label}</span>
              <ChevronRight className={cn(
                "w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0",
                gold ? "text-black" : "text-brand-gold"
              )} />
            </Link>
          ))}
        </div>

      </div>

      {/* ── Histórico Recente ──────────────────────────────────── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-light text-white italic uppercase tracking-tight">Histórico Recente</h2>
          <Link href="/dashboard/history" className="text-[9px] font-black text-white/20 hover:text-brand-gold uppercase tracking-widest transition-all flex items-center gap-1">
            Ver Tudo <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {completed.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white/[0.01] border border-dashed border-white/5 text-center">
            <p className="text-[9px] font-black text-white/10 uppercase tracking-widest">Nenhuma viagem concluída</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completed.slice(0, 3).map((b, i) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-3xl bg-[#0C0C11] border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.02] flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-4 h-4 text-white/20 group-hover:text-brand-gold transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">{b.origin.split(',')[0]} → {b.destination.split(',')[0]}</p>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-black mt-1">{formatDate(b.pickupDate)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-lg font-light text-white italic">{formatCurrency(b.totalPrice)}</span>
                  <span className="text-[8px] font-black text-brand-gold uppercase tracking-widest px-2 py-1 rounded-full bg-brand-gold/5 border border-brand-gold/10">Concluído</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
