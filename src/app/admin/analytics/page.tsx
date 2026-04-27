"use client";

import { useFinances } from "@/hooks/useFinances";
import { useBookings } from "@/hooks/useBookings";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, DollarSign, Car, Activity, Loader2, ArrowUpRight, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const MONTHS = ["Out", "Nov", "Dez", "Jan", "Fev", "Mar"];
const MOCK_DATA = [14200, 18500, 26800, 15100, 19400, 31200];
const MAX = Math.max(...MOCK_DATA);

export default function AnalyticsPage() {
  const { adminStats, loading: fLoading } = useFinances();
  const { bookings, drivers, loading: bLoading } = useBookings();

  if (fLoading || bLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
    </div>
  );

  const completed = bookings.filter(b => b.status === "completed").length;
  const avgTicket = completed > 0 ? (adminStats?.totalRevenue || 0) / completed : 0;

  const exportCSV = () => {
    const rows = [
      ["Referência", "Passageiro", "Origem", "Destino", "Data", "Categoria", "Preço Total", "Ganho Motorista", "Taxa Plataforma", "Status"],
      ...bookings.map(b => [
        b.reference,
        b.passenger?.name || "",
        b.origin,
        b.destination,
        b.pickupDate,
        b.category,
        b.totalPrice,
        b.driverAmount || 0,
        b.platformFee || 0,
        b.status,
      ])
    ];
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexrice-relatorio-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extralight text-white italic tracking-tighter">Relatórios</h1>
          <p className="text-white/30 text-sm mt-1">Análise de performance e métricas operacionais</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gold/10 border border-brand-gold/20 text-[10px] font-black text-brand-gold hover:bg-brand-gold hover:text-black uppercase tracking-widest transition-all">
          <Download className="w-3.5 h-3.5" /> Exportar CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Receita Total", value: formatCurrency(adminStats?.totalRevenue || 0), icon: DollarSign, gold: true, trend: "+12%" },
          { label: "Lucro Líquido", value: formatCurrency(adminStats?.platformProfit || 0), icon: TrendingUp, emerald: true, trend: "+8%" },
          { label: "Viagens Concluídas", value: String(completed), icon: Activity },
          { label: "Ticket Médio", value: formatCurrency(avgTicket), icon: Car },
        ].map(({ label, value, icon: Icon, gold, emerald, trend }) => (
          <div key={label} className="px-5 py-4 rounded-2xl relative overflow-hidden"
            style={{
              background: gold ? "rgba(212,175,55,0.06)" : emerald ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.025)",
              border: gold ? "1px solid rgba(212,175,55,0.15)" : emerald ? "1px solid rgba(52,211,153,0.12)" : "1px solid rgba(255,255,255,0.06)"
            }}>
            <div className="flex items-center justify-between mb-3">
              <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center",
                gold ? "bg-brand-gold/10 text-brand-gold" : emerald ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              {trend && (
                <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" />{trend}
                </span>
              )}
            </div>
            <p className={cn("text-2xl font-light tracking-tight", gold ? "text-brand-gold" : emerald ? "text-emerald-400" : "text-white")}>{value}</p>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Gráfico */}
      <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-white">Tendência de Receita</h2>
            <p className="text-[9px] text-white/30 mt-0.5">Últimos 6 meses</p>
          </div>
          <div className="flex items-center gap-4 text-[8px] font-black uppercase text-white/25">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-brand-gold" /> Receita</div>
          </div>
        </div>
        <div className="flex items-end gap-3 h-40">
          {MOCK_DATA.map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full rounded-t-xl overflow-hidden" style={{ height: "120px", background: "rgba(255,255,255,0.04)" }}>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(val / MAX) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="w-full rounded-t-xl mt-auto"
                  style={{ background: "linear-gradient(180deg, #D4AF37 0%, rgba(212,175,55,0.4) 100%)", marginTop: `${100 - (val / MAX) * 100}%` }}
                />
              </div>
              <span className="text-[8px] font-black text-white/25 uppercase">{MONTHS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Distribuição por categoria */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-sm font-bold text-white mb-4">Por Categoria</h2>
          <div className="space-y-3">
            {["comfort", "executive", "smart", "group"].map((cat) => {
              const count = bookings.filter(b => b.category === cat).length;
              const pct = bookings.length > 0 ? Math.round((count / bookings.length) * 100) : 0;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-[9px] font-black uppercase text-white/40 w-20 flex-shrink-0">{cat}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }}
                      className="h-full rounded-full bg-brand-gold/60" />
                  </div>
                  <span className="text-[9px] font-bold text-white/40 w-8 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-sm font-bold text-white mb-4">Resumo Operacional</h2>
          <div className="space-y-3">
            {[
              { label: "Total de Reservas", value: bookings.length },
              { label: "Viagens Concluídas", value: completed },
              { label: "Motoristas Ativos", value: drivers?.length || 0 },
              { label: "Taxa de Conclusão", value: `${bookings.length > 0 ? Math.round((completed / bookings.length) * 100) : 0}%` },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2.5 px-3 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <span className="text-[10px] font-semibold text-white/45">{label}</span>
                <span className="text-sm font-bold text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
