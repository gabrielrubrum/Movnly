"use client";

import { motion } from "framer-motion";
import {
    Navigation, MapPin, Compass,
    Navigation2, ShieldCheck, Map
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookings } from "@/hooks/useBookings";

export default function NavegacaoPage() {
    const { bookings } = useBookings();
    
    // Auto-detect the currently active mission for this driver
    const NEXT_TRIP = bookings?.find(b => 
        ["confirmed", "on_route", "arrived", "in_progress"].includes(b.status?.toLowerCase() || "") && !!b.driver
    );

    const destinationAddress = NEXT_TRIP?.destination?.split(',')[0] || "Sem rota ativa";
    const originAddress = NEXT_TRIP?.origin?.split(',')[0] || "";

    return (
        <main className="py-16 lg:py-20 px-6 lg:px-12 max-w-6xl mx-auto space-y-16">

            {/* Header Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-white/40" />
                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.3em]">Navegação Integrada</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <h1 className="text-white text-6xl font-bold tracking-tight leading-none">
                            Interface de <span className="text-brand-gold not-italic font-light">Navegação</span>
                        </h1>
                        <p className="text-white/30 text-lg font-light max-w-md">
                            Controlo de rota em tempo real e visualização de trajetos otimizados.
                        </p>
                    </div>

                    <button className="px-8 py-4 bg-brand-gold border border-brand-gold text-black text-[10px] font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-[0_20px_50px_-15px_rgba(212,175,55,0.3)] flex items-center gap-4">
                        <Navigation2 className="w-5 h-5 fill-current" /> Iniciar Rota
                    </button>
                </div>
            </div>

            {/* Map Placeholder Area */}
            <div className="relative aspect-[16/9] w-full rounded-[48px] overflow-hidden bg-white/[0.02] border border-white/5 group shadow-2xl">
                {/* Simulated Map UI */}
                <div
                    className="absolute inset-0 opacity-20 bg-cover bg-center grayscale invert"
                    style={{
                        backgroundImage: "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.06) 0%, transparent 50%), linear-gradient(135deg, #0a0a12 0%, #12121a 50%, #0a0a12 100%)",
                    }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#08080f] via-transparent to-transparent opacity-80" />

                {/* Navigation HUD */}
                <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row items-end justify-between gap-8">
                    <div className="p-8 rounded-[32px] bg-[#0c0c14]/90 border border-white/10 backdrop-blur-xl flex items-center gap-8 shadow-2xl">
                        <div className="w-16 h-16 rounded-2xl bg-brand-gold flex items-center justify-center text-black">
                            <Navigation className="w-8 h-8 rotate-45" />
                        </div>
                        <div className="space-y-1">
                            <div className="text-[9px] font-black text-brand-gold uppercase tracking-[0.4em]">Próximo Ponto</div>
                            <div className="text-2xl font-light text-white italic tracking-tight">
                                {NEXT_TRIP 
                                    ? (NEXT_TRIP.status.toLowerCase() === 'confirmed' || NEXT_TRIP.status.toLowerCase() === 'on_route' 
                                        ? originAddress 
                                        : destinationAddress) 
                                    : "Aguardando Missão"}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="p-8 rounded-[32px] bg-[#0c0c14]/90 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center gap-2 min-w-[120px]">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{NEXT_TRIP ? "Recolha" : "Tempo"}</span>
                            <span className="text-2xl font-light text-brand-gold italic whitespace-nowrap">{NEXT_TRIP ? NEXT_TRIP.pickupTime : "--:--"}</span>
                        </div>
                        <div className="p-8 rounded-[32px] bg-[#0c0c14]/90 border border-white/10 backdrop-blur-xl flex flex-col items-center justify-center gap-2 min-w-[120px]">
                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Veículo</span>
                            <span className="text-xl font-light text-brand-gold italic uppercase">{NEXT_TRIP ? NEXT_TRIP.category : "---"}</span>
                        </div>
                    </div>
                </div>

                <div className="absolute top-12 right-12 flex flex-col gap-4">
                    <button className="w-14 h-14 rounded-2xl bg-[#0c0c14]/90 border border-white/10 backdrop-blur-xl flex items-center justify-center text-white/40 hover:text-brand-gold transition-colors shadow-2xl">
                        <Compass className="w-6 h-6" />
                    </button>
                    <button className="w-14 h-14 rounded-2xl bg-[#0c0c14]/90 border border-white/10 backdrop-blur-xl flex items-center justify-center text-white/40 hover:text-brand-gold transition-colors shadow-2xl">
                        <Map className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Quick Destinations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Aeroporto", sub: "Terminal 1", dist: "14 km" },
                    { label: "Centro", sub: "Baixa de Lisboa", dist: "2 km" },
                    { label: "Belém", sub: "Mosteiro dos Jerónimos", dist: "8 km" }
                ].map((dest, idx) => (
                    <motion.button
                        key={dest.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (idx * 0.1) }}
                        className="p-8 rounded-[32px] bg-white/[0.01] border border-white/5 hover:bg-white/[0.03] hover:border-brand-gold/20 transition-all flex items-center justify-between group text-left"
                    >
                        <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-brand-gold transition-colors">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">{dest.sub}</div>
                                <div className="text-lg font-light text-white italic tracking-tight">{dest.label}</div>
                            </div>
                        </div>
                        <span className="text-[9px] font-black text-brand-gold/40 group-hover:text-brand-gold transition-colors">{dest.dist}</span>
                    </motion.button>
                ))}
            </div>

        </main>
    );
}
