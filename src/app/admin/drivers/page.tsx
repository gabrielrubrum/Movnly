"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, Shield, Award, MapPin, Search, Loader2, Building2, CreditCard } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";

export default function DriversPage() {
    const { token } = useAuthStore();
    const [search, setSearch] = useState("");
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

    const fetchDrivers = async () => {
        try {
            const response = await axios.get(`${API_URL}/admin/drivers`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDrivers(response.data);
        } catch (error) {
            console.error("Erro ao carregar motoristas:", error);
            toast.error("Erro de Rede", { description: "Não foi possível carregar a lista de elite." });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchDrivers();
    }, [token]);

    const handleUpdateStatus = async (driverId: string, newStatus: string) => {
        try {
            await axios.patch(`${API_URL}/admin/drivers/${driverId}/status`, {
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Status Atualizado", { description: `Motorista definido como ${newStatus}.` });
            fetchDrivers();
        } catch (error) {
            toast.error("Erro ao atualizar");
        }
    };

    const filtered = drivers.filter(d => 
        d.name.toLowerCase().includes(search.toLowerCase()) || 
        d.driverProfile?.vehicle?.model?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="relative px-6 md:px-8 xl:px-12 py-8 max-w-[2000px] mx-auto w-full space-y-10 min-h-screen">
            {/* Ambient Premium Glows */}
            <div className="absolute top-0 right-1/4 w-[800px] h-[400px] bg-brand-gold/10 blur-[120px] rounded-full pointer-events-none -z-10 mix-blend-screen" />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight italic">Equipa de Motoristas</h1>
                    <p className="text-white/40 text-sm mt-1">Gestão da disponibilidade e frota de motoristas em serviço.</p>
                </div>
                <button className="nx-btn nx-btn-primary">Adicionar Motorista</button>
            </div>

            <div className="bg-surface-1/50 border border-white/[0.05] rounded-[2rem] shadow-2xl p-6">
                <div className="flex items-center gap-4 mb-8">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                        <input
                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-gold/50 transition-colors"
                            placeholder="Pesquisar motorista ou veículo..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xlg:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
                            <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Sincronizando Base de Dados...</p>
                        </div>
                    ) : filtered.map(driver => (
                        <div key={driver.id} className="relative group bg-gradient-to-b from-white/[0.03] to-white/[0.01] hover:from-white/[0.05] hover:to-white/[0.02] border border-white/[0.05] hover:border-white/10 rounded-3xl p-6 shadow-2xl transition-all overflow-hidden backdrop-blur-xl">

                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-xl font-black text-white shadow-[0_0_20px_rgba(212,175,55,0.3)] border border-white/10">
                                        {driver.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white/95 tracking-tight">{driver.name}</h3>
                                        <div className="flex items-center gap-1.5 mt-1 text-xs">
                                            <Award className="w-3.5 h-3.5 text-brand-gold" />
                                            <span className="text-brand-gold font-bold">{driver.driverProfile?.rating || "5.0"}</span>
                                            <span className="text-white/30 mx-1">•</span>
                                            <span className="text-white/40">{driver.driverProfile?.trips || 0} Viagens</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/[0.03]">
                                    <span className="text-[0.65rem] text-white/40 uppercase tracking-widest font-bold">Veículo</span>
                                    <span className="text-sm text-white/80 font-medium">{driver.driverProfile?.vehicle?.model || "Sem Veículo"}</span>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-brand-gold/5 border border-brand-gold/10">
                                    <div className="flex items-center gap-3">
                                        <Building2 className="w-3.5 h-3.5 text-brand-gold/60" />
                                        <span className="text-[9px] font-black text-brand-gold uppercase tracking-widest">{driver.driverProfile?.bankName || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-3.5 h-3.5 text-white/20" />
                                        <span className="text-[10px] text-white font-mono tracking-tighter">***{driver.driverProfile?.iban?.slice(-4) || "****"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-2">
                                <button 
                                    onClick={() => handleUpdateStatus(driver.id, "AVAILABLE")}
                                    className={`flex-1 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-all ${
                                        driver.driverProfile?.status === "AVAILABLE" 
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                                        : "bg-white/5 text-white/30 border border-white/5 hover:bg-white/10"
                                    }`}
                                >
                                    {driver.driverProfile?.status === "AVAILABLE" && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                                    Ativo
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus(driver.id, "OFFLINE")}
                                    className={`flex-1 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-all ${
                                        driver.driverProfile?.status === "OFFLINE" 
                                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                                        : "bg-white/5 text-white/30 border border-white/5 hover:bg-white/10"
                                    }`}
                                >
                                    Offline
                                </button>
                                <button 
                                    onClick={() => handleUpdateStatus(driver.id, "SUSPENDED")}
                                    className={`w-10 flex items-center justify-center rounded-xl transition-all ${
                                        driver.driverProfile?.status === "SUSPENDED" 
                                        ? "bg-red-500 text-white" 
                                        : "bg-white/5 text-white/20 border border-white/5 hover:bg-red-500/20 hover:text-red-400"
                                    }`}
                                    title="Suspender Motorista"
                                >
                                    <Shield className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
