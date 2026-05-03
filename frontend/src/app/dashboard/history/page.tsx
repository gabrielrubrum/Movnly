"use client";

import { useBookings } from "@/hooks/useBookings";
import { Loader2, Clock, MapPin, Archive, ChevronRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";

export default function HistoryPage() {
  const { completed, loading } = useBookings();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-2 border-brand-gold border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold animate-pulse">Carregando Histórico</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-luxury-reveal pb-10">
      
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10 relative">
        <div className="absolute top-0 left-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex flex-col relative z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold mb-3 flex items-center gap-2">
            <Archive className="w-3 h-3" /> Registro de Viagens
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
            Viagens <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-[#a6862c]">Concluídas</span>
          </h1>
          <p className="text-white/40 text-sm font-light italic mt-4 tracking-wide">
            Lista das suas viagens realizadas com a NexRice.
          </p>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-8">
        {completed.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-16 md:p-24 rounded-[48px] bg-[#07070A] border border-white/5 flex flex-col items-center justify-center text-center group relative overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
            <div className="absolute inset-0 bg-gradient-to-b from-brand-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center mb-8 relative z-10 group-hover:border-brand-gold/20 transition-colors duration-700">
                <div className="absolute inset-0 bg-brand-gold/5 blur-2xl rounded-full group-hover:bg-brand-gold/10 transition-colors" />
                <Clock className="w-12 h-12 text-white/20 group-hover:text-brand-gold transition-colors duration-700" />
            </div>
            
            <h3 className="text-2xl font-light text-white tracking-wide relative z-10">Histórico Vazio</h3>
            <p className="text-[10px] font-light text-white/40 tracking-widest mt-4 max-w-md mx-auto relative z-10 uppercase leading-relaxed">
              As suas viagens concluídas aparecerão aqui para consulta de detalhes e emissão de faturas.
            </p>
          </motion.div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="hidden md:block absolute left-10 top-10 bottom-10 w-px bg-gradient-to-b from-brand-gold/50 via-white/10 to-transparent pointer-events-none" />
            
            <div className="grid grid-cols-1 gap-8 max-w-5xl">
              {completed.map((booking, index) => (
                <motion.div 
                    key={booking.id} 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex flex-col md:flex-row gap-6 md:gap-12 group"
                >
                  {/* Timeline Dot */}
                  <div className="hidden md:flex flex-col items-center pt-8">
                      <div className="w-5 h-5 rounded-full bg-[#07070A] border-2 border-brand-gold relative z-10 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                          <div className="w-1 h-1 bg-brand-gold rounded-full" />
                      </div>
                  </div>

                  <div className="flex-1 p-8 rounded-[32px] bg-[#07070A] border border-white/5 hover:border-brand-gold/30 hover:bg-white/[0.02] transition-all duration-500 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-gold/5 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10 text-left">
                      <div className="w-16 h-16 rounded-[20px] bg-white/[0.03] border border-white/5 flex items-center justify-center shrink-0 group-hover:border-brand-gold/20 transition-colors shadow-inner">
                        <ShieldCheck className="w-6 h-6 text-brand-gold/50 group-hover:text-brand-gold transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-lg font-bold text-white tracking-wide leading-tight truncate max-w-sm">
                          {booking.origin.split(',')[0]} <span className="text-white/30 font-light mx-2">→</span> {booking.destination.split(',')[0]}
                        </h4>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
                          <Clock className="w-3 h-3 text-brand-gold/50" />
                          {formatDate(booking.pickupDate)} · {booking.category.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 relative z-10 w-full lg:w-auto border-t border-white/5 lg:border-t-0 pt-6 lg:pt-0">
                      <div className="flex flex-col items-start lg:items-end">
                        <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] mb-1">Gasto Total</span>
                        <span className="text-2xl font-light text-white tracking-wide">
                          {formatCurrency(booking.totalPrice)}
                        </span>
                      </div>
                      <Link 
                        href={`/dashboard/bookings/${booking.id}`} 
                        className="flex items-center gap-2 text-[9px] font-black text-white/40 uppercase tracking-[0.2em] hover:text-brand-gold transition-colors group/btn"
                      >
                        Ver Detalhes
                        <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center group-hover/btn:border-brand-gold/50 transition-colors">
                            <ChevronRight className="w-3 h-3" />
                        </div>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
