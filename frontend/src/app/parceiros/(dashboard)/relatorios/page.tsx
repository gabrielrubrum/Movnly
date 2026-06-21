"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, BarChart3 } from "lucide-react";

interface MonthlyReport {
  month: string;
  bookings: number;
  revenue: number;
  commission: number;
}

export default function ParceiroRelatoriosPage() {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/partners/reports")
      .then(({ data }) => setReports(data))
      .finally(() => setLoading(false));
  }, []);

  const maxRevenue = Math.max(...reports.map((r) => r.revenue), 1);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/parceiros" className="text-xs text-white/40 hover:text-white flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3 h-3" /> Dashboard
        </Link>
        <h1 className="text-2xl font-black text-white">Relatórios</h1>
        <p className="text-white/40 text-sm mt-1">Desempenho mensal dos últimos 6 meses</p>
      </div>

      {loading ? (
        <p className="text-white/40 text-sm">A carregar relatórios...</p>
      ) : reports.length === 0 ? (
        <div className="nx-card p-12 text-center">
          <BarChart3 className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">Sem dados para exibir.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div key={r.month} className="nx-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-white">{r.month}</span>
                <span className="text-sm text-white/40">{r.bookings} reservas</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-brand-gold/60 rounded-full transition-all"
                  style={{ width: `${(r.revenue / maxRevenue) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/40">Receita</p>
                  <p className="font-semibold text-white">{formatCurrency(r.revenue)}</p>
                </div>
                <div>
                  <p className="text-white/40">Comissão</p>
                  <p className="font-semibold text-yellow-400">{formatCurrency(r.commission)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
