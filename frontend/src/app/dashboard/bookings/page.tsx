"use client";

import { useBookings } from "@/hooks/useBookings";
import { BookingCard } from "@/components/booking/BookingCard";
import { Loader2, Calendar, MapPin, Plus, Compass } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function BookingsPage() {
  const { upcoming, loading } = useBookings();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold animate-pulse">Carregando</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-luxury-reveal pb-10">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex flex-col relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold mb-3 flex items-center gap-2">
            <Compass className="w-3 h-3" /> Gestão de Viagens
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
            Próximas <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-[#a6862c]">Viagens</span>
          </h1>
          <p className="text-white/40 text-sm font-light italic mt-4 tracking-wide">
            Acompanhe as suas viagens agendadas.
          </p>
        </div>
        <Link 
            href="/book" 
            className="h-14 px-8 bg-[#07070A] border border-brand-gold/30 text-brand-gold text-[11px] font-black uppercase tracking-[0.2em] rounded-[20px] hover:bg-gradient-to-r hover:from-brand-gold hover:to-[#a6862c] hover:text-black transition-all flex items-center justify-center gap-3 group relative z-10 shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" /> Agendar Nova
        </Link>
      </div>

      {/* Bookings List */}
      <div className="space-y-8">
        {upcoming.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-16 md:p-24 rounded-[48px] bg-[#07070A] border border-white/5 flex flex-col items-center justify-center text-center group relative overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center mb-8 relative z-10 group-hover:border-brand-gold/20 transition-colors duration-700">
                <div className="absolute inset-0 bg-brand-gold/5 blur-2xl rounded-full group-hover:bg-brand-gold/10 transition-colors" />
                <Calendar className="w-12 h-12 text-white/20 group-hover:text-brand-gold transition-colors duration-700" />
            </div>
            
            <h3 className="text-2xl font-light text-white tracking-wide relative z-10">Agenda Livre</h3>
            <p className="text-[10px] font-light text-white/40 tracking-widest mt-4 max-w-md mx-auto relative z-10 uppercase leading-relaxed">
              Você não possui nenhum trajeto agendado. Desfrute da cidade solicitando seu motorista particular.
            </p>
            
            <Link 
                href="/book" 
                className="mt-10 px-10 py-4 bg-gradient-to-br from-brand-gold to-[#a6862c] text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-[20px] hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_-10px_rgba(212,175,55,0.4)] relative z-10"
            >
              Solicitar Viagem
            </Link>
          </motion.div>
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
