"use client";

import { useBookings } from "@/hooks/useBookings";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { formatCurrency } from "@/lib/utils";
import { type BookingStatus } from "@/lib/types";
import { Search, Loader2, ChevronRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const STATUSES: BookingStatus[] = ["confirmed", "driver_assigned", "driver_en_route", "in_progress", "completed", "cancelled"];

export default function AdminBookingsPage() {
  const { bookings, loading } = useBookings();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">("all");

  const filtered = bookings.filter((b) => {
    const matchSearch = !search || [b.reference, b.origin, b.destination, b.passenger.name]
      .some(v => v.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extralight text-white italic tracking-tighter">Reservas</h1>
        <p className="text-white/30 text-sm mt-1">{bookings.length} reservas no sistema</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
          <input
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-gold/30 transition-colors"
            placeholder="Pesquisar reserva, passageiro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-2 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all ${
              statusFilter === "all"
                ? "bg-brand-gold text-black"
                : "text-white/40 hover:text-white bg-white/[0.03] border border-white/[0.06]"
            }`}
          >
            Todas ({bookings.length})
          </button>
          {STATUSES.map((s) => {
            const count = bookings.filter(b => b.status === s).length;
            if (!count) return null;
            return (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 text-[10px] font-black rounded-xl uppercase tracking-widest transition-all ${
                  statusFilter === s
                    ? "bg-brand-gold text-black"
                    : "text-white/40 hover:text-white bg-white/[0.03] border border-white/[0.06]"
                }`}
              >
                {s.replace(/_/g, " ")} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>

        {/* Header row */}
        <div className="hidden lg:grid grid-cols-[120px_1fr_1.5fr_140px_120px_100px_80px] gap-4 px-6 py-3 text-[9px] font-black text-white/25 uppercase tracking-widest" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div>Referência</div>
          <div>Passageiro</div>
          <div>Trajeto</div>
          <div>Estado</div>
          <div>Horário</div>
          <div>Valor</div>
          <div></div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Search className="w-10 h-10 text-white/5" />
            <p className="text-white/20 text-sm italic">Nenhuma reserva encontrada.</p>
          </div>
        ) : filtered.map((b, i) => {
          const isActive = b.status === 'on_route' || b.status === 'confirmed';
          const isDone = b.status === 'completed';
          return (
            <div key={b.id}
              className="grid grid-cols-1 lg:grid-cols-[120px_1fr_1.5fr_140px_120px_100px_80px] items-center gap-4 px-6 py-4 hover:bg-white/[0.025] transition-all group"
              style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
            >
              {/* Ref */}
              <div className="flex items-center gap-2">
                <div className="w-1 h-8 rounded-full flex-shrink-0"
                  style={{ background: isActive ? "rgba(212,175,55,0.6)" : isDone ? "rgba(52,211,153,0.6)" : "rgba(255,255,255,0.1)" }} />
                <span className="text-xs font-mono font-bold text-white/60 group-hover:text-white/80 transition-colors">{b.reference}</span>
              </div>

              {/* Passageiro */}
              <div>
                <p className="text-sm font-semibold text-white/80 group-hover:text-white transition-colors">{b.passenger.name}</p>
                <p className="text-[9px] text-white/30 mt-0.5">{b.passenger.email}</p>
              </div>

              {/* Trajeto */}
              <div>
                <p className="text-sm text-white/70 truncate">
                  {b.origin.split(",")[0]}
                  <span className="text-white/25 mx-1.5 text-xs">→</span>
                  {b.destination.split(",")[0]}
                </p>
                <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded mt-1 inline-block" style={{ background: "rgba(212,175,55,0.08)", color: "rgba(212,175,55,0.6)" }}>{b.category}</span>
              </div>

              {/* Status */}
              <div>
                <BookingStatusBadge status={b.status} />
              </div>

              {/* Horário */}
              <div>
                <p className="text-sm font-semibold text-white/70">{b.pickupTime}</p>
                <p className="text-[9px] text-white/30 mt-0.5">{b.pickupDate}</p>
              </div>

              {/* Valor */}
              <div>
                <span className="text-sm font-bold text-white tabular-nums">{formatCurrency(b.totalPrice)}</span>
              </div>

              {/* Ação */}
              <div className="flex justify-end">
                <Link href={`/admin/bookings/${b.id}`}
                  className="flex items-center gap-1 text-[9px] font-black text-white/25 hover:text-brand-gold uppercase tracking-widest transition-colors">
                  Ver <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[9px] font-mono text-white/20 text-right">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
}
