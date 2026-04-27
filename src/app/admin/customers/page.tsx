"use client";

import { useState, useEffect } from "react";
import { Search, Users, Mail, Phone, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

export default function CustomersPage() {
  const { token } = useAuthStore();
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/bookings/my").catch(() => {});
    // Fetch all users with PASSENGER role via bookings data
    api.get("/bookings").then(r => {
      const seen = new Set();
      const unique = r.data
        .filter((b: any) => b.passenger)
        .filter((b: any) => { if (seen.has(b.passenger.email)) return false; seen.add(b.passenger.email); return true; })
        .map((b: any) => ({ ...b.passenger, trips: r.data.filter((x: any) => x.passenger?.email === b.passenger.email).length }));
      setCustomers(unique);
    }).catch(() => setCustomers([])).finally(() => setLoading(false));
  }, [token]);

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extralight text-white italic tracking-tighter">Clientes</h1>
        <p className="text-white/30 text-sm mt-1">{customers.length} clientes registados</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
        <input
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-gold/30 transition-colors"
          placeholder="Pesquisar cliente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="hidden lg:grid grid-cols-[1fr_1.5fr_80px_80px] gap-4 px-6 py-3 text-[9px] font-black text-white/25 uppercase tracking-widest" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div>Cliente</div>
          <div>Email</div>
          <div className="text-center">Viagens</div>
          <div></div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 text-brand-gold animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Users className="w-10 h-10 text-white/5" />
            <p className="text-white/20 text-sm italic">Sem clientes.</p>
          </div>
        ) : filtered.map((c, i) => (
          <div key={c.email}
            className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_80px_80px] items-center gap-4 px-6 py-4 hover:bg-white/[0.025] transition-all"
            style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-gold font-black text-sm flex-shrink-0"
                style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.15)" }}>
                {c.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-white/85">{c.name}</p>
                <p className="text-[9px] text-white/30 mt-0.5">{c.role || "Passageiro"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <Mail className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
              <span className="truncate">{c.email}</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-bold text-white/70">{c.trips || 0}</span>
            </div>
            <div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
