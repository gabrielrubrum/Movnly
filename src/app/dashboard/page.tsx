"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useBookings } from "@/hooks/useBookings";
import { useAuthStore } from "@/lib/auth-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BookingCard } from "@/components/booking/BookingCard";
import { useI18n } from "@/i18n/context";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import {
  Calendar, TrendingUp, Star, Clock, Plus, ArrowRight,
  Car, Loader2, Bell, CreditCard, ShieldCheck, ChevronRight,
  Activity, MapPin, Search, Navigation
} from "lucide-react";
import { motion } from "framer-motion";
import { MissionHUD } from "@/components/dashboard/MissionHUD";

export default function DashboardPage() {
  const { bookings, upcoming, completed, live, loading, refresh } = useBookings();
  const user = useAuthStore(s => s.user);
  const { socket } = useSocket();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Atualizações em Tempo Real
  useEffect(() => {
    if (!socket) return;

    socket.on("booking_update", (data) => {
      refresh();
      toast.info(`Atualização de Viagem`, {
        description: `O estado da sua reserva foi alterado para: ${data.status.replace('_', ' ')}.`,
        icon: <Activity className="w-4 h-4 text-brand-gold" />,
      });
    });

    socket.on("payment_update", (data) => {
      refresh();
      toast.success("Pagamento Confirmado", {
        description: "Obrigado por escolher a NexRice. O seu pagamento foi processado.",
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      });
    });

    return () => {
      socket.off("booking_update");
      socket.off("payment_update");
    };
  }, [socket, refresh]);

  if (!mounted || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
      </div>
    );
  }

  const activeTrip = live[0];
  const nextTrip = upcoming[0];
  const totalSpent = bookings.reduce((s, b) => s + b.totalPrice, 0);

  const averageRating = completed.length > 0 
    ? (completed.reduce((acc, b) => acc + (b.rating || 5), 0) / completed.length).toFixed(1)
    : "5.0";

  const STATS = [
    { label: "Viagens Concluídas", value: String(completed.length), icon: Car, color: "gold" },
    { label: "Total Investido", value: formatCurrency(totalSpent), icon: TrendingUp, color: "white" },
    { label: "Qualidade do Serviço", value: `${(Number(averageRating) * 20).toFixed(1)}%`, icon: ShieldCheck, color: "gold" },
  ];

  return (
    <div className="space-y-10 animate-luxury-reveal">
      
      {/* Header & Welcome */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-gold mb-4 block">Painel do Cliente</span>
          <h1 className="text-6xl font-extralight text-white italic tracking-tighter leading-none">
            Olá, <span className="not-italic font-light text-brand-gold">{user?.name?.split(" ")[0]}</span>
          </h1>
          <div className="flex items-center gap-4 mt-4">
             <p className="text-white/30 text-lg font-light italic">Que bom tê-lo de volta.</p>
          </div>
        </div>
        <Link href="/book" className="h-20 px-12 bg-brand-gold text-black text-[12px] font-black uppercase tracking-[0.4em] rounded-[24px] hover:bg-white transition-all shadow-[0_25px_60px_-15px_rgba(212,175,55,0.5)] flex items-center justify-center gap-5 group relative overflow-hidden">
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          <Plus className="w-5 h-5 flex-shrink-0" /> Realizar Reserva
        </Link>
      </div>

      {/* Atividade Recente */}
      {activeTrip && <MissionHUD booking={activeTrip} />}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Operational Feed */}
        <div className="lg:col-span-2 space-y-8">
          {!activeTrip && (
            <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center py-24 group relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
               <MapPin className="w-12 h-12 text-white/5 mb-6 group-hover:scale-110 group-hover:text-brand-gold/20 transition-all duration-700" />
               <h3 className="text-2xl font-light text-white/30 italic">Sem atividades no momento</h3>
               <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em] mt-3">Os nossos motoristas estão prontos para o servir.</p>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {STATS.map(({ label, value, icon: Icon, color }) => (
               <div key={label} className="p-8 rounded-[32px] bg-[#0C0C11] border border-white/5 group hover:border-brand-gold/40 transition-all duration-500">
                  <div className="flex items-center justify-between mb-6">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      color === "gold" ? "bg-brand-gold/10 text-brand-gold" : "bg-white/5 text-white/40 group-hover:bg-white group-hover:text-black"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-light text-white tracking-tight">{value}</p>
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1.5">{label}</p>
               </div>
             ))}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
           
           {/* Next Trip Protocol */}
            <div className="p-10 rounded-[48px] bg-[#0A0A0F] border border-white/5 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
               <h3 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] mb-10 flex items-center gap-4">
                 <Calendar className="w-4 h-4" /> Próxima Viagem
               </h3>
               
               {nextTrip ? (
                 <div className="space-y-8">
                   <div>
                     <p className="text-sm font-bold text-white mb-3 flex items-center gap-3">
                        <Clock className="w-4 h-4 text-brand-gold" /> {nextTrip.pickupDate} · {nextTrip.pickupTime}
                     </p>
                     <div className="space-y-4">
                        <div className="flex items-center gap-4">
                           <div className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                           <p className="text-[11px] text-white uppercase tracking-tight font-medium">{nextTrip.origin.split(',')[0]}</p>
                        </div>
                        <div className="w-[1px] h-4 bg-white/10 ml-[3px]" />
                        <div className="flex items-center gap-4">
                           <div className="w-1.5 h-1.5 rounded-full bg-white" />
                           <p className="text-[11px] text-white uppercase tracking-tight font-medium">{nextTrip.destination.split(',')[0]}</p>
                        </div>
                     </div>
                   </div>
                   <Link href={`/dashboard/bookings/${nextTrip.id}`} className="h-14 w-full bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-white/40 hover:text-brand-gold hover:bg-white/[0.06] transition-all uppercase tracking-widest">
                     Ver Detalhes <ChevronRight className="w-4 h-4" />
                   </Link>
                 </div>
              ) : (
                <div className="text-center py-10">
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Nenhum agendamento pendente</p>
                </div>
              )}
           </div>

           {/* Quick Action Cloud */}
           <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Novo Pedido", icon: Plus, href: "/book" },
                { label: "Faturas", icon: CreditCard, href: "/dashboard/payment" },
                { label: "Suporte", icon: Bell, href: "/contact" },
                { label: "Arquivos", icon: Clock, href: "/dashboard/history" },
              ].map(({ label, icon: Icon, href }) => (
                <Link key={label} href={href} className="p-6 rounded-[28px] bg-white/[0.02] border border-white/5 flex flex-col items-center gap-4 hover:bg-brand-gold hover:border-brand-gold transition-all group">
                   <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-black group-hover:text-brand-gold transition-all">
                      <Icon className="w-5 h-5" />
                   </div>
                   <span className="text-[9px] font-black uppercase tracking-widest text-white/30 group-hover:text-black">{label}</span>
                </Link>
              ))}
           </div>

        </div>

      </div>

      {/* Footer Ledger (Recent Bookings) */}
      <div className="space-y-8 pt-10 border-t border-white/5">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-light text-white italic tracking-tight uppercase">Histórico Recente</h2>
          <Link href="/dashboard/history" className="text-[10px] font-black text-white/20 hover:text-brand-gold uppercase tracking-[0.4em] transition-all">
            Ver Tudo
          </Link>
        </div>

        {completed.length === 0 ? (
          <div className="p-20 bg-white/[0.01] rounded-[48px] border border-dashed border-white/10 text-center">
             <p className="text-[10px] font-black text-white/10 uppercase tracking-widest">Nenhuma viagem finalizada registada no sistema.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completed.slice(0, 3).map((b) => (
              <div key={b.id} className="p-8 rounded-[40px] bg-[#0C0C11] border border-white/5 hover:border-white/20 transition-all group">
                 <div className="flex items-center gap-6 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.02] flex items-center justify-center">
                       <ShieldCheck className="w-5 h-5 text-white/20 group-hover:text-brand-gold transition-colors" />
                    </div>
                    <div>
                       <p className="text-sm font-bold text-white uppercase tracking-tight">{b.origin.split(',')[0]} → {b.destination.split(',')[0]}</p>
                       <p className="text-[9px] text-white/30 uppercase tracking-widest font-black mt-1">{formatDate(b.pickupDate)}</p>
                    </div>
                 </div>
                 <div className="flex items-center justify-between pt-6 border-t border-white/5">
                    <span className="text-xl font-light text-white italic tracking-tight">{formatCurrency(b.totalPrice)}</span>
                    <span className="text-[9px] font-black text-brand-gold uppercase tracking-widest px-3 py-1 rounded-full bg-brand-gold/5 border border-brand-gold/10">Processado</span>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
