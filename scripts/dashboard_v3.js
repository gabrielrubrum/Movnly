const fs = require('fs');
const path = require('path');

const content = `"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { useBookings } from "@/hooks/useBookings";
import { useFinances } from "@/hooks/useFinances";
import { cn, formatCurrency } from "@/lib/utils";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { Loader2, ChevronRight, ArrowUpRight, Zap, Shield, UserCheck, TrendingUp, Car, Activity, DollarSign, Navigation, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { bookings, live, loading: bookingsLoading, drivers } = useBookings();
  const { adminStats, loading: financesLoading } = useFinances();
  const user = useAuthStore(s => s.user);
  const { token } = useAuthStore();
  const [auditLogs, setAuditLogs] = useState([]);
  const loading = bookingsLoading || financesLoading;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

  useEffect(() => {
    if (!token) return;
    axios.get(\`\${API_URL}/audit?take=15\`, { headers: { Authorization: \`Bearer \${token}\` } })
      .then(r => { const d = r.data; setAuditLogs(Array.isArray(d) ? d : d?.logs || []); })
      .catch(() => {});
  }, [token, API_URL]);

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
    </div>
  );

  const today = bookings.filter(b =>
    new Date(b.pickupDate).toDateString() === new Date().toDateString()
  ).length;
  const profit = adminStats?.platformProfit || 0;
  const revenue = adminStats?.totalRevenue || 0;

  return (
    <div className="space-y-6">

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[9px] font-black text-brand-gold/60 uppercase tracking-[0.4em] mb-2">
            {new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-4xl font-extralight text-white italic tracking-tighter">
            Olá, <span className="not-italic font-semibold text-brand-gold">{user?.name?.split(" ")[0]}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/8 border border-emerald-500/20 w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Online</span>
        </div>
      </div>

      {/* ── KPIs ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Receita", value: formatCurrency(revenue), sub: "total acumulado", icon: DollarSign, gold: true, trend: "+12%" },
          { label: "Lucro", value: formatCurrency(profit), sub: "após motoristas", icon: TrendingUp, emerald: true, trend: "+8%" },
          { label: "Hoje", value: String(today), sub: "viagens agendadas", icon: Activity },
          { label: "Motoristas", value: String(drivers?.length || 0), sub: "na plataforma", icon: Car },
        ].map(({ label, value, sub, icon: Icon, gold, emerald, trend }, i) => (
          <motion.div key={label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.4 }}
            className="relative rounded-2xl p-5 overflow-hidden cursor-default"
            style={{
              background: gold ? "linear-gradient(135deg, #12100A 0%, #0A0A0F 100%)" : emerald ? "linear-gradient(135deg, #071009 0%, #0A0A0F 100%)" : "rgba(255,255,255,0.03)",
              border: gold ? "1px solid rgba(212,175,55,0.2)" : emerald ? "1px solid rgba(52,211,153,0.18)" : "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {(gold || emerald) && (
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-25"
                style={{ background: gold ? "#D4AF37" : "#34D399" }} />
            )}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center",
                  gold ? "bg-brand-gold/10 text-brand-gold" : emerald ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                {trend && (
                  <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <ArrowUpRight className="w-2.5 h-2.5" />{trend}
                  </span>
                )}
              </div>
              <p className={cn("text-2xl font-light tracking-tight leading-none",
                gold ? "text-brand-gold" : emerald ? "text-emerald-400" : "text-white"
              )}>{value}</p>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1.5">{label}</p>
              <p className="text-[8px] text-white/20 mt-0.5">{sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── MAIN CONTENT ───────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-4">

        {/* Reservas */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <h2 className="text-sm font-bold text-white">Reservas Recentes</h2>
              <p className="text-[9px] text-white/30 mt-0.5">{bookings.length} no sistema</p>
            </div>
            <Link href="/admin/bookings" className="flex items-center gap-1 text-[9px] font-black text-white/25 hover:text-brand-gold uppercase tracking-widest transition-colors">
              Ver todas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {bookings.slice(0, 9).map((b, i) => {
              const active = b.status === 'on_route' || b.status === 'confirmed';
              const done = b.status === 'completed';
              return (
                <Link key={b.id} href={\`/admin/bookings/\${b.id}\`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.03] transition-all group"
                  style={{ borderBottom: i < 8 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                >
                  <div className="w-1 h-8 rounded-full flex-shrink-0"
                    style={{ background: active ? "rgba(212,175,55,0.6)" : done ? "rgba(52,211,153,0.6)" : "rgba(255,255,255,0.1)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate group-hover:text-white transition-colors">
                      {b.origin.split(",")[0]} <span className="text-white/25 mx-1.5 text-xs">→</span> {b.destination.split(",")[0]}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] text-white/35">{b.passenger.name}</span>
                      <span className="text-white/15 text-[8px]">·</span>
                      <span className="text-[9px] text-white/25">{b.pickupDate}</span>
                      <span className="text-white/15 text-[8px]">·</span>
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded" style={{ background: "rgba(212,175,55,0.08)", color: "rgba(212,175,55,0.65)" }}>{b.category}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-sm font-semibold text-white/75 group-hover:text-white transition-colors tabular-nums">{formatCurrency(b.totalPrice)}</span>
                    <BookingStatusBadge status={b.status} />
                  </div>
                </Link>
              );
            })}
            {bookings.length === 0 && (
              <div className="flex flex-col items-center py-12 gap-2">
                <Activity className="w-8 h-8 text-white/5" />
                <p className="text-white/20 text-xs italic">Sem reservas.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-3">

          {/* Em Curso */}
          <div className="rounded-2xl overflow-hidden relative" style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.12)" }}>
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-15" style={{ background: "#D4AF37" }} />
            <div className="flex items-center justify-between px-5 py-4 relative z-10" style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-gold/10 border border-brand-gold/15 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-brand-gold" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Em Curso</h3>
                  <p className="text-[8px] text-brand-gold/40 uppercase tracking-widest">Tempo real</p>
                </div>
              </div>
              <span className="text-2xl font-black text-brand-gold">{live.length}</span>
            </div>
            <div className="p-3 space-y-1.5 max-h-44 overflow-y-auto relative z-10">
              {live.length === 0 ? (
                <div className="flex flex-col items-center py-6 gap-2">
                  <Navigation className="w-7 h-7 text-white/5" />
                  <p className="text-[10px] text-white/20 italic">Nenhuma viagem ativa.</p>
                </div>
              ) : live.map((b) => (
                <div key={b.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.1)" }}>
                  <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-50" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-gold" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-white truncate">{b.origin.split(",")[0]} → {b.destination.split(",")[0]}</p>
                    <p className="text-[8px] text-white/35">{b.driver?.name || "—"}</p>
                  </div>
                  <span className="text-xs font-bold text-brand-gold tabular-nums">{formatCurrency(b.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <h3 className="text-sm font-bold text-white">Distribuição</h3>
              <p className="text-[9px] text-white/30 mt-0.5">{formatCurrency(profit)} de lucro</p>
            </div>
            <div className="p-3 space-y-2">
              {[
                { label: "NexRice", pct: 60, value: adminStats?.ownerShare || 0, gold: true },
                { label: "Parceiro A", pct: 20, value: adminStats?.partnerAShare || 0 },
                { label: "Parceiro B", pct: 20, value: adminStats?.partnerBShare || 0 },
              ].map(({ label, pct, value, gold }, i) => (
                <div key={label} className="px-3 py-3 rounded-xl" style={{ background: gold ? "rgba(212,175,55,0.06)" : "rgba(255,255,255,0.02)", border: gold ? "1px solid rgba(212,175,55,0.12)" : "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("text-xs font-semibold", gold ? "text-brand-gold" : "text-white/45")}>{label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={cn("text-sm font-bold tabular-nums", gold ? "text-brand-gold" : "text-white/45")}>{formatCurrency(value)}</span>
                      <span className="text-[8px] text-white/20">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: \`\${pct}%\` }} transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                      className="h-full rounded-full"
                      style={gold ? { background: "linear-gradient(90deg, #D4AF37, #C5A028)", boxShadow: "0 0 6px rgba(212,175,55,0.4)" } : { background: "rgba(255,255,255,0.18)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Motoristas */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-brand-gold/40" />
                <h3 className="text-sm font-bold text-white">Motoristas</h3>
              </div>
              <Link href="/admin/drivers" className="text-[9px] font-black text-white/20 hover:text-brand-gold uppercase tracking-widest transition-colors">Gerir →</Link>
            </div>
            <div className="p-2.5 space-y-1">
              {drivers?.slice(0, 4).map((d) => (
                <div key={d.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.03] transition-all group" style={{ border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-gold font-black text-sm flex-shrink-0"
                    style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.15)" }}>
                    {d.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{d.name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider">Disponível</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!drivers || drivers.length === 0) && <p className="text-center text-white/20 text-xs italic py-4">Sem motoristas.</p>}
            </div>
          </div>

          {/* Atividade */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-brand-gold/30" />
                <h3 className="text-sm font-bold text-white">Atividade</h3>
              </div>
              <Link href="/admin/audit" className="text-[9px] font-black text-white/20 hover:text-brand-gold uppercase tracking-widest transition-colors">Ver →</Link>
            </div>
            <div className="p-2.5 max-h-48 overflow-y-auto space-y-0.5">
              {auditLogs.length === 0 ? (
                <div className="flex flex-col items-center py-6 gap-2">
                  <Shield className="w-7 h-7 text-white/5" />
                  <p className="text-[10px] text-white/20 italic">Sem atividade.</p>
                </div>
              ) : auditLogs.map((log, i) => {
                const isLogin = log.action?.includes("LOGIN");
                const isDriver = log.action?.includes("DRIVER");
                const isStatus = log.action?.includes("STATUS");
                const color = isLogin ? "#34D399" : isDriver ? "#D4AF37" : isStatus ? "#60A5FA" : "rgba(255,255,255,0.2)";
                const label = log.action?.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                return (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-all">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-medium text-white/55 truncate">{label}</p>
                      <p className="text-[8px] text-white/25">{log.user?.name || "Sistema"}</p>
                    </div>
                    <span className="text-[8px] text-white/20 flex-shrink-0 font-mono">
                      {log.createdAt ? new Date(log.createdAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx'), content, 'utf8');
console.log('Written, length:', content.length);
