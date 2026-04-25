"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Car, MapPin, Navigation, Clock, ShieldCheck, 
  Activity, ArrowRight, User, Phone, Zap 
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface MissionHUDProps {
  booking: {
    id: string;
    reference: string;
    status: string;
    origin: string;
    destination: string;
    pickupTime: string;
    category: string;
    driver?: {
      name: string;
      phone: string;
      rating: string | number;
    }
  };
}

const STATUS_CONFIG: Record<string, { label: string; sub: string; icon: any; color: string; progress: number }> = {
  PENDING: { label: "Aguardando Confirmação", sub: "A nossa equipa está a validar a sua reserva.", icon: Zap, color: "text-amber-400", progress: 10 },
  CONFIRMED: { label: "Reserva Confirmada", sub: "A sua reserva está garantida. Motorista em processo de atribuição.", icon: ShieldCheck, color: "text-emerald-400", progress: 25 },
  ON_ROUTE: { label: "Motorista a Caminho", sub: "O seu motorista já se encontra em deslocação para o ponto de recolha.", icon: Navigation, color: "text-brand-gold", progress: 50 },
  IN_PROGRESS: { label: "Viagem em Curso", sub: "Serviço ativo. Tenha uma excelente viagem.", icon: Activity, color: "text-brand-gold", progress: 85 },
};

export function MissionHUD({ booking }: MissionHUDProps) {
  const config = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-[48px] bg-[#07070A] border border-white/5 shadow-2xl p-8 md:p-12 mb-10 group"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-gold/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:items-center">
        
        {/* Left: Tactical Progress Visualization */}
        <div className="lg:w-1/3 flex flex-col items-center justify-center space-y-8 lg:border-r border-white/5 lg:pr-12">
          <div className="relative">
            {/* Pulsing Outer Ring */}
            <div className={cn("absolute inset-[-20px] rounded-full opacity-10 animate-ping", config.color.replace('text', 'bg'))} />
            
            {/* Status Hexagon/Icon */}
            <div className="w-24 h-24 rounded-[32px] bg-white/[0.03] border border-white/10 flex items-center justify-center backdrop-blur-3xl shadow-2xl group-hover:border-brand-gold/50 transition-all duration-700">
              <config.icon className={cn("w-10 h-10", config.color)} />
            </div>
          </div>

          <div className="text-center">
            <h3 className={cn("text-2xl font-black uppercase tracking-tight mb-2 italic", config.color)}>
              {config.label}
            </h3>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-black">{config.sub}</p>
          </div>

          {/* Tactical Progress Bar */}
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${config.progress}%` }}
              transition={{ duration: 1.5, ease: "circOut" }}
              className="h-full bg-brand-gold shadow-[0_0_15px_rgba(212,175,55,0.6)]" 
            />
          </div>
        </div>

        {/* Center: Mission Intel (Routes) */}
        <div className="flex-1 space-y-10 lg:pl-4">
           <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white/20" />
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Ponto de Recolha</p>
                      <p className="text-lg font-light text-white truncate tracking-tight">{booking.origin}</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                      <Navigation className="w-4 h-4 text-brand-gold/60" />
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Destino Final</p>
                      <p className="text-lg font-light text-white truncate tracking-tight">{booking.destination}</p>
                   </div>
                </div>
              </div>

              <div className="flex flex-col justify-center lg:items-end lg:text-right">
                 <div className="inline-flex flex-col lg:items-end">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">ID da Reserva</p>
                    <div className="px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10 font-mono font-bold text-white tracking-widest text-lg shadow-inner">
                      {booking.reference}
                    </div>
                 </div>
              </div>
           </div>

           {/* Driver HUD Panel */}
           <AnimatePresence>
            {booking.driver && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 rounded-[32px] bg-gradient-to-r from-white/[0.03] to-transparent border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-brand-gold flex items-center justify-center text-black shadow-2xl overflow-hidden">
                    <User className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white leading-none mb-1">{booking.driver.name}</h4>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em] italic">Motorista Privado</span>
                      <div className="w-1 h-1 rounded-full bg-white/20" />
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                        <Activity className="w-3 h-3" /> Classificação: {booking.driver.rating || '5.0'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <a 
                    href={`tel:${booking.driver.phone}`}
                    className="flex-1 md:flex-none h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-brand-gold hover:text-black transition-all"
                  >
                    <Phone className="w-4 h-4" /> Contactar
                  </a>
                  <button className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 text-white/40 flex items-center justify-center hover:text-white transition-all">
                    <Activity className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}
           </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
