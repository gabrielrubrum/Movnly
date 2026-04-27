"use client";

import { useBookings } from "@/hooks/useBookings";
import { BookingCard } from "@/components/booking/BookingCard";
import { Loader2, Calendar, MapPin, Plus } from "lucide-react";
import Link from "next/link";

export default function BookingsPage() {
  const { upcoming, loading } = useBookings();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 animate-pulse">Sincronizando Reservas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-luxury-reveal">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-gold mb-4 block">Gestão de Viagens</span>
          <h1 className="text-6xl font-extralight text-white font-serif italic tracking-tighter leading-none">
            Minhas <span className="not-italic font-light text-brand-gold ml-3">Reservas</span>
          </h1>
          <p className="text-white/30 text-lg font-light italic mt-6">Acompanhe as suas viagens agendadas e em curso.</p>
        </div>
        <Link href="/book" className="h-16 px-10 bg-white/5 border border-white/10 text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-brand-gold hover:text-black transition-all flex items-center justify-center gap-4 group">
          <Plus className="w-4 h-4" /> Nova Reserva
        </Link>
      </div>

      {/* Bookings List */}
      <div className="space-y-8">
        {upcoming.length === 0 ? (
          <div className="p-20 rounded-[48px] bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center py-32 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <Calendar className="w-16 h-16 text-white/5 mb-8 group-hover:scale-110 group-hover:text-brand-gold/20 transition-all duration-700" />
            <h3 className="text-3xl font-light text-white/30 italic">Sem viagens pendentes</h3>
            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em] mt-4 max-w-md mx-auto">
              Ainda não tem nenhuma viagem agendada no sistema. Comece a sua experiência elite agora.
            </p>
            <Link href="/book" className="mt-12 px-12 py-5 bg-brand-gold text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-full hover:bg-white transition-all shadow-[0_20px_50px_-10px_rgba(212,175,55,0.3)]">
              Agendar Primeira Viagem
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 max-w-5xl">
            {upcoming.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
