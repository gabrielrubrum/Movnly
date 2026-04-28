"use client";

import { motion } from "framer-motion";
import {
    Calendar, MapPin, Clock, Users,
    Car, ChevronRight, Navigation,
    Search, Filter, ShieldCheck
} from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { BookingChat } from "@/components/chat/BookingChat";
import { useState } from "react";
import { MessageSquare } from "lucide-react";

export default function ViagensPage() {
    const { live, upcoming, loading } = useBookings();
    const [activeChatId, setActiveChatId] = useState<string | null>(null);

    const allMissions = [...live, ...upcoming].filter(
        (m, index, self) => index === self.findIndex(x => x.id === m.id)
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="py-16 lg:py-20 px-6 lg:px-12 max-w-6xl mx-auto space-y-16">

            {/* Header Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-brand-gold" />
                        <span className="text-[8px] font-bold text-brand-gold uppercase tracking-[0.3em]">Operações em Tempo Real</span>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <h1 className="text-white text-6xl font-bold tracking-tight leading-none">
                            Minhas <span className="text-brand-gold not-italic font-light">Viagens</span>
                        </h1>
                        <p className="text-white/30 text-lg font-light max-w-md">
                            Gestão de atribuições atuais e planeamento das suas próximas vigaens.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="px-6 py-3 bg-white/[0.03] border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/[0.05] transition-all flex items-center gap-3">
                            <Filter className="w-4 h-4" /> Filtrar
                        </button>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-brand-gold transition-colors" />
                            <input
                                type="text"
                                placeholder="PROCURAR VIAGEM..."
                                className="bg-white/[0.03] border border-white/5 rounded-xl py-3 pl-12 pr-6 text-[10px] font-black tracking-widest text-white outline-none focus:border-brand-gold/40 transition-all w-64 uppercase"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid of Missions */}
            <div className="grid gap-6">
                {allMissions.length > 0 ? (
                    allMissions.map((mission, idx) => (
                        <motion.div
                            key={mission.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-brand-gold/30 transition-all relative overflow-hidden backdrop-blur-xl"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                                <Car className="w-32 h-32 text-brand-gold" />
                            </div>

                            <div className="flex flex-col lg:flex-row lg:items-center gap-10">

                                {/* Status & ID */}
                                <div className="lg:w-48 space-y-3">
                                    <div className={cn(
                                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] w-fit",
                                        mission.status === 'driver_en_route' || mission.status === 'driver_arrived' || mission.status === 'in_progress'
                                            ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20"
                                            : "bg-white/5 text-white/40 border border-white/10"
                                    )}>
                                        {mission.status === 'confirmed' || mission.status === 'driver_assigned' ? 'AGENDADO' : 'EM CURSO'}
                                    </div>
                                    <div className="text-xl font-light text-white italic tracking-tight">{mission.reference || `REF-${mission.id.substring(0, 6).toUpperCase()}`}</div>
                                </div>

                                {/* Route */}
                                <div className="flex-1 grid md:grid-cols-2 gap-8 lg:px-10 lg:border-x border-white/5">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Origem</div>
                                        <div className="text-lg font-light text-white italic truncate pr-4">{mission.origin}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Destino</div>
                                        <div className="text-lg font-light text-white italic truncate pr-4">{mission.destination}</div>
                                    </div>
                                </div>

                                {/* Specs & Earnings */}
                                <div className="flex items-center gap-12 lg:pl-10">
                                    <div className="space-y-1 text-center">
                                        <div className="text-xl font-light text-white tracking-tighter italic">{mission.pickupTime || '22:45'}</div>
                                        <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Horário</div>
                                    </div>

                                    <button 
                                        onClick={() => setActiveChatId(mission.id)}
                                        className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold hover:bg-brand-gold hover:text-black transition-all shadow-xl hover:scale-110"
                                    >
                                        <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
                                    </button>

                                    <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-brand-gold group-hover:text-black group-hover:border-brand-gold transition-all duration-500 shadow-xl group-hover:scale-110">
                                        <Navigation className="w-5 h-5" strokeWidth={1.5} />
                                    </button>
                                </div>

                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="py-32 text-center rounded-[48px] bg-white/[0.01] border border-white/5">
                        <Calendar className="w-16 h-16 text-white/5 mx-auto mb-8" />
                        <h3 className="text-3xl font-light text-white/30 italic mb-3">Sem Viagens Agendadas</h3>
                        <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black">As suas próximas viagens aparecerão aqui.</p>
                    </div>
                )}
            </div>

            {activeChatId && (
                <BookingChat 
                    bookingId={activeChatId} 
                    isOpen={!!activeChatId} 
                    onClose={() => setActiveChatId(null)}
                    title="Conversa com Passageiro"
                />
            )}

        </main>
    );
}
