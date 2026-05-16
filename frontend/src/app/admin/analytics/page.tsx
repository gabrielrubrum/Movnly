"use client";

import { useFinances } from "@/hooks/useFinances";
import { useBookings } from "@/hooks/useBookings";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, DollarSign, Car, Activity, Loader2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useMemo } from "react";

export default function AnalyticsPage() {
  const { adminStats, loading: fLoading } = useFinances();
  const { bookings, drivers, loading: bLoading } = useBookings();

  const monthlyData = useMemo(() => {
    const now = new Date();
    const months: { label: string; key: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      const raw = d.toLocaleDateString("pt-PT", { month: "short" }).replace(".", "");
      months.push({ label: raw.charAt(0).toUpperCase() + raw.slice(1), key, value: 0 });
    }
    bookings.forEach((b: any) => {
      const key = b.pickupDate?.slice(0, 7);
      const m = months.find((mo) => mo.key === key);
      if (m) m.value += b.totalPrice || 0;
    });
    return months;
  }, [bookings]);

  const maxVal = Math.max(...monthlyData.map((m) => m.value), 1);

  if (fLoading || bLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
    </div>
  );

  const completed = bookings.filter((b: any) => b.status === "completed").length;
  const totalRevenue = adminStats?.totalRevenue || 0;
  const avgTicket = bookings.length > 0 ? totalRevenue / bookings.length : 0;

  const exportCSV = () => {
    const rows = [
      ["Ref", "Passageiro", "Origem", "Destino", "Data", "Categoria", "Preco", "Motorista", "Taxa", "Status"],
      ...bookings.map((b: any) => [
        b.reference, b.passenger?.name || "", b.origin, b.destination,
        b.pickupDate, b.category, b.totalPrice, b.driverAmount || 0, b.platformFee || 0, b.status,
      ])
    ];
    const csv = rows.map((r) => r.map((v: any) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `movnly-relatorio-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Relatórios</h1>
          <p className="text-white/30 text-sm mt-1">Análise de performance e métricas operacionais</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gold/10 border border-brand-gold/20 text-[10px] font-black text-brand-gold hover:bg-brand-gold hover:text-black uppercase tracking-widest transition-all">
          <Download className="w-3.5 h-3.5" /> Exportar CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Receita Total", value: formatCurrency(totalRevenue), icon: DollarSign, gold: true },
          { label: "Lucro Plataforma", value: formatCurrency(adminStats?.platformProfit || 0), icon: TrendingUp, emerald: true },
          { label: "Total Reservas", value: String(bookings.length), icon: Activity },
          { label: "Ticket Médio", value: formatCurrency(avgTicket), icon: Car },
        ].map(({ label, value, icon: Icon, gold, emerald }: any) => (
          <div key={label} className="px-5 py-4 rounded-2xl"
            style={{ background: gold ? "rgba(212,175,55,0.06)" : emerald ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.025)", border: gold ? "1px solid rgba(212,175,55,0.15)" : emerald ? "1px solid rgba(52,211,153,0.12)" : "1px solid rgba(255,255,255,0.06)" }}>
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-3", gold ? "bg-brand-gold/10 text-brand-gold" : emerald ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30")}>
              <Icon className="w-4 h-4" />
            </div>
            <p className={cn("text-2xl font-light tracking-tight", gold ? "text-brand-gold" : emerald ? "text-emerald-400" : "text-white")}>{value}</p>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-sm font-bold text-white">Receita por Mês</h2>
            <p className="text-[9px] text-white/30 mt-0.5">Últimos 6 meses · dados reais</p>
          </div>
          <div className="flex items-center gap-1.5 text-[8px] font-black uppercase text-white/25">
            <div className="w-2 h-2 rounded-full bg-brand-gold" /> Receita
          </div>
        </div>
        <div className="flex items-end gap-3 h-40">
          {monthlyData.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-[8px] font-bold text-white/40 tabular-nums">{m.value > 0 ? formatCurrency(m.value) : ""}</span>
              <div className="w-full relative" style={{ height: "100px", background: "rgba(255,255,255,0.04)", borderRadius: "8px 8px 0 0" }}>
                <motion.div initial={{ height: 0 }} animate={{ height: `${(m.value / maxVal) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                  className="w-full absolute bottom-0"
                  style={{ borderRadius: "8px 8px 0 0", background: m.value > 0 ? "linear-gradient(180deg, #D4AF37 0%, rgba(212,175,55,0.4) 100%)" : "rgba(255,255,255,0.06)" }} />
              </div>
              <span className="text-[8px] font-black text-white/25 uppercase">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h2 className="text-sm font-bold text-white mb-4">Por Categoria</h2>
          <div className="space-y-3">
            {["comfort", "executive", "smart", "group"].map((cat) => {
              const count = bookings.filter((b: any) => b.category === cat).length;
              const pct = bookings.length > 0 ? Math.round((count / bookings.length) * 100) : 0;
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-[9px] font-black uppercase text-white/40 w-20 flex-shrink-0">{cat}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-brand-gold/60" />
                  </div>
                  <span className="text-[9px] font-bold text-white/40 w-14 text-right">{count} ({pct}%)</span>
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
              { label: "Em Curso", value: bookings.filter((b: any) => ["on_route","driver_assigned","in_progress"].includes(b.status)).length },
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
