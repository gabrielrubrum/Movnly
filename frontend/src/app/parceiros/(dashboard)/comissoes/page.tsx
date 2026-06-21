"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, DollarSign } from "lucide-react";

interface Commission {
  id: string;
  bookingId: string;
  amount: number;
  rate: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export default function ParceiroComissoesPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/partners/commissions")
      .then(({ data }) => setCommissions(data))
      .finally(() => setLoading(false));
  }, []);

  const total = commissions.reduce((s, c) => s + c.amount, 0);
  const pending = commissions.filter((c) => c.status === "pending").reduce((s, c) => s + c.amount, 0);
  const paid = commissions.filter((c) => c.status === "paid").reduce((s, c) => s + c.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/parceiros" className="text-xs text-white/40 hover:text-white flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3 h-3" /> Dashboard
        </Link>
        <h1 className="text-2xl font-black text-white">Comissões</h1>
        <p className="text-white/40 text-sm mt-1">Histórico de comissões por reserva</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: total, color: "brand" },
          { label: "Pendente", value: pending, color: "amber" },
          { label: "Pago", value: paid, color: "emerald" },
        ].map(({ label, value, color }) => (
          <div key={label} className="nx-card p-5">
            <DollarSign className={`w-4 h-4 mb-2 text-${color === "brand" ? "brand-gold" : color + "-400"}`} />
            <p className="text-2xl font-black text-white">{formatCurrency(value)}</p>
            <p className="text-xs text-white/35">{label}</p>
          </div>
        ))}
      </div>

      <div className="nx-card overflow-hidden">
        {loading ? (
          <p className="p-8 text-white/40 text-sm">A carregar...</p>
        ) : commissions.length === 0 ? (
          <p className="p-8 text-white/40 text-sm">Sem comissões registadas.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {["Reserva", "Taxa", "Valor", "Estado", "Data"].map((h) => (
                  <th key={h} className="text-left text-[0.65rem] font-bold text-white/25 uppercase px-4 py-3 first:pl-5 last:pr-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {commissions.map((c) => (
                <tr key={c.id} className="hover:bg-white/[0.02]">
                  <td className="px-4 py-3.5 pl-5 font-mono text-xs text-white/50">{c.bookingId.slice(0, 8)}</td>
                  <td className="px-4 py-3.5 text-sm text-white/60">{c.rate}%</td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-yellow-400">{formatCurrency(c.amount)}</td>
                  <td className="px-4 py-3.5">
                    <span className={`nx-badge ${c.status === "paid" ? "nx-badge-emerald" : "nx-badge-amber"}`}>
                      {c.status === "paid" ? "Pago" : "Pendente"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 pr-5 text-sm text-white/50">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
