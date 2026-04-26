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
import {
  DollarSign, TrendingUp, Car, Activity, ChevronRight,
  Loader2, UserCheck, Zap, ArrowUpRight, Navigation, Shield
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const { bookings, live, loading: bookingsLoading, drivers } = useBookings();
  const { adminStats, loading: financesLoading } = useFinances();
  const user = useAuthStore(s => s.user);
  const { token } = useAuthStore();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
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

  const today = bookings.filter(b => new Date(b.pickupDate).toDateString() === new Date().toDateString()).length;
  const profit = adminStats?.platformProfit || 0;
  const revenue = adminStats?.totalRevenue || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Bom dia, {user?.name?.split(" ")[0]} 👋</h1>
          <p className="text-sm text-white/40 mt-0.5">{new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-emerald-400">Sistema ativo</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Receita Total", value: formatCurrency(revenue), icon: DollarSign, color: "gold", trend: "+12%" },
          { label: "Lucro NexRice", value: formatCurrency(profit), icon: TrendingUp, color: "emerald", trend: "+8%" },
          { label: "Viagens Hoje", value: String(today), icon: Activity, color: "gold", trend: null as string | null },
          { label: "Motoristas", value: String(drivers?.length || 0), icon: Car, color: "white", trend: null as string | null },
        ].map(({ label, value, icon: Icon, color, trend }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="p-6 rounded-3xl bg-[#0E0E14] border border-white/[0.07] hover:border-brand-gold/20 transition-all group relative overflow-hidden"
          >
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-brand-gold/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4">
              <div className={cn("w-9 h-9 rounded-2xl flex items-center justify-center",
                color === "gold" ? "bg-brand-gold/10 text-brand-gold" :
                color === "emerald" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              {trend && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3 h-3" />{trend}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            <p className="text-[10px] text-white/30 mt-1 uppercase tracking-widest font-semibold">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-3xl bg-[#0E0E14] border border-white/[0.07] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-semibold text-white">Reservas Recentes</h3>
              <p className="text-[10px] text-white/25 mt-0.5">{bookings.length} no total</p>
            </div>
            <Link href="/admin/bookings" className="text-[10px] text-white/30 hover:text-brand-gold transition-colors flex items-center gap-1 font-semibold">
              Ver todas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {bookings.slice(0, 7).map((b) => (
              <Link key={b.id} href={\`/admin/bookings/\${b.id}\`} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.03] transition-all group">
                <div className="w-8 h-8 rounded-xl bg-brand-gold/5 border border-brand-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-gold/15 transition-all">
                  <span className="text-[8px] font-black text-brand-gold/60 group-hover:text-brand-gold">{b.reference}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80 truncate group-hover:text-white transition-colors">
                    {b.origin.split(",")[0]} <span className="text-white/20 mx-1">→</span> {b.destination.split(",")[0]}
                  </p>
                  <p className="text-[10px] text-white/25 mt-0.5">{b.passenger.name} · {b.pickupDate} · <span className="text-brand-gold/40 uppercase font-bold">{b.category}</span></p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-medium text-white/70">{formatCurrency(b.totalPrice)}</span>
                  <BookingStatusBadge status={b.status} />
                </div>
              </Link>
            ))}
            {bookings.length === 0 && <p className="text-center text-white/20 text-sm italic py-12">Sem reservas ainda.</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl bg-[#0E0E14] border border-brand-gold/15 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
                <h3 className="text-sm font-semibold text-white">Em Curso</h3>
              </div>
              <span className="text-sm font-bold text-brand-gold bg-brand-gold/10 w-7 h-7 rounded-xl flex items-center justify-center">{live.length}</span>
            </div>
            <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
              {live.length === 0 ? (
                <div className="flex flex-col items-center py-6 gap-2">
                  <Navigation className="w-7 h-7 text-white/5" />
                  <p className="text-xs text-white/20">Nenhuma viagem ativa.</p>
                </div>
              ) : live.map((b) => (
                <div key={b.id} className="flex items-center gap-3 p-3 rounded-2xl bg-brand-gold/[0.04] border border-brand-gold/10">
                  <Zap className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{b.origin.split(",")[0]} → {b.destination.split(",")[0]}</p>
                    <p className="text-[9px] text-white/30">{b.driver?.name || "—"}</p>
                  </div>
                  <span className="text-xs font-semibold text-brand-gold flex-shrink-0">{formatCurrency(b.totalPrice)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#0E0E14] border border-white/[0.07] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white">Distribuição</h3>
              <p className="text-[10px] text-white/25 mt-0.5">{formatCurrency(profit)} de lucro</p>
            </div>
            <div className="p-3 space-y-2">
              {[
                { label: "NexRice", pct: 60, value: adminStats?.ownerShare || 0, gold: true },
                { label: "Parceiro A", pct: 20, value: adminStats?.partnerAShare || 0, gold: false },
                { label: "Parceiro B", pct: 20, value: adminStats?.partnerBShare || 0, gold: false },
              ].map(({ label, pct, value, gold }) => (
                <div key={label} className={cn("p-3.5 rounded-2xl border", gold ? "bg-brand-gold/5 border-brand-gold/15" : "bg-white/[0.02] border-white/[0.05]")}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn("text-xs font-bold", gold ? "text-brand-gold" : "text-white/40")}>{label}</span>
                    <span className={cn("text-xs font-semibold", gold ? "text-brand-gold" : "text-white/30")}>{formatCurrency(value)}</span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className={cn("h-full rounded-full", gold ? "bg-brand-gold" : "bg-white/15")} style={{ width: \`\${pct}%\` }} />
                  </div>
                  <p className="text-[9px] text-white/20 mt-1">{pct}% do lucro</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#0E0E14] border border-white/[0.07] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white">Atividade Recente</h3>
              <Link href="/admin/audit" className="text-[10px] text-white/30 hover:text-brand-gold transition-colors font-semibold">Ver tudo →</Link>
            </div>
            <div className="p-3 space-y-1.5 max-h-64 overflow-y-auto">
              {auditLogs.length === 0 ? (
                <div className="flex flex-col items-center py-6 gap-2">
                  <Shield className="w-7 h-7 text-white/5" />
                  <p className="text-xs text-white/20">Sem atividade registada.</p>
                </div>
              ) : auditLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-all">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-gold/40 mt-1.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider">{log.action?.replace(/_/g, " ")}</p>
                    <p className="text-[9px] text-white/25 mt-0.5">{log.user?.name || "Sistema"} · {log.ipAddress || "—"}</p>
                  </div>
                  <span className="text-[8px] text-white/15 flex-shrink-0">{log.createdAt ? new Date(log.createdAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" }) : ""}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#0E0E14] border border-white/[0.07] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <h3 className="text-sm font-semibold text-white">Motoristas</h3>
              <Link href="/admin/drivers" className="text-[10px] text-white/30 hover:text-brand-gold transition-colors font-semibold">Gerir →</Link>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {drivers?.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.03] transition-all group">
                  <div className="w-8 h-8 rounded-xl bg-brand-gold/10 border border-brand-gold/10 flex items-center justify-center text-brand-gold font-bold text-sm flex-shrink-0 group-hover:bg-brand-gold group-hover:text-black transition-all">
                    {d.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{d.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Ativo</span>
                    </div>
                  </div>
                  <UserCheck className="w-3.5 h-3.5 text-white/10 group-hover:text-brand-gold transition-colors" />
                </div>
              ))}
              {(!drivers || drivers.length === 0) && <p className="text-center text-white/20 text-xs italic py-6">Sem motoristas.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx'), content, 'utf8');
console.log('Written successfully, length:', content.length);
