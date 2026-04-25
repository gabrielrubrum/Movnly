"use client";

import React, { useState, useEffect } from "react";
import { Plane, Navigation, Clock, Search, RefreshCw, AlertCircle, ShieldCheck, ArrowRight, MapPin, Globe, Wind } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

interface Flight {
    id: string;
    airline: string;
    from: string;
    terminal: string;
    status: "ON_TIME" | "DELAYED" | "LANDED" | "APPROACHING";
    sta: string; // Scheduled Time of Arrival
    eta: string; // Estimated Time of Arrival
    gate: string;
    belt: string;
}

const STATUS_MAP = {
    ON_TIME: { label: "A Horas", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    DELAYED: { label: "Atrasado", color: "text-amber-500", bg: "bg-amber-500/10" },
    LANDED: { label: "Aterrou", color: "text-brand-gold", bg: "bg-brand-gold/10" },
    APPROACHING: { label: "Em Aproximação", color: "text-blue-400", bg: "bg-blue-400/10" },
};

export default function FlightRadarPage() {
    const { token } = useAuthStore();
    const [flights, setFlights] = useState<(Flight & { hasBooking?: boolean })[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastSync, setLastSync] = useState(new Date());

    const fetchFlights = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/flights`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setFlights(data);
            setLastSync(new Date());
        } catch (error) {
            console.error("Failed to sync radar:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchFlights();
            const interval = setInterval(fetchFlights, 60000);
            return () => clearInterval(interval);
        }
    }, [token]);

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-brand-gold mb-2 font-black uppercase text-[0.6rem] tracking-[0.4em]">
                        <Globe className="w-3.5 h-3.5 animate-pulse" />
                        LIS Terminal Intelligence
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase font-sans">Flight Radar LIS</h1>
                    <p className="text-white/40 text-sm mt-1 font-light italic">Monitorização prioritária de chegadas e coordenação de Chauffeurs.</p>
                </div>

                <div className="flex items-center gap-4 bg-white/[0.02] p-2 rounded-2xl border border-white/5 shadow-inner">
                    <div className="px-4 py-2 flex flex-col items-end border-r border-white/5">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Atmosfera LIS</span>
                        <span className="text-xs font-bold text-white flex items-center gap-2 font-mono">
                            <Wind className="w-3 h-3 text-brand-gold" /> 14KT NW
                        </span>
                    </div>
                    <div className="px-4 py-2 flex flex-col items-end">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Sincronização Ativa</span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-2 font-mono">
                            <RefreshCw className="w-3 h-3 animate-spin" /> {lastSync.toLocaleTimeString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FlightSummaryCard label="Chegadas Monitorizadas" value={flights.length} icon={Navigation} color="text-brand-gold" />
                <FlightSummaryCard label="Atrasos em Rota" value={flights.filter(f => f.status === 'DELAYED').length} icon={AlertCircle} color="text-amber-500" />
                <FlightSummaryCard label="Pickups NexRice" value={flights.filter(f => f.hasBooking).length} icon={ShieldCheck} color="text-emerald-500" />
                <FlightSummaryCard label="Tempo Médio Eficiência" value="9m" icon={Clock} color="text-white/60" />
            </div>

            <div className="bg-white/[0.01] border border-white/[0.05] rounded-[3rem] overflow-hidden shadow-luxury backdrop-blur-3xl">
                <div className="p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex flex-col">
                        <h3 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em]">Painel de Inteligência NexRice</h3>
                        <p className="text-[9px] text-white/20 font-bold uppercase mt-1 tracking-tighter">Conexão direta com a infraestrutura de dados LIS</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase font-black tracking-widest">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" /> Live Feed Autêntico
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[0.6rem] uppercase tracking-[0.3em] font-black text-white/20 bg-white/[0.01]">
                                <th className="px-10 py-6">Voo / Companhia</th>
                                <th className="px-10 py-6">Origem</th>
                                <th className="px-10 py-6">ETA (Estreito)</th>
                                <th className="px-10 py-6 text-center">Status</th>
                                <th className="px-10 py-6">Term / Porta</th>
                                <th className="px-10 py-6 text-right pr-12">Prioridade Chauffeur</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-10 py-10 bg-white/[0.01]" />
                                    </tr>
                                ))
                            ) : flights.map((f) => {
                                const status = STATUS_MAP[f.status];
                                return (
                                    <tr key={f.id} className={cn("hover:bg-brand-gold/[0.02] transition-all group", 
                                        f.hasBooking && "bg-brand-gold/[0.03]"
                                    )}>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className={cn("w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 transition-all duration-700 shadow-glow",
                                                    f.hasBooking ? "text-brand-gold border-brand-gold/30 bg-brand-gold/5" : "group-hover:scale-110 group-hover:border-brand-gold group-hover:text-brand-gold"
                                                )}>
                                                    <Plane className="w-6 h-6 rotate-45" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-black text-white italic tracking-tighter">{f.id}</p>
                                                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{f.airline}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-3 h-3 rounded-full border", f.hasBooking ? "border-brand-gold bg-brand-gold/20 animate-ping" : "border-brand-gold/30")} />
                                                <span className="text-sm font-bold text-white/80">{f.from}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-white font-mono">{f.eta}</span>
                                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Sch: {f.sta}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-center">
                                            <div className={cn("inline-flex items-center gap-3 px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5 shadow-inner", status.bg, status.color)}>
                                                <div className={cn("w-1.5 h-1.5 rounded-full", status.color.replace('text', 'bg'))} />
                                                {status.label}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-black text-white/60 bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">{f.terminal}</span>
                                                <div className="w-1 h-3 bg-white/10 rounded-full" />
                                                <span className="text-xs font-black text-brand-gold">{f.gate || "--"}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right pr-12">
                                            {f.hasBooking ? (
                                                <div className="inline-flex flex-col items-end">
                                                    <span className="text-[0.6rem] font-black text-brand-gold uppercase tracking-tighter mb-1">Chauffeur Atribuído</span>
                                                    <div className="flex items-center gap-2 bg-brand-gold/10 px-3 py-1 rounded-lg border border-brand-gold/20 text-brand-gold">
                                                        <ShieldCheck className="w-3.5 h-3.5" />
                                                        <span className="text-[10px] font-black font-mono uppercase italic">Priority One</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white/20 flex items-center justify-center hover:bg-white/10 hover:text-white hover:scale-110 transition-all group/btn">
                                                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function FlightSummaryCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
    return (
        <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] group hover:border-brand-gold/20 transition-all shadow-luxury relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/20 group-hover:text-brand-gold transition-all duration-700">
                    <Icon className="w-5 h-5" />
                </div>
                <div className="text-4xl font-black italic tracking-tighter text-white group-hover:text-brand-gold transition-colors">{value}</div>
            </div>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">{label}</p>
        </div>
    );
}
