"use client";

import { useBooking, useBookings } from "@/hooks/useBookings";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { formatCurrency } from "@/lib/utils";
import {
  ArrowLeft, Car, CheckCircle2, MapPin, User, Calendar,
  Clock, CreditCard, Navigation, Phone, Mail, Zap, Users, Luggage
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { use } from "react";
import { motion } from "framer-motion";

export default function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const booking = useBooking(resolvedParams.id);
  const { updateStatus, drivers, assignDriver } = useBookings();
  const [selectedDriverId, setSelectedDriverId] = useState("");

  if (!booking) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-2 border-brand-gold/30 border-t-brand-gold rounded-full animate-spin" />
    </div>
  );

  const isActive = ["on_route", "in_progress", "driver_assigned", "driver_en_route"].includes(booking.status);
  const isDone = booking.status === "completed";
  const isPaid = booking.paymentStatus === "paid" || (booking.paymentStatus as string) === "PAID";

  return (
    <div className="max-w-[1100px] mx-auto space-y-6">

      {/* Back + Header */}
      <div className="flex flex-col gap-4">
        <Link href="/admin/bookings"
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-brand-gold transition-colors w-max">
          <ArrowLeft className="w-3.5 h-3.5" /> Voltar às Reservas
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-black text-brand-gold/50 uppercase tracking-[0.4em] mb-1">Reserva</p>
            <h1 className="text-3xl font-bold text-white tracking-tight">#{booking.reference}</h1>
          </div>
          <div className="flex items-center gap-3">
            <BookingStatusBadge status={booking.status} />
            {isActive && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-[9px] font-black text-brand-gold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" /> Ativa
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-4">

        {/* LEFT */}
        <div className="space-y-4">

          {/* Rota */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                <Navigation className="w-3 h-3" /> Rota
              </p>
            </div>
            <div className="p-6 space-y-0">
              <div className="flex gap-4 items-start">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-white/40" />
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                </div>
                <div className="pb-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/25 mb-1">Partida</p>
                  <p className="text-base font-semibold text-white">{booking.origin}</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-brand-gold/50 mb-1">Destino</p>
                  <p className="text-base font-semibold text-white">{booking.destination}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Detalhes da viagem */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                <Calendar className="w-3 h-3" /> Detalhes da Viagem
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px" style={{ background: "rgba(255,255,255,0.04)" }}>
              {[
                { label: "Data", value: booking.pickupDate, icon: Calendar },
                { label: "Hora", value: booking.pickupTime, icon: Clock },
                { label: "Passageiros", value: String(booking.passengers || 1), icon: Users },
                { label: "Categoria", value: booking.category?.toUpperCase(), icon: Car },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="px-5 py-4" style={{ background: "rgba(10,10,15,1)" }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className="w-3 h-3 text-white/20" />
                    <p className="text-[8px] font-black uppercase tracking-widest text-white/25">{label}</p>
                  </div>
                  <p className="text-sm font-bold text-white">{value || "—"}</p>
                </div>
              ))}
            </div>
            {booking.flightNumber && (
              <div className="px-6 py-3 flex items-center gap-2" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <Zap className="w-3 h-3 text-brand-gold/40" />
                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Voo:</span>
                <span className="text-xs font-bold text-brand-gold">{booking.flightNumber}</span>
              </div>
            )}
          </motion.div>

          {/* Passageiro */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                <User className="w-3 h-3" /> Passageiro
              </p>
            </div>
            <div className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-brand-gold font-black text-lg flex-shrink-0"
                style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}>
                {booking.passenger?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-bold text-white">{booking.passenger?.name}</p>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  {booking.passenger?.email && (
                    <span className="flex items-center gap-1 text-[10px] text-white/35">
                      <Mail className="w-3 h-3" /> {booking.passenger.email}
                    </span>
                  )}
                  {booking.passenger?.phone && (
                    <span className="flex items-center gap-1 text-[10px] text-white/35">
                      <Phone className="w-3 h-3" /> {booking.passenger.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Financeiro */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="w-3 h-3" /> Resumo Financeiro
              </p>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-1">Estado do Pagamento</p>
                  <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${isPaid ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-amber-500/15 text-amber-400 border border-amber-500/25"}`}>
                    {isPaid ? "Pago" : booking.paymentStatus?.toUpperCase() || "Pendente"}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-3xl font-bold text-white tabular-nums">{formatCurrency(booking.totalPrice)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <p className="text-[8px] font-black text-white/25 uppercase tracking-widest mb-1">Motorista</p>
                  <p className="text-sm font-bold text-white">{formatCurrency(booking.driverAmount || 0)}</p>
                </div>
                <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.12)" }}>
                  <p className="text-[8px] font-black text-brand-gold/40 uppercase tracking-widest mb-1">Plataforma</p>
                  <p className="text-sm font-bold text-brand-gold">{formatCurrency(booking.platformFee || 0)}</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* RIGHT */}
        <div className="space-y-4">

          {/* Motorista */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.15)" }}>
            <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid rgba(212,175,55,0.08)" }}>
              <Car className="w-3.5 h-3.5 text-brand-gold/50" />
              <p className="text-[9px] font-black text-brand-gold/60 uppercase tracking-widest">Motorista</p>
            </div>

            {booking.driver ? (
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-brand-gold font-black text-lg flex-shrink-0"
                    style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.2)" }}>
                    {booking.driver.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{booking.driver.name}</p>
                    {booking.driver.phone && (
                      <p className="text-[10px] text-brand-gold/60 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" /> {booking.driver.phone}
                      </p>
                    )}
                  </div>
                </div>
                {booking.driver.vehicle && (
                  <div className="px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-[8px] font-black text-white/25 uppercase tracking-widest mb-1">Veículo</p>
                    <p className="text-sm font-semibold text-white">{booking.driver.vehicle.model}</p>
                    <p className="text-[10px] text-white/35 mt-0.5">{booking.driver.vehicle.plate}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 space-y-3">
                <p className="text-xs text-white/30 italic">Nenhum motorista atribuído.</p>
                <select
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                >
                  <option value="">Selecionar motorista...</option>
                  {drivers?.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => assignDriver(booking.id, selectedDriverId)}
                  disabled={!selectedDriverId}
                  className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-40"
                  style={{ background: "#D4AF37", color: "#07070A" }}
                >
                  Atribuir Motorista
                </button>
              </div>
            )}
          </motion.div>

          {/* Operações */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <p className="text-[9px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                <Zap className="w-3 h-3" /> Operações
              </p>
            </div>
            <div className="p-4 space-y-2.5">
              <button
                onClick={() => updateStatus(booking.id, "in_progress")}
                className="w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-white/10 text-white/70 hover:text-white"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                Marcar Em Curso
              </button>
              <button
                onClick={() => updateStatus(booking.id, "on_route")}
                className="w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-brand-gold hover:bg-brand-gold hover:text-black"
                style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)" }}
              >
                Marcar Em Rota
              </button>
              <button
                onClick={() => {
                  if (confirm("Confirmar conclusão da viagem? O pagamento ao motorista será processado automaticamente.")) {
                    updateStatus(booking.id, "completed");
                  }
                }}
                className="w-full py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-emerald-400 hover:bg-emerald-500/20"
                style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}
              >
                <CheckCircle2 className="w-4 h-4" /> Concluir & Pagar Motorista
              </button>
              <button
                onClick={() => {
                  if (confirm("Cancelar esta reserva?")) {
                    updateStatus(booking.id, "cancelled");
                  }
                }}
                className="w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                style={{ border: "1px solid rgba(255,255,255,0.05)" }}
              >
                Cancelar Reserva
              </button>
            </div>
            <div className="px-5 pb-4">
              <p className="text-[9px] text-white/20 text-center leading-relaxed">
                Ao concluir, o pagamento é processado automaticamente para o motorista.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
