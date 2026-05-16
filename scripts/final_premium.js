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
import { Loader2, ChevronRight, ArrowUpRight, Zap, Shield, UserCheck, TrendingUp, Car, Activity, DollarSign, Navigation, Clock, MapPin } from "lucide-react";
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
    axios.get(\`\${API_URL}/audit?take=20\`, { headers: { Authorization: \`Bearer \${token}\` } })
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
    <div className="animate-luxury-reveal space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-[9px] font-black text-brand-gold/50 uppercase tracking-[0.5em] mb-3">
            {new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-5xl font-extralight text-white italic tracking-tighter leading-none">
            Olá, <span className="not-italic font-bold text-brand-gold">{user?.name?.split(" ")[0]}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-500/5 border border-emerald-500/15 w-fit">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Sistema Ativo</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0, duration: 0.5 }}
          className="relative rounded-3xl p-6 overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-1"
          style={{ background: "linear-gradient(145deg, #110E05 0%, #0A0A0F 100%)", border: "1px solid rgba(212,175,55,0.2)", boxShadow: "0 4px 32px rgba(212,175,55,0.07)" }}
        >
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "#D4AF37" }} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-2xl bg-brand-gold/10 text-brand-gold flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
              <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-full"><ArrowUpRight className="w-3 h-3" />+12%</span>
            </div>
            <p className="text-3xl font-light text-brand-gold tracking-tight leading-none">{formatCurrency(revenue)}</p>
            <p className="text-[11px] font-black text-white/50 uppercase tracking-widest mt-2">Receita Total</p>
            <p className="text-[9px] text-white/20 mt-0.5">todas as viagens</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07, duration: 0.5 }}
          className="relative rounded-3xl p-6 overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-1"
          style={{ background: "linear-gradient(145deg, #051108 0%, #0A0A0F 100%)", border: "1px solid rgba(52,211,153,0.18)", boxShadow: "0 4px 32px rgba(52,211,153,0.06)" }}
        >
          <div className="absolute top-0 right-0 w-28 h-28 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: "#34D399" }} />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
              <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-full"><ArrowUpRight className="w-3 h-3" />+8%</span>
            </div>
            <p className="text-3xl font-light text-emerald-400 tracking-tight leading-none">{formatCurrency(profit)}</p>
            <p className="text-[11px] font-black text-white/50 uppercase tracking-widest mt-2">Lucro MOVNLY</p>
            <p className="text-[9px] text-white/20 mt-0.5">após motoristas</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.5 }}
          className="relative rounded-3xl p-6 overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-1"
          style={{ background: "linear-gradient(145deg, #0D0D12 0%, #0A0A0F 100%)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center"><Activity className="w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-light text-white tracking-tight leading-none">{today}</p>
            <p className="text-[11px] font-black text-white/50 uppercase tracking-widest mt-2">Viagens Hoje</p>
            <p className="text-[9px] text-white/20 mt-0.5">agendadas</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21, duration: 0.5 }}
          className="relative rounded-3xl p-6 overflow-hidden cursor-default transition-all duration-300 hover:-translate-y-1"
          style={{ background: "linear-gradient(145deg, #0D0D12 0%, #0A0A0F 100%)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="w-10 h-10 rounded-2xl bg-white/5 text-white/40 flex items-center justify-center"><Car className="w-5 h-5" /></div>
            </div>
            <p className="text-4xl font-light text-white tracking-tight leading-none">{drivers?.length || 0}</p>
            <p className="text-[11px] font-black text-white/50 uppercase tracking-widest mt-2">Motoristas</p>
            <p className="text-[9px] text-white/20 mt-0.5">registados</p>
          </div>
        </motion.div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-5">

        {/* Reservas — linhas limpas com mais contraste */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          className="glass-bento-premium overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
            <div>
              <h2 className="text-base font-bold text-white">Reservas Recentes</h2>
              <p className="text-[9px] text-white/30 mt-0.5 uppercase tracking-widest">{bookings.length} no sistema</p>
            </div>
            <Link href="/admin/bookings" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[9px] font-black text-white/40 hover:text-brand-gold hover:border-brand-gold/20 uppercase tracking-widest transition-all">
              Ver todas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            {bookings.slice(0, 8).map((b, i) => {
              const isActive = b.status === 'on_route' || b.status === 'confirmed';
              const isDone = b.status === 'completed';
              return (
                <Link key={b.id} href={\`/admin/bookings/\${b.id}\`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.03] transition-all group"
                  style={{ borderBottom: i < 7 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                >
                  {/* Indicador de status */}
                  <div className="w-1 h-10 rounded-full flex-shrink-0"
                    style={{ background: isActive ? "rgba(212,175,55,0.7)" : isDone ? "rgba(52,211,153,0.7)" : "rgba(255,255,255,0.1)" }} />

                  {/* Ref */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <span className="text-[8px] font-black text-white/40 group-hover:text-brand-gold transition-colors">{b.reference}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/85 truncate group-hover:text-white transition-colors">
                      {b.origin.split(",")[0]}
                      <span className="text-white/25 mx-2 font-light text-xs">→</span>
                      {b.destination.split(",")[0]}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-white/35">{b.passenger.name}</span>
                      <span className="text-white/15 text-[8px]">·</span>
                      <span className="text-[9px] text-white/25">{b.pickupDate}</span>
                      <span className="text-white/15 text-[8px]">·</span>
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md text-brand-gold/60" style={{ background: "rgba(212,175,55,0.08)" }}>{b.category}</span>
                    </div>
                  </div>

                  {/* Preço + status */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className="text-sm font-bold tabular-nums text-white/80 group-hover:text-white transition-colors">{formatCurrency(b.totalPrice)}</span>
                    <BookingStatusBadge status={b.status} />
                  </div>
                </Link>
              );
            })}
            {bookings.length === 0 && (
              <div className="flex flex-col items-center py-16 gap-3">
                <Activity className="w-10 h-10 text-white/5" />
                <p className="text-white/20 text-sm italic">Sem reservas ainda.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-4">

          {/* Em Curso */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
            className="glass-bento-premium overflow-hidden">
            <div className="absolute inset-0 rounded-[32px]" style={{ background: "radial-gradient(ellipse at top right, rgba(212,175,55,0.08) 0%, transparent 60%)" }} />
            <div className="flex items-center justify-between px-6 py-5 border-b border-brand-gold/[0.08] relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-brand-gold/10 border border-brand-gold/15 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-brand-gold" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Em Curso</h3>
                  <p className="text-[9px] text-brand-gold/40 uppercase tracking-widest">Tempo real</p>
                </div>
              </div>
              <div className="min-w-[40px] h-10 px-3 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center">
                <span className="text-xl font-black text-brand-gold leading-none">{live.length}</span>
              </div>
            </div>
            <div className="p-3 space-y-2 max-h-52 overflow-y-auto relative z-10">
              {live.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-2">
                  <Navigation className="w-8 h-8 text-white/5" />
                  <p className="text-xs text-white/20 italic">Nenhuma viagem ativa.</p>
                </div>
              ) : live.map((b) => (
                <div key={b.id} className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.1)" }}>
                  <span className="relative flex h-2 w-2 flex-shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gold opacity-40" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gold" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white/90 truncate">
                      {b.origin.split(",")[0]} <span className="text-white/30 mx-1 text-[10px]">→</span> {b.destination.split(",")[0]}
                    </p>
                    <p className="text-[9px] text-white/35 mt-0.5">{b.driver?.name || "Sem motorista"}</p>
                  </div>
                  <span className="text-xs font-bold text-brand-gold flex-shrink-0 tabular-nums">{formatCurrency(b.totalPrice)}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Distribuição */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="glass-bento-premium overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
              <div>
                <h3 className="text-sm font-bold text-white">Distribuição</h3>
                <p className="text-[9px] text-white/30 mt-0.5">{formatCurrency(profit)} de lucro</p>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {[
                { label: "MOVNLY", pct: 60, value: adminStats?.ownerShare || 0, gold: true },
                { label: "Parceiro A", pct: 20, value: adminStats?.partnerAShare || 0, gold: false },
                { label: "Parceiro B", pct: 20, value: adminStats?.partnerBShare || 0, gold: false },
              ].map(({ label, pct, value, gold }, i) => (
                <div key={label} className="px-4 py-3.5 rounded-2xl"
                  style={{ background: gold ? "rgba(212,175,55,0.06)" : "rgba(255,255,255,0.02)", border: gold ? "1px solid rgba(212,175,55,0.12)" : "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={cn("text-xs font-bold", gold ? "text-brand-gold" : "text-white/45")}>{label}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-bold tabular-nums", gold ? "text-brand-gold" : "text-white/45")}>{formatCurrency(value)}</span>
                      <span className="text-[8px] font-black text-white/20">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: \`\${pct}%\` }} transition={{ duration: 1.2, delay: 0.5 + i * 0.15 }}
                      className="h-full rounded-full"
                      style={gold ? { background: "linear-gradient(90deg, #D4AF37, #C5A028)", boxShadow: "0 0 6px rgba(212,175,55,0.5)" } : { background: "rgba(255,255,255,0.18)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Motoristas */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
            className="glass-bento-premium overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-brand-gold/40" />
                <h3 className="text-sm font-bold text-white">Motoristas</h3>
              </div>
              <Link href="/admin/drivers" className="text-[9px] font-black text-white/25 hover:text-brand-gold uppercase tracking-widest transition-colors">Gerir →</Link>
            </div>
            <div className="p-3 space-y-1.5">
              {drivers?.slice(0, 4).map((d) => (
                <div key={d.id} className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/[0.03] transition-all group"
                  style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-gold font-black text-sm flex-shrink-0"
                    style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%)", border: "1px solid rgba(212,175,55,0.15)" }}>
                    {d.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white/85 truncate">{d.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Disponível</span>
                    </div>
                  </div>
                </div>
              ))}
              {(!drivers || drivers.length === 0) && <p className="text-center text-white/20 text-xs italic py-6">Sem motoristas.</p>}
            </div>
          </motion.div>

          {/* Atividade */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
            className="glass-bento-premium overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-gold/30" />
                <h3 className="text-sm font-bold text-white">Atividade</h3>
              </div>
              <Link href="/admin/audit" className="text-[9px] font-black text-white/25 hover:text-brand-gold uppercase tracking-widest transition-colors">Ver tudo →</Link>
            </div>
            <div className="p-3 max-h-56 overflow-y-auto space-y-0.5">
              {auditLogs.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-2">
                  <Shield className="w-8 h-8 text-white/5" />
                  <p className="text-xs text-white/20 italic">Sem atividade.</p>
                </div>
              ) : auditLogs.map((log, i) => {
                const isLogin = log.action?.includes("LOGIN");
                const isDriver = log.action?.includes("DRIVER");
                const isStatus = log.action?.includes("STATUS");
                const dotColor = isLogin ? "#34D399" : isDriver ? "#D4AF37" : isStatus ? "#60A5FA" : "rgba(255,255,255,0.2)";
                const actionLabel = log.action?.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
                return (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.025] transition-all">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5" style={{ background: dotColor }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-white/55 truncate">{actionLabel}</p>
                      <p className="text-[9px] text-white/25">{log.user?.name || "Sistema"}</p>
                    </div>
                    <span className="text-[8px] text-white/20 flex-shrink-0 font-mono tabular-nums">
                      {log.createdAt ? new Date(log.createdAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx'), content, 'utf8');
console.log('Written, length:', content.length);
