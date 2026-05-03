"use client";

import { useFinances } from "@/hooks/useFinances";
import { useBookings } from "@/hooks/useBookings";
import { formatCurrency } from "@/lib/utils";
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownLeft, Loader2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PaymentsPage() {
  const { adminStats, loading: financesLoading } = useFinances();
  const { bookings, loading: bookingsLoading } = useBookings();

  const loading = financesLoading || bookingsLoading;

  const paid = bookings.filter(b => b.paymentStatus === "paid" || (b.paymentStatus as string) === "PAID");
  const pending = bookings.filter(b => b.paymentStatus !== "paid" && (b.paymentStatus as string) !== "PAID" && b.status !== "cancelled");

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Pagamentos</h1>
          <p className="text-white/30 text-sm mt-1">Gestão financeira e transações</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-all">
          <Download className="w-3.5 h-3.5" /> Exportar
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: "Receita Total", value: formatCurrency(adminStats?.totalRevenue || 0), sub: "todas as viagens pagas", gold: true },
          { label: "Lucro Plataforma", value: formatCurrency(adminStats?.platformProfit || 0), sub: "após motoristas", emerald: true },
          { label: "Pagamentos Pendentes", value: String(pending.length), sub: "aguardam confirmação" },
        ].map(({ label, value, sub, gold, emerald }) => (
          <div key={label} className="px-5 py-4 rounded-2xl"
            style={{
              background: gold ? "rgba(212,175,55,0.06)" : emerald ? "rgba(52,211,153,0.05)" : "rgba(255,255,255,0.025)",
              border: gold ? "1px solid rgba(212,175,55,0.15)" : emerald ? "1px solid rgba(52,211,153,0.12)" : "1px solid rgba(255,255,255,0.06)"
            }}>
            <p className={cn("text-2xl font-light tracking-tight", gold ? "text-brand-gold" : emerald ? "text-emerald-400" : "text-white")}>{value}</p>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-1">{label}</p>
            <p className="text-[9px] text-white/20 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Distribuição */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h2 className="text-sm font-bold text-white">Distribuição de Lucro</h2>
          <p className="text-[9px] text-white/30 mt-0.5">{formatCurrency(adminStats?.platformProfit || 0)} de lucro total</p>
        </div>
        <div className="p-5 space-y-3">
          {[
            { label: "NexRice (60%)", value: adminStats?.ownerShare || 0, pct: 60, gold: true },
            { label: "Parceiro A (20%)", value: adminStats?.partnerAShare || 0, pct: 20 },
            { label: "Parceiro B (20%)", value: adminStats?.partnerBShare || 0, pct: 20 },
          ].map(({ label, value, pct, gold }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="w-32 flex-shrink-0">
                <p className={cn("text-xs font-semibold", gold ? "text-brand-gold" : "text-white/50")}>{label}</p>
              </div>
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: gold ? "linear-gradient(90deg, #D4AF37, #C5A028)" : "rgba(255,255,255,0.2)" }} />
              </div>
              <span className={cn("text-sm font-bold tabular-nums w-20 text-right", gold ? "text-brand-gold" : "text-white/50")}>{formatCurrency(value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ganhos por motorista */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h2 className="text-sm font-bold text-white">Ganhos por Motorista</h2>
          <p className="text-[9px] text-white/30 mt-0.5">Valor acumulado por viagens concluídas</p>
        </div>
        <div>
          {bookings
            .filter(b => b.driver && b.status === "completed")
            .reduce((acc: any[], b) => {
              const existing = acc.find(x => x.driverId === b.driver?.id);
              if (existing) {
                existing.total += b.driverAmount || 0;
                existing.trips += 1;
              } else {
                acc.push({ driverId: b.driver?.id, name: b.driver?.name, total: b.driverAmount || 0, trips: 1 });
              }
              return acc;
            }, [])
            .sort((a, b) => b.total - a.total)
            .map((d, i, arr) => (
              <div key={d.driverId} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.025] transition-all"
                style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-gold font-black text-sm flex-shrink-0"
                  style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.15)" }}>
                  {d.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/80">{d.name}</p>
                  <p className="text-[9px] text-white/30 mt-0.5">{d.trips} viagem{d.trips !== 1 ? "s" : ""} concluída{d.trips !== 1 ? "s" : ""}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-brand-gold tabular-nums">{formatCurrency(d.total)}</p>
                  <p className="text-[8px] text-white/25 mt-0.5">ganho acumulado</p>
                </div>
              </div>
            ))}
          {bookings.filter(b => b.driver && b.status === "completed").length === 0 && (
            <div className="flex flex-col items-center py-10 gap-2">
              <p className="text-white/20 text-xs italic">Sem viagens concluídas ainda.</p>
            </div>
          )}
        </div>
      </div>

      {/* Transações recentes */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h2 className="text-sm font-bold text-white">Reservas Pagas</h2>
          <p className="text-[9px] text-white/30 mt-0.5">{paid.length} transações confirmadas</p>
        </div>
        <div>
          {paid.slice(0, 10).map((b, i) => (
            <div key={b.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.025] transition-all"
              style={{ borderBottom: i < Math.min(paid.length, 10) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white/80 truncate">{b.origin?.split(",")[0]} → {b.destination?.split(",")[0]}</p>
                <p className="text-[9px] text-white/30 mt-0.5">{b.passenger?.name} · {b.pickupDate}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-white tabular-nums">{formatCurrency(b.totalPrice)}</p>
                <p className="text-[8px] text-emerald-400 font-black uppercase mt-0.5">Pago</p>
              </div>
            </div>
          ))}
          {paid.length === 0 && (
            <div className="flex flex-col items-center py-12 gap-2">
              <DollarSign className="w-8 h-8 text-white/5" />
              <p className="text-white/20 text-sm italic">Sem pagamentos ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
