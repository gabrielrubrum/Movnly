"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useBookings } from "@/hooks/useBookings";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BookingCard } from "@/components/booking/BookingCard";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import {
  Calendar, TrendingUp, Star, Clock, Plus, ArrowRight,
  Car, Loader2, Bell, LayoutDashboard, ChevronRight, Activity, ShieldCheck
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function ClienteDashboard() {
  const { bookings, upcoming, completed, loading, refresh } = useBookings();
  const { socket } = useSocket();

  // Institutional Real-time Nexus
  useEffect(() => {
    if (!socket) return;

    socket.on("booking_update", (data) => {
      console.log("[CLIENTE-SOCKET] Atualização de viagem:", data);
      refresh();
      toast.info(`Aviso: A sua viagem`, {
        description: `O estado da sua reserva foi atualizado para: ${data.status}`,
        icon: <Activity className="w-4 h-4 text-brand-gold" />,
      });
    });

    socket.on("payment_update", (data) => {
      console.log("[CLIENTE-SOCKET] Pagamento confirmado:", data);
      refresh();
      toast.success("Pagamento Confirmado", {
        description: `O pagamento da sua viagem foi processado com sucesso.`,
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
      });
    });

    return () => {
      socket.off("booking_update");
      socket.off("payment_update");
    };
  }, [socket, refresh]);

  const totalSpent = bookings.reduce((s, b) => s + b.totalPrice, 0);
  const avgRating = completed.filter((b) => b.rating).length > 0
    ? completed.filter((b) => b.rating).reduce((s, b) => s + (b.rating || 0), 0) / completed.filter((b) => b.rating).length
    : 0;
  const nextTrip = upcoming[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070A] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
      </div>
    );
  }

  const STATS = [
    { label: "Minhas Viagens", value: String(bookings.length), icon: Car, color: "brand" },
    { label: "Total Gasto", value: formatCurrency(totalSpent), icon: TrendingUp, color: "emerald" },
    { label: "Avaliação Média", value: avgRating ? `${avgRating.toFixed(1)}★` : "—", icon: Star, color: "gold" },
    { label: "Próxima Viagem", value: nextTrip ? nextTrip.pickupDate : "Nenhuma", icon: Clock, color: "white" },
  ];

  return (
    <div className="bg-[#07070A] min-h-screen">
      <Navbar />

      <main className="pt-40 pb-32">
        <div className="nx-container space-y-16 animate-luxury-reveal">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
            <div>
              <span className="badge-editorial mb-4 block w-max">Área do Cliente</span>
              <h1 className="luxury-headline text-white text-5xl tracking-tighter italic">
                Bem-vindo de volta, <span className="text-brand-gold">Passageiro</span>
              </h1>
              <p className="luxury-subheadline text-white/40 mt-4 italic">Acompanhe aqui as suas reservas e histórico de viagens.</p>
            </div>
            <Link href="/book" className="px-10 py-6 bg-brand-gold text-black text-[12px] font-black uppercase tracking-[0.4em] rounded-full hover:bg-white transition-all shadow-luxury-gold flex items-center justify-center gap-4 group">
              <Plus className="w-4 h-4" /> Reservar Viagem
            </Link>
          </div>

          {/* Institutional Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="p-10 rounded-[32px] bg-[#0C0C11] border border-white/5 relative overflow-hidden group hover:border-brand-gold/30 transition-all duration-700 shadow-2xl">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-8 group-hover:bg-brand-gold group-hover:text-black transition-all">
                  <Icon className="w-6 h-6 transition-colors" />
                </div>
                <div className="text-3xl font-normal text-white text-serif italic tracking-tight mb-2">{value}</div>
                <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] font-sans">{label}</div>
              </div>
            ))}
          </div>

          {/* Mission Grids */}
          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12">

            {/* Upcoming Missions */}
            <div className="space-y-10">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-normal text-white text-serif italic tracking-tight">Viagens Ativas</h2>
                <Link href="/dashboard/bookings" className="text-[10px] font-black text-brand-gold hover:text-white uppercase tracking-[0.3em] flex items-center gap-4 transition-all group font-sans">
                  Ver todas <ChevronRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>

              {upcoming.length === 0 ? (
                <div className="p-20 text-center rounded-[48px] bg-[#0C0C11] border border-white/5 shadow-2xl">
                  <Calendar className="w-16 h-16 text-white/5 mx-auto mb-10" />
                  <h3 className="text-3xl font-normal text-white text-serif italic mb-4">Sem Viagens Agendadas</h3>
                  <p className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black font-sans mb-12">Aguardamos o seu próximo pedido de transporte.</p>
                  <Link href="/book" className="px-10 py-6 bg-white/[0.05] border border-white/10 text-white/60 text-[11px] font-black uppercase tracking-[0.4em] rounded-full hover:bg-brand-gold hover:text-black transition-all font-sans">
                    Pedir Viagem Agora
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {upcoming.slice(0, 3).map((b) => (
                    <BookingCard key={b.id} booking={b} />
                  ))}
                </div>
              )}
            </div>

            {/* Historical Intel & Actions */}
            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-normal text-white text-serif italic tracking-tight mb-8 px-4">Ações Rápidas</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Nova Reserva", icon: Calendar, href: "/book" },
                    { label: "Repetir Viagem", icon: Car, href: "/book" },
                    { label: "Pagamentos", icon: LayoutDashboard, href: "/dashboard/payment" },
                    { label: "Suporte Privado", icon: Bell, href: "/contact" },
                  ].map(({ label, icon: Icon, href }) => (
                    <Link key={label} href={href} className="p-8 rounded-[32px] bg-[#0C0C11] border border-white/5 flex flex-col items-center gap-6 text-center hover:border-brand-gold/30 hover:bg-brand-gold/[0.02] transition-all group shadow-xl">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.03] flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-gold group-hover:text-black transition-all">
                        <Icon className="w-7 h-7 transition-colors" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 group-hover:text-white transition-colors font-sans">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Minified Ledger */}
              <div className="pt-8 border-t border-white/5">
                <h2 className="text-2xl font-normal text-white text-serif italic tracking-tight mb-8 px-4">Histórico de Viagens</h2>
                {completed.length === 0 ? (
                  <p className="px-8 py-10 rounded-3xl bg-white/[0.02] text-[11px] font-bold text-white/20 uppercase tracking-[0.3em] font-sans text-center">Ainda não tem viagens concluídas.</p>
                ) : (
                  <div className="space-y-4">
                    {completed.slice(0, 3).map((b) => (
                      <div key={b.id} className="p-6 rounded-3xl bg-[#0C0C11] border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                            <Car className="w-6 h-6 text-white/20" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white uppercase tracking-tight font-sans">{b.origin.split(",")[0]} → {b.destination.split(",")[0]}</p>
                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-black font-sans mt-1">{formatDate(b.pickupDate)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-normal text-white text-serif italic">{formatCurrency(b.totalPrice)}</p>
                          <BookingStatusBadge status={b.status} />
                        </div>
                      </div>
                    ))}
                    <Link href="/dashboard/history" className="flex items-center justify-center gap-4 text-[10px] font-black text-white/20 hover:text-white uppercase tracking-[0.4em] py-8 transition-all group font-sans">
                      Histórico Completo <ArrowRight className="w-4 h-4 group-hover:translate-x-4 transition-transform" />
                    </Link>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
