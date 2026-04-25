"use client";

import { useBookings } from "@/hooks/useBookings";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { formatCurrency } from "@/lib/utils";
import { type BookingStatus } from "@/lib/types";
import { Search, Filter, MoreHorizontal, Loader2 } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const ALL_STATUSES: BookingStatus[] = ["confirmed", "driver_assigned", "driver_en_route", "in_progress", "completed", "cancelled"];

export default function AdminBookingsPage() {
  const { bookings, loading } = useBookings();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");

  const filtered = bookings.filter((b) => {
    const matchSearch = !search || [b.reference, b.origin, b.destination, b.passenger.name].some((v) =>
      v.toLowerCase().includes(search.toLowerCase())
    );
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-indigo-400 animate-spin" /></div>;

  return (
    <div className="relative px-6 md:px-8 xl:px-12 py-8 max-w-[2000px] mx-auto space-y-10 min-h-screen w-full">
      {/* Ambient Premium Glows */}
      <div className="absolute top-0 right-1/4 w-[800px] h-[400px] bg-brand-500/10 blur-[120px] rounded-full pointer-events-none -z-10 mix-blend-screen" />

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight italic">Gestão de Reservas</h1>
          <p className="text-white/40 text-sm mt-1">Acompanhamento detalhado de todas as viagens e logística da frota.</p>
        </div>
        <Link href="/book" className="nx-btn nx-btn-primary">Nova reserva</Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-surface-1/50 border border-white/[0.05] p-5 rounded-3xl shadow-2xl backdrop-blur-xl">
        <div className="relative flex-1 min-w-[250px] lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <input
            className="nx-input pl-10 !py-2.5"
            placeholder="Pesquisar por referência, nome, trajeto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${statusFilter === "all" ? "bg-white/10 text-white border border-white/20" : "text-white/40 hover:bg-white/5 border border-transparent"}`}
          >
            Todas ({bookings.length})
          </button>
          {ALL_STATUSES.map((s) => {
            const count = bookings.filter((b) => b.status === s).length;
            if (!count) return null;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 text-[0.65rem] uppercase font-black tracking-widest rounded-xl transition-all ${statusFilter === s ? "bg-brand-500/20 text-brand-300 border border-brand-500/30" : "text-white/40 hover:bg-white/5 border border-transparent"}`}
              >
                {s.replace(/_/g, " ")} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-col gap-3">
        {/* Headers */}
        <div className="hidden lg:grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr_1fr_auto] gap-4 px-8 py-3 text-[0.65rem] font-bold text-white/30 uppercase tracking-[0.2em]">
          <div>ID Reserva</div>
          <div>Dados do Passageiro</div>
          <div>Trajeto</div>
          <div>Estado</div>
          <div>Horário</div>
          <div>Valor Total</div>
          <div></div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-center bg-white/[0.02] border border-white/[0.05] rounded-[2rem] shadow-inner">
            <span className="text-white/50 font-bold mb-2">Nenhuma reserva encontrada para estes filtros.</span>
          </div>
        ) : (
          filtered.map((b) => (
            <div key={b.id} className="group grid grid-cols-1 lg:grid-cols-[1fr_2fr_1.5fr_1fr_1fr_1fr_auto] items-center gap-4 px-8 py-5 bg-gradient-to-r from-white/[0.03] to-white/[0.01] hover:from-white/[0.05] hover:to-white/[0.02] border border-white/[0.05] hover:border-white/10 shadow-lg shadow-black/50 rounded-2xl transition-all backdrop-blur-md">

              <div className="flex items-center">
                <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 shadow-inner">
                  <span className="text-xs font-mono font-bold text-white/80">{b.reference}</span>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <p className="text-[0.95rem] font-bold text-white/90">{b.passenger.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-white/40">{b.passenger.email}</span>
                </div>
              </div>

              <div className="flex flex-col justify-center">
                <p className="text-sm font-bold text-white/80 truncate tracking-tight">{b.origin} <span className="text-white/20 mx-1.5 font-normal">→</span> {b.destination}</p>
              </div>

              <div className="flex items-center">
                <BookingStatusBadge status={b.status} />
              </div>

              <div className="flex flex-col justify-center">
                <span className="text-[0.9rem] font-bold text-white/90">{b.pickupTime}</span>
                <span className="text-[0.65rem] font-semibold tracking-widest text-white/40 mt-0.5 uppercase">{b.pickupDate}</span>
              </div>

              <div className="flex flex-col justify-center">
                <span className="text-[1.1rem] font-black text-white tracking-tight">{formatCurrency(b.totalPrice)}</span>
              </div>

              <div className="flex items-center justify-end">
                <Link href={`/admin/bookings/${b.id}`} className="text-[0.7rem] uppercase tracking-widest text-brand-400 font-black hover:text-brand-300 py-2 transition-colors">
                  Detalhes
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="text-[0.65rem] font-mono tracking-widest text-white/25 text-right">{filtered.length} reserva{filtered.length !== 1 ? "s" : ""} ativa{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
