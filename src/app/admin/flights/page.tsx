"use client";

import { useState, useEffect } from "react";
import { Plane, Clock, RefreshCw, AlertCircle, ShieldCheck, ArrowRight, Globe, Zap, MapPin, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

interface Flight {
  id: string;
  airline: string;
  from: string;
  terminal: string;
  status: "ON_TIME" | "DELAYED" | "LANDED" | "APPROACHING";
  sta: string;
  eta: string;
  gate: string;
  belt: string;
  hasBooking?: boolean;
  bookingId?: string;
}

const STATUS = {
  ON_TIME:    { label: "A Horas",        color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-400" },
  DELAYED:    { label: "Atrasado",       color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20",   dot: "bg-amber-400" },
  LANDED:     { label: "Aterrou",        color: "text-brand-gold",  bg: "bg-brand-gold/10 border-brand-gold/20", dot: "bg-brand-gold" },
  APPROACHING:{ label: "Em Aproximação", color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/20",     dot: "bg-blue-400" },
};

export default function FlightsPage() {
  const { token } = useAuthStore();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  const [syncing, setSyncing] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

  const fetchFlights = async (silent = false) => {
    if (!silent) setSyncing(true);
    try {
      const res = await fetch(`${API_URL}/flights`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setFlights(Array.isArray(data) ? data : []);
      setLastSync(new Date());
    } catch {
      // silencioso
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFlights();
      const interval = setInterval(() => fetchFlights(true), 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const delayed = flights.filter(f => f.status === "DELAYED").length;
  const withBooking = flights.filter(f => f.hasBooking).length;
  const approaching = flights.filter(f => f.status === "APPROACHING").length;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[9px] font-black text-brand-gold/50 uppercase tracking-[0.4em] mb-1 flex items-center gap-1.5">
            <Globe className="w-3 h-3" /> Aeroporto de Lisboa · LIS
          </p>
          <h1 className="text-3xl font-bold text-white tracking-tight">Monitorização de Voos</h1>
          <p className="text-white/30 text-sm mt-1">Chegadas em tempo real · Coordenação de transfers</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/5 border border-emerald-500/15">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
              Sync {lastSync.toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <button onClick={() => fetchFlights()}
            className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all",
              "bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.08]"
            )}>
            <RefreshCw className={cn("w-4 h-4", syncing && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Como funciona */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.12)" }}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-gold/10 border border-brand-gold/15 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Zap className="w-4 h-4 text-brand-gold" />
          </div>
          <div>
            <p className="text-sm font-bold text-white mb-1">Como funciona o sistema de voos</p>
            <p className="text-[11px] text-white/45 leading-relaxed">
              Quando um cliente faz uma reserva com número de voo (ex: TP1350), o sistema monitoriza automaticamente o voo.
              Se o voo atrasar, o motorista é notificado em tempo real via WebSocket e o pickup é ajustado.
              Os voos com reserva NexRice aparecem destacados a dourado.
            </p>
            <div className="flex flex-wrap gap-3 mt-3">
              {[
                { icon: CheckCircle2, text: "Monitorização automática", color: "text-emerald-400" },
                { icon: Zap, text: "Notificação em tempo real", color: "text-brand-gold" },
                { icon: Clock, text: "Ajuste automático de pickup", color: "text-blue-400" },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex items-center gap-1.5 text-[10px] font-bold text-white/40">
                  <Icon className={cn("w-3 h-3", color)} /> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Chegadas", value: flights.length, color: "text-white" },
          { label: "Em Aproximação", value: approaching, color: "text-blue-400" },
          { label: "Atrasados", value: delayed, color: "text-amber-400" },
          { label: "Com Reserva NexRice", value: withBooking, color: "text-brand-gold" },
        ].map(({ label, value, color }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="px-5 py-4 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className={cn("text-2xl font-light tracking-tight", color)}>{value}</p>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabela de voos */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="hidden lg:grid grid-cols-[180px_1fr_100px_140px_120px_160px] gap-4 px-6 py-3 text-[9px] font-black text-white/25 uppercase tracking-widest"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div>Voo</div>
          <div>Origem</div>
          <div>ETA</div>
          <div className="text-center">Estado</div>
          <div>Terminal / Porta</div>
          <div className="text-right">Reserva NexRice</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
          </div>
        ) : flights.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Plane className="w-10 h-10 text-white/5" />
            <p className="text-white/20 text-sm italic">Sem voos disponíveis.</p>
          </div>
        ) : flights.map((f, i) => {
          const st = STATUS[f.status];
          return (
            <motion.div key={f.id}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
              className={cn(
                "grid grid-cols-1 lg:grid-cols-[180px_1fr_100px_140px_120px_160px] items-center gap-4 px-6 py-4 transition-all",
                f.hasBooking ? "bg-brand-gold/[0.03]" : "hover:bg-white/[0.02]"
              )}
              style={{ borderBottom: i < flights.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>

              {/* Voo */}
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                  f.hasBooking ? "bg-brand-gold/10 border border-brand-gold/20" : "bg-white/5 border border-white/8"
                )}>
                  <Plane className={cn("w-4 h-4 rotate-45", f.hasBooking ? "text-brand-gold" : "text-white/30")} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{f.id}</p>
                  <p className="text-[9px] text-white/30">{f.airline}</p>
                </div>
              </div>

              {/* Origem */}
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-white/20 flex-shrink-0" />
                <span className="text-sm text-white/65">{f.from}</span>
              </div>

              {/* ETA */}
              <div>
                <p className="text-sm font-bold text-white font-mono">{f.eta}</p>
                {f.eta !== f.sta && (
                  <p className="text-[9px] text-white/25 line-through">{f.sta}</p>
                )}
              </div>

              {/* Status */}
              <div className="flex justify-start lg:justify-center">
                <span className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border", st.bg, st.color)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", st.dot,
                    f.status === "APPROACHING" && "animate-pulse"
                  )} />
                  {st.label}
                </span>
              </div>

              {/* Terminal */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white/50 bg-white/5 px-2 py-0.5 rounded-lg border border-white/8">{f.terminal}</span>
                <span className="text-xs font-bold text-brand-gold">{f.gate || "—"}</span>
              </div>

              {/* Reserva */}
              <div className="flex justify-start lg:justify-end">
                {f.hasBooking ? (
                  <Link href={`/admin/bookings/${f.bookingId}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider text-brand-gold transition-all hover:bg-brand-gold hover:text-black"
                    style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}>
                    <ShieldCheck className="w-3 h-3" /> Ver Reserva
                  </Link>
                ) : (
                  <span className="text-[9px] text-white/20 italic">Sem reserva</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="text-[9px] text-white/20 text-center">
        Dados simulados · Em produção integra com AviationStack API para dados reais em tempo real
      </p>
    </div>
  );
}
