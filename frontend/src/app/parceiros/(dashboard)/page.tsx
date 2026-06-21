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
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-[9px] bg-gradient-to-br from-brand-gold to-gold-600 flex items-center justify-center shadow-brand-sm">
              <Building2 className="w-4 h-4 text-black" />
            </div>
            <span className="nx-badge nx-badge-purple">Parceiro</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Painel de Parceiros</h1>
          <p className="text-white/40 text-sm mt-1">
            {dashboard?.organization || "MOVNLY Partner"} · {new Date().toLocaleDateString("pt-PT", { month: "long", year: "numeric" })}
          </p>
        </div>
        <Link href="/parceiros/reservas/nova" className="nx-btn nx-btn-primary nx-btn-sm flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          Nova reserva
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Reservas este mês", value: loading ? "—" : String(dashboard?.bookingsThisMonth ?? 0), icon: Calendar, color: "brand" },
          { label: "Receita gerada", value: loading ? "—" : formatCurrency(dashboard?.revenueGenerated ?? 0), icon: TrendingUp, color: "emerald" },
          { label: "Comissões ganhas", value: loading ? "—" : formatCurrency(dashboard?.commissionsEarned ?? 0), icon: DollarSign, color: "amber" },
          { label: "Convidados servidos", value: loading ? "—" : String(dashboard?.guestsServed ?? 0), icon: Users, color: "purple" },
        ].map(({ label, value, icon: Icon, color }) => {
          const cls = {
            brand: "bg-brand-gold/10 text-brand-gold border-brand-gold/15",
            emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/15",
            amber: "bg-amber-500/10 text-amber-400 border-amber-500/15",
            purple: "bg-purple-500/10 text-purple-400 border-purple-500/15",
          }[color]!.split(" ");
          return (
            <div key={label} className="nx-card p-5">
              <div className={`w-9 h-9 rounded-xl ${cls[0]} border ${cls[2]} flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${cls[1]}`} />
              </div>
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-xs text-white/35 mt-0.5">{label}</div>
            </div>
          );
        })}
      </div>

      <div className="p-5 rounded-2xl border border-yellow-500/15"
        style={{ background: "linear-gradient(135deg, rgba(201,162,39,0.08) 0%, rgba(201,162,39,0.02) 100%)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Comissão mensal</p>
            <p className="text-xs text-white/40 mt-0.5">
              Taxa: {dashboard?.commissionRate ?? 10}% por reserva
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-white">{formatCurrency(dashboard?.commissionsEarned ?? 0)}</p>
            <span className="nx-badge nx-badge-amber mt-1 inline-flex">Em processamento</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Reservas recentes</h2>
          <Link href="/parceiros/reservas" className="text-xs text-brand-gold hover:text-gold-300 flex items-center gap-1 font-medium">
            Ver todas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="nx-card overflow-hidden">
          {recentBookings.length === 0 ? (
            <p className="p-8 text-white/40 text-sm text-center">Nenhuma reserva ainda. Crie a primeira para um convidado.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {["Convidado", "Rota", "Data", "Categoria", "Valor", "Comissão", "Estado"].map((h) => (
                    <th key={h} className="text-left text-[0.65rem] font-bold text-white/25 uppercase px-4 py-3 first:pl-5 last:pr-5" style={{ letterSpacing: "0.08em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3.5 pl-5">
                      <p className="text-sm font-medium text-white">{b.passengerData?.name || "Convidado"}</p>
                      <p className="text-xs text-white/30 font-mono">{b.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-white/60">{b.from} → {b.to}</td>
                    <td className="px-4 py-3.5 text-sm text-white/50">{formatDate(b.pickupTime)}</td>
                    <td className="px-4 py-3.5">
                      <span className="nx-badge nx-badge-brand capitalize">{b.category}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-white">{formatCurrency(b.price || 0)}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-yellow-400">{formatCurrency(b.partnerCommission || 0)}</td>
                    <td className="px-4 py-3.5 pr-5">
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
