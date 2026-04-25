"use client";

import { useBookings } from "@/hooks/useBookings";
import { BookingCard } from "@/components/booking/BookingCard";
import { Loader2, Clock, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function HistoryPage() {
  const { completed, loading } = useBookings();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 animate-pulse">Recuperando Arquivos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-luxury-reveal">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-gold mb-4 block">Arquivo de Viagens</span>
          <h1 className="text-6xl font-extralight text-white italic tracking-tighter leading-none">
            Histórico <span className="not-italic font-light text-brand-gold ml-3">Completo</span>
          </h1>
          <p className="text-white/30 text-lg font-light italic mt-6">Consulte as suas experiências passadas e faturas liquidadas.</p>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-8">
        {completed.length === 0 ? (
          <div className="p-20 rounded-[48px] bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-center py-32 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <Clock className="w-16 h-16 text-white/5 mb-8 group-hover:scale-110 group-hover:text-brand-gold/20 transition-all duration-700" />
            <h3 className="text-3xl font-light text-white/30 italic">Ainda sem histórico</h3>
            <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.5em] mt-4 max-w-md mx-auto">
              As suas viagens concluídas aparecerão aqui para consulta de detalhes e faturas.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 max-w-5xl">
            {completed.map((booking) => (
              <div key={booking.id} className="p-8 rounded-[40px] bg-[#0C0C11] border border-white/5 hover:border-white/20 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-white/20 group-hover:text-brand-gold transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-xl font-light text-white tracking-tight uppercase leading-tight">
                      {booking.origin.split(',')[0]} <span className="text-brand-gold not-italic font-sans text-xs mx-3">→</span> {booking.destination.split(',')[0]}
                    </h4>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">
                      {formatDate(booking.pickupDate)} · {booking.category.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-3 relative z-10">
                  <span className="text-3xl font-light text-white tracking-tighter">
                    {formatCurrency(booking.totalPrice)}
                  </span>
                  <Link href={`/dashboard/bookings/${booking.id}`} className="text-[9px] font-black text-brand-gold uppercase tracking-widest border border-brand-gold/20 px-5 py-2 rounded-full hover:bg-brand-gold hover:text-black transition-all">
                    Ver Detalhes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
