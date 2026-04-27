"use client";

import { useState, useEffect } from "react";
import { Search, Users, Mail, Phone, Loader2, TrendingUp, Calendar } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { formatCurrency } from "@/lib/utils";
import api from "@/lib/api";
import { motion } from "framer-motion";

export default function CustomersPage() {
  const { token } = useAuthStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/bookings").then(r => {
      const seen = new Set();
      const unique = r.data
        .filter((b: any) => b.passenger)
        .filter((b: any) => {
          if (seen.has(b.passenger.email)) return false;
          seen.add(b.passenger.email);
          return true;
        })
        .map((b: any) => {
          const allTrips = r.data.filter((x: any) => x.passenger?.email === b.passenger.email);
          const spent = allTrips.reduce((s: number, x: any) => s + (x.price || 0), 0);
          const last = allTrips.sort((a: any, b: any) =>
            new Date(b.pickupTime).getTime() - new Date(a.pickupTime).getTime()
          )[0];
          return {
            ...b.passenger,
            trips: allTrips.length,
            spent,
            lastTrip: last?.pickupTime,
            lastRoute: last ? `${last.from?.split(",")[0]} → ${last.to?.split(",")[0]}` : null,
          };
        })
        .sort((a: any, b: any) => b.trips - a.trips);
      setCustomers(unique);
    }).catch(() => setCustomers([])).finally(() => setLoading(false));
  }, [token]);

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpent = customers.reduce((s, c) => s + (c.spent || 0), 0);
  const totalTrips = customers.reduce((s, c) => s + (c.trips || 0), 0);

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Clientes</h1>
          <p className="text-white/30 text-sm mt-1">{customers.length} clientes registados</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Clientes", value: String(customers.length), icon: Users, color: "text-white" },
          { label: "Total Viagens", value: String(totalTrips), icon: TrendingUp, color: "text-brand-gold" },
          { label: "Receita Gerada", value: formatCurrency(totalSpent), icon: TrendingUp, color: "text-emerald-400", emerald: true },
        ].map(({ label, value, icon: Icon, color, emerald }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="px-5 py-4 rounded-2xl"
            style={{
              background: emerald ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.025)",
              border: emerald ? "1px solid rgba(52,211,153,0.12)" : "1px solid rgba(255,255,255,0.06)"
            }}>
            <p className={`text-2xl font-light tracking-tight ${color}`}>{value}</p>
            <p className="text-[10px] font-black text-white/35 uppercase tracking-widest mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
        <input
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-gold/30 transition-colors"
          placeholder="Pesquisar cliente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Grid de cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <Users className="w-10 h-10 text-white/5" />
          <p className="text-white/20 text-sm italic">Sem clientes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((c, i) => (
            <motion.div key={c.email}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl p-5 transition-all hover:border-white/10"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>

              {/* Top */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-brand-gold font-black text-lg flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)", border: "1px solid rgba(212,175,55,0.2)" }}>
                  {c.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-white truncate">{c.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-white/5 text-white/30 border border-white/10">
                      Passageiro
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-brand-gold">{c.trips}</p>
                  <p className="text-[8px] text-white/25 uppercase tracking-wider">viagens</p>
                </div>
              </div>

              {/* Contacto */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <Mail className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
                  <span className="text-[11px] text-white/50 truncate">{c.email}</span>
                </div>
                {c.phone && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <Phone className="w-3.5 h-3.5 text-white/25 flex-shrink-0" />
                    <span className="text-[11px] text-white/50">{c.phone}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="px-3 py-2.5 rounded-xl text-center"
                  style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.1)" }}>
                  <p className="text-sm font-bold text-brand-gold">{formatCurrency(c.spent || 0)}</p>
                  <p className="text-[8px] text-white/25 uppercase tracking-wider mt-0.5">gasto total</p>
                </div>
                <div className="px-3 py-2.5 rounded-xl text-center"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-sm font-bold text-white/70">
                    {c.lastTrip ? new Date(c.lastTrip).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" }) : "—"}
                  </p>
                  <p className="text-[8px] text-white/25 uppercase tracking-wider mt-0.5">última viagem</p>
                </div>
              </div>

              {/* Última rota */}
              {c.lastRoute && (
                <div className="mt-2 px-3 py-2 rounded-xl flex items-center gap-2"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <Calendar className="w-3 h-3 text-white/20 flex-shrink-0" />
                  <span className="text-[10px] text-white/35 truncate">{c.lastRoute}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
