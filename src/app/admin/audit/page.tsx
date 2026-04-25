"use client";

import React, { useEffect, useState } from "react";
import { Shield, User, Database, Search, Clock, Zap, AlertTriangle, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

interface AuditLog {
    id: string;
    action: string;
    resource: string;
    metadata: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    user?: {
        name: string;
        email: string;
    };
}

export default function AuditLogPage() {
    const { token } = useAuthStore();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchLogs = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/audit`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setLogs(data);
        } catch (error) {
            console.error("Failed to fetch logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchLogs();
    }, [token]);

    const getSeverity = (action: string) => {
        if (action.includes('FAILED') || action.includes('ERROR') || action.includes('DELETE')) return 'warning';
        if (action.includes('SUCCESS') || action.includes('REGISTER')) return 'success';
        return 'info';
    };

    const filtered = logs.filter((l: AuditLog) => 
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.user?.name.toLowerCase().includes(search.toLowerCase()) ||
        l.ipAddress.includes(search)
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-brand-gold mb-2 font-black uppercase text-[0.6rem] tracking-[0.2em]">
                        <Shield className="w-3.5 h-3.5" />
                        Protocolo de Segurança Armor v2
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase font-sans">Cofre de Auditoria</h1>
                    <p className="text-white/40 text-sm mt-1 font-light italic">Monitorização em tempo real de eventos críticos e ações administrativas.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        <input 
                            type="text" 
                            placeholder="Rastrear evento..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white/[0.03] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 transition-all w-64 font-mono" 
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard label="Eventos Totais" value={logs.length} icon={Database} color="text-white/40" />
                <StatCard label="Status do Sistema" value="Protegido" icon={ShieldCheck} color="text-emerald-500" />
                <StatCard label="Última Atividade" value={logs[0] ? new Date(logs[0].createdAt).toLocaleTimeString() : '--:--'} icon={Clock} color="text-brand-gold" />
            </div>

            <div className="bg-white/[0.01] border border-white/[0.05] rounded-[3rem] overflow-hidden shadow-luxury backdrop-blur-3xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/[0.03] text-[0.6rem] uppercase tracking-widest font-black text-white/20 bg-white/[0.02]">
                            <th className="px-10 py-6">Timestamp</th>
                            <th className="px-10 py-6">Agente</th>
                            <th className="px-10 py-6">Ação / Evento</th>
                            <th className="px-10 py-6">Origem IP</th>
                            <th className="px-10 py-6 text-right pr-12">Nível</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.03]">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i: number) => (
                                <tr key={i} className="animate-pulse">
                                    <td colSpan={5} className="px-10 py-10 bg-white/[0.01]" />
                                </tr>
                            ))
                        ) : filtered.map((log: AuditLog) => {
                            const sev = getSeverity(log.action);
                            return (
                                <tr key={log.id} className="hover:bg-white/[0.02] transition-all group">
                                    <td className="px-10 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-[11px] font-bold text-white/60 font-mono">
                                                {new Date(log.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-[9px] font-black text-white/20 uppercase tracking-tighter">
                                                {new Date(log.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/20 font-black text-[10px] group-hover:text-brand-gold group-hover:border-brand-gold/20 transition-all">
                                                {log.user ? <User className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white/80">{log.user?.name || "Sistema"}</p>
                                                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{log.user?.email || "Protocolo Automático"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-1.5 rounded-lg", 
                                                sev === 'warning' ? 'bg-red-500/10 text-red-400' :
                                                sev === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-gold/10 text-brand-gold'
                                            )}>
                                                {sev === 'warning' ? <AlertTriangle className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-white tracking-tight uppercase">{log.action}</span>
                                                <span className="text-[9px] text-white/20 font-mono italic truncate max-w-xs">{log.resource}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className="text-[11px] font-bold text-white/30 font-mono bg-white/5 px-3 py-1 rounded-lg border border-white/5">{log.ipAddress}</span>
                                    </td>
                                    <td className="px-10 py-6 text-right pr-12">
                                        <div className={cn("inline-flex w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]",
                                            sev === 'warning' ? 'bg-red-500 text-red-500' :
                                            sev === 'success' ? 'bg-emerald-500 text-emerald-500' : 'bg-brand-gold text-brand-gold'
                                        )} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
}

function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
    return (
        <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] flex items-center justify-between group hover:border-brand-gold/20 transition-all shadow-2xl">
            <div>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">{label}</p>
                <p className={cn("text-3xl font-black italic tracking-tighter", color)}>{value}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/20 group-hover:scale-110 group-hover:text-brand-gold transition-all duration-700">
                <Icon className="w-6 h-6" />
            </div>
        </div>
    );
}
