"use client";

import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Calendar, DollarSign, Users, TrendingUp,
  ArrowRight, Plus, Building2,
} from "lucide-react";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { usePartner } from "@/hooks/usePartner";
import { useEffect } from "react";

export default function ParceiroDashboard() {
  const { dashboard, bookings, loading, fetchBookings } = usePartner();

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-gold to-gold-600 flex items-center justify-center shadow-lg shadow-brand-gold/20">
              <Building2 className="w-5 h-5 text-black" />
            </div>
            <span className="px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
              Parceiro
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Painel de Parceiros</h1>
          <p className="text-white/40 text-sm mt-2">
            {dashboard?.organization || "MOVNLY Partner"} · {new Date().toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
          </p>
        </div>
        <Link href="/parceiros/reservas/nova" className="px-6 py-3 bg-brand-gold text-black text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:shadow-[0_20px_50px_-10px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-all duration-500 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nova reserva
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Reservas este mês", value: loading ? "—" : String(dashboard?.bookingsThisMonth ?? 0), icon: Calendar, color: "brand" },
          { label: "Receita gerada", value: loading ? "—" : formatCurrency(dashboard?.revenueGenerated ?? 0), icon: TrendingUp, color: "emerald" },
          { label: "Comissões ganhas", value: loading ? "—" : formatCurrency(dashboard?.commissionsEarned ?? 0), icon: DollarSign, color: "amber" },
          { label: "Convidados servidos", value: loading ? "—" : String(dashboard?.guestsServed ?? 0), icon: Users, color: "purple" },
        ].map(({ label, value, icon: Icon, color }) => {
          const cls = {
            brand: "bg-brand-gold/10 text-brand-gold border-brand-gold/20",
            emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
            amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          }[color]!;
          return (
            <div key={label} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl ${cls} flex items-center justify-center mb-4 shadow-lg`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-3xl font-black text-white">{value}</div>
              <div className="text-xs text-white/40 mt-1 uppercase tracking-wider">{label}</div>
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl border border-brand-gold/20 bg-gradient-to-br from-brand-gold/5 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-white">Comissão mensal</p>
            <p className="text-sm text-white/40 mt-1">
              Taxa: {dashboard?.commissionRate ?? 10}% por reserva
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-white">{formatCurrency(dashboard?.commissionsEarned ?? 0)}</p>
            <span className="px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-2 inline-block">
              Em processamento
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Reservas recentes</h2>
          <Link href="/parceiros/reservas" className="text-xs text-brand-gold hover:text-white flex items-center gap-2 font-medium uppercase tracking-wider transition-colors">
            Ver todas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden">
          {recentBookings.length === 0 ? (
            <p className="p-12 text-white/40 text-sm text-center">Nenhuma reserva ainda. Crie a primeira para um convidado.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {["Convidado", "Rota", "Data", "Categoria", "Valor", "Comissão", "Estado"].map((h) => (
                    <th key={h} className="text-left text-[0.7rem] font-bold text-white/30 uppercase px-5 py-4 first:pl-6 last:pr-6" style={{ letterSpacing: "0.1em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 pl-6">
                      <p className="text-sm font-medium text-white">{b.passengerData?.name || "Convidado"}</p>
                      <p className="text-xs text-white/30 font-mono">{b.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-white/60">{b.from} → {b.to}</td>
                    <td className="px-5 py-4 text-sm text-white/50">{formatDate(b.pickupTime)}</td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-wider bg-brand-gold/10 text-brand-gold border border-brand-gold/20">{b.category}</span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-white">{formatCurrency(b.price || 0)}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-yellow-400">{formatCurrency(b.partnerCommission || 0)}</td>
                    <td className="px-5 py-4 pr-6">
                      <BookingStatusBadge status={b.status.toLowerCase() as any} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
