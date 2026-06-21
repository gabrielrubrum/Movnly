"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { Plus, ArrowLeft } from "lucide-react";
import type { PartnerBooking } from "@/hooks/usePartner";

export default function ParceiroReservasPage() {
  const [bookings, setBookings] = useState<PartnerBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/partners/bookings")
      .then(({ data }) => setBookings(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/parceiros" className="text-xs text-white/40 hover:text-white flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Dashboard
          </Link>
          <h1 className="text-2xl font-black text-white">Reservas</h1>
          <p className="text-white/40 text-sm mt-1">Todas as reservas criadas pelo seu estabelecimento</p>
        </div>
        <Link href="/parceiros/reservas/nova" className="nx-btn nx-btn-primary nx-btn-sm flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Nova reserva
        </Link>
      </div>

      <div className="nx-card overflow-hidden">
        {loading ? (
          <p className="p-8 text-white/40 text-sm">A carregar reservas...</p>
        ) : bookings.length === 0 ? (
          <p className="p-8 text-white/40 text-sm">Nenhuma reserva encontrada.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {["Convidado", "Rota", "Data", "Categoria", "Valor", "Comissão", "Estado"].map((h) => (
                  <th key={h} className="text-left text-[0.65rem] font-bold text-white/25 uppercase px-4 py-3 first:pl-5 last:pr-5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {bookings.map((b) => (
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
  );
}
