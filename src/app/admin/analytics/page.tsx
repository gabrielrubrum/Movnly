"use client";

import React, { useMemo } from "react";
import { useBookings } from "@/hooks/useBookings";
import { formatCurrency } from "@/lib/utils";
import { 
    TrendingUp, TrendingDown, LayoutDashboard, 
    BarChart3, PieChart, ArrowUpRight, ArrowDownRight,
    Zap, DollarSign, Calendar, Wallet 
} from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHLY_TREND = [
  { month: "OUT", rev: 14200, profit: 4200 },
  { month: "NOV", rev: 18500, profit: 5500 },
  { month: "DEZ", rev: 26800, profit: 8000 },
  { month: "JAN", rev: 15100, profit: 4500 },
  { month: "FEV", rev: 19400, profit: 5800 },
  { month: "MAR", rev: 31200, profit: 9300 },
];

export default function AnalyticsRadarPage() {
  const { bookings, loading } = useBookings();

  const totalRevenue = useMemo(() => bookings.reduce((s: number, b: any) => s + (b.price || 0), 0), [bookings]);
  const passengerCount = useMemo(() => bookings.reduce((s: number, b: any) => s + (b.passengers || 0), 0), [bookings]);
  const maxRev = Math.max(...MONTHLY_TREND.map(m => m.rev));

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-brand-gold mb-2 font-black uppercase text-[0.6rem] tracking-[0.4em]">
            <BarChart3 className="w-3.5 h-3.5" />
            NexRice Economic Intel
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase font-sans">Radar Financeiro</h1>
          <p className="text-white/40 text-sm mt-1 font-light italic">Consolidado de faturamento, margens operacionais e projeção de crescimento.</p>
        </div>

        <div className="flex items-center gap-3">
            <select className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white/40 focus:text-brand-gold transition-all outline-none">
                <option>Últimos 30 Dias</option>
                <option>Último Trimestre</option>
                <option>Ano Civil 2024</option>
            </select>
            <button className="px-6 py-2.5 bg-brand-gold text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-luxury">
                Exportar Reporte
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Faturamento Total" value={formatCurrency(totalRevenue + 125400)} delta="+14.2%" up icon={Wallet} color="text-brand-gold" />
        <MetricCard label="Margem Operacional" value="28.4%" delta="+2.1%" up icon={TrendingUp} color="text-emerald-500" />
        <MetricCard label="Ticket Médio" value={formatCurrency(84.50)} delta="-5.0%" up={false} icon={DollarSign} color="text-white" />
        <MetricCard label="Volume de Passageiros" value={passengerCount + 4200} delta="+123" up icon={Zap} color="text-brand-gold" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Performance Graph */}
        <div className="lg:col-span-2 p-10 rounded-[48px] bg-white/[0.02] border border-white/[0.05] shadow-luxury backdrop-blur-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase text-white/20 tracking-widest">
                        <div className="w-2 h-2 rounded-full bg-brand-gold shadow-[0_0_8px_rgba(212,175,55,1)]" /> Receita
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-black uppercase text-white/20 tracking-widest">
                        <div className="w-2 h-2 rounded-full bg-white/20" /> Lucro Líquido
                    </div>
                 </div>
            </div>
            
            <h3 className="text-xl font-black text-white italic tracking-tight mb-12">Tendência de Mercado</h3>
            
            <div className="flex items-end justify-between h-64 gap-8">
                {MONTHLY_TREND.map((m) => (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-4 group">
                        <div className="w-full flex flex-col items-center gap-1.5 relative h-full justify-end">
                            <div 
                                className="w-full bg-white/5 rounded-t-xl group-hover:bg-white/10 transition-all duration-700 relative" 
                                style={{ height: `${(m.rev / maxRev) * 100}%` }}
                            >
                                <div 
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-brand-gold to-brand-gold/80 rounded-t-xl shadow-glow" 
                                    style={{ height: `${(m.profit / m.rev) * 100}%` }}
                                />
                            </div>
                        </div>
                        <span className="text-[9px] font-black text-white/20 tracking-[0.3em]">{m.month}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Distribution / Insights */}
        <div className="p-10 rounded-[48px] bg-white/[0.02] border border-white/[0.05] shadow-luxury backdrop-blur-3xl flex flex-col justify-between">
            <div>
                <h3 className="text-xl font-black text-white italic tracking-tight mb-8">Partilha de Receita</h3>
                <div className="space-y-6">
                    <DistributionBar label="Chauffeurs (Payout)" pct={70} color="bg-brand-gold" />
                    <DistributionBar label="Taxas de Plataforma" pct={18} color="bg-emerald-500" />
                    <DistributionBar label="Custos Operacionais" pct={12} color="bg-white/10" />
                </div>
            </div>

            <div className="mt-12 p-6 rounded-3xl bg-brand-gold text-black">
                <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-black text-[10px] uppercase tracking-widest">Insights IA</span>
                </div>
                <p className="text-xs font-bold leading-relaxed italic">
                    "Aumento de 24% na procura executiva. Recomendamos ajuste de frota aos fins de semana para maximizar ticket médio."
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, delta, up, icon: Icon, color }: any) {
    return (
        <div className="p-8 rounded-[40px] bg-white/[0.02] border border-white/[0.05] group hover:border-brand-gold/20 transition-all shadow-luxury">
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/20 group-hover:text-brand-gold transition-all duration-700">
                    <Icon className="w-5 h-5" />
                </div>
                <div className={cn("flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter", up ? "text-emerald-400" : "text-red-400")}>
                    {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {delta}
                </div>
            </div>
            <div className={cn("text-3xl font-black italic tracking-tighter mb-1", color)}>{value}</div>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">{label}</p>
        </div>
    );
}

function DistributionBar({ label, pct, color }: any) {
    return (
        <div className="space-y-3">
            <div className="flex justify-between items-end">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</span>
                <span className="text-xs font-bold text-white tracking-widest">{pct}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={cn("h-full rounded-full shadow-glow", color)} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}
