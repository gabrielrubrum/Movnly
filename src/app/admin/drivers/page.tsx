"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, UserCheck, Car, CreditCard, Building2, Shield, ChevronRight } from "lucide-react";
import axios from "axios";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function DriversPage() {
  const { token } = useAuthStore();
  const [search, setSearch] = useState("");
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

  const fetchDrivers = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/drivers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrivers(res.data);
    } catch {
      toast.error("Erro ao carregar motoristas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (token) fetchDrivers(); }, [token]);

  const handleStatus = async (driverId: string, status: string) => {
    try {
      await axios.patch(`${API_URL}/admin/drivers/${driverId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Motorista definido como ${status}.`);
      fetchDrivers();
    } catch {
      toast.error("Erro ao atualizar.");
    }
  };

  const filtered = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.driverProfile?.vehicle?.model?.toLowerCase().includes(search.toLowerCase())
  );

  const online = drivers.filter(d => d.driverProfile?.status === "AVAILABLE").length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extralight text-white font-serif italic tracking-tighter">Motoristas</h1>
          <p className="text-white/30 text-sm mt-1">{drivers.length} registados · {online} disponíveis</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/15 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{online} online</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
        <input
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-gold/30 transition-colors"
          placeholder="Pesquisar motorista ou veículo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <UserCheck className="w-10 h-10 text-white/5" />
          <p className="text-white/20 text-sm italic">Nenhum motorista encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((driver) => {
            const status = driver.driverProfile?.status;
            const isOnline = status === "AVAILABLE";
            const isSuspended = status === "SUSPENDED";

            return (
              <div key={driver.id}
                className="rounded-2xl overflow-hidden transition-all hover:border-white/10"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                {/* Top */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-brand-gold font-black text-lg flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)", border: "1px solid rgba(212,175,55,0.2)" }}>
                        {driver.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">{driver.name}</h3>
                        <p className="text-[9px] text-white/30 mt-0.5">{driver.email}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider",
                      isOnline ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                      isSuspended ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      "bg-white/5 text-white/30 border border-white/10"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", isOnline ? "bg-emerald-500 animate-pulse" : isSuspended ? "bg-red-500" : "bg-white/20")} />
                      {isOnline ? "Online" : isSuspended ? "Suspenso" : "Offline"}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div className="flex items-center gap-2">
                        <Car className="w-3.5 h-3.5 text-white/25" />
                        <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Veículo</span>
                      </div>
                      <span className="text-xs font-semibold text-white/70">
                        {driver.driverProfile?.vehicle?.model || "Sem veículo"}
                      </span>
                    </div>

                    {driver.driverProfile?.bankName && (
                      <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.1)" }}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-brand-gold/40" />
                          <span className="text-[9px] font-black text-brand-gold/50 uppercase tracking-widest">{driver.driverProfile.bankName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3 h-3 text-white/20" />
                          <span className="text-[9px] font-mono text-white/40">···{driver.driverProfile?.iban?.slice(-4) || "····"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 px-5 pb-5">
                  <button
                    onClick={() => handleStatus(driver.id, "AVAILABLE")}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                      isOnline
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                        : "bg-white/[0.04] text-white/30 border border-white/[0.06] hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20"
                    )}
                  >
                    {isOnline && <span className="mr-1">✓</span>}Ativo
                  </button>
                  <button
                    onClick={() => handleStatus(driver.id, "OFFLINE")}
                    className={cn(
                      "flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                      status === "OFFLINE"
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                        : "bg-white/[0.04] text-white/30 border border-white/[0.06] hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/20"
                    )}
                  >
                    Offline
                  </button>
                  <button
                    onClick={() => handleStatus(driver.id, "SUSPENDED")}
                    className={cn(
                      "w-10 rounded-xl flex items-center justify-center transition-all",
                      isSuspended
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-white/[0.04] text-white/20 border border-white/[0.06] hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                    )}
                    title="Suspender"
                  >
                    <Shield className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
