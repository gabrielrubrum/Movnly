"use client";

import Link from "next/link";
import { type Booking } from "@/lib/types";
import { BookingStatusBadge } from "./BookingStatusBadge";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Calendar, Clock, Plane, Car, CheckCircle, Phone, MessageSquare } from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { useI18n } from "@/i18n/context";
import { BookingChat } from "@/components/chat/BookingChat";
import { useState } from "react";

interface Props {
  booking: Booking;
  showActions?: boolean;
}

export function BookingCard({ booking: b, showActions = true }: Props) {
  const { cancel } = useBookings();
  const { t } = useI18n();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleCancel = () => {
    if (confirm(t("dashboard.card.cancelConfirm"))) {
      cancel(b.id);
    }
  };

  return (
    <div className="p-8 rounded-[40px] bg-[#0C0C11] border border-white/5 shadow-2xl relative overflow-hidden group hover:border-brand-gold/20 transition-all duration-700">

      {/* Decorative Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 relative z-10">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] font-sans">
              #{b.reference}
            </span>
            <BookingStatusBadge status={b.status} />
            <span className="px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 font-sans">
              {b.category}
            </span>
          </div>

          <div className="flex items-center gap-3 text-white/50 font-light text-lg">
            <Calendar className="w-5 h-5 text-brand-gold" />
            {b.pickupDate} <span className="text-white/20 font-sans text-xs uppercase tracking-widest mx-1">{t("dashboard.card.at")}</span> {b.pickupTime}
          </div>
        </div>

        <div className="md:text-right">
          <div className="text-4xl font-light text-white tracking-tighter">
            {formatCurrency(b.totalPrice)}
          </div>
          {b.extras.length > 0 && (
            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mt-3 font-sans">
              {t(b.extras.length > 1 ? "dashboard.card.extrasCountPlural" : "dashboard.card.extrasCount").replace('{count}', b.extras.length.toString())}
            </div>
          )}
        </div>
      </div>

      {/* Route */}
      <div className="space-y-6 mb-10 relative z-10">
        <div className="flex items-start gap-4">
          <div className="mt-1.5 w-2 h-2 rounded-full border border-brand-gold bg-transparent" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1 font-sans">{t("booking.origin")}</p>
            <p className="text-white font-light text-base truncate">{b.origin}</p>
          </div>
        </div>

        <div className="ml-[3px] w-px h-8 bg-gradient-to-b from-brand-gold/40 to-emerald-500/40" />

        <div className="flex items-start gap-4">
          <div className="mt-1.5 w-2 h-2 rounded-full bg-emerald-500" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-1 font-sans">{t("booking.destination")}</p>
            <p className="text-white font-light text-base truncate">{b.destination}</p>
          </div>
        </div>
      </div>

      {/* Flight monitoring */}
      {b.flightNumber && (
        <div className="flex items-center gap-4 py-4 px-6 rounded-2xl bg-brand-gold/[0.03] border border-brand-gold/10 mb-8 animate-pulse-slow">
          <Plane className="w-5 h-5 text-brand-gold" />
          <span className="text-[10px] font-black text-brand-gold uppercase tracking-[0.3em] font-sans">
            {t("dashboard.card.flight")} {b.flightNumber} · {t("dashboard.card.monitoringActive")}
          </span>
        </div>
      )}

      {/* Driver */}
      {b.driver && (
        <div className="flex items-center justify-between p-6 rounded-3xl bg-white/[0.02] border border-white/5 mb-8 hover:bg-white/[0.04] transition-all">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-brand-gold flex items-center justify-center text-black font-black text-lg transition-transform group-hover:scale-110">
              {b.driver.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p className="text-[12px] font-black text-white uppercase tracking-[0.2em]">{b.driver.name}</p>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-1 font-sans">
                {b.driver.vehicle?.make || ''} {b.driver.vehicle?.model || ''} {b.driver.vehicle?.plate ? `· ${b.driver.vehicle.plate}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {["confirmed", "driver_assigned", "driver_en_route", "driver_arrived", "in_progress"].includes(b.status) && (
              <button 
                onClick={() => setIsChatOpen(true)}
                className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold hover:bg-brand-gold hover:text-black transition-all"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            )}
            <a href={`tel:${b.driver.phone}`}
              className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500 transition-all hover:text-black"
            >
              <Phone className="w-5 h-5" />
            </a>
          </div>
        </div>
      )}

      <BookingChat 
        bookingId={b.id} 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        title={`Conversa com ${b.driver?.name || 'Motorista'}`}
      />


      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap gap-4 pt-8 border-t border-white/5 relative z-10">
          <Link href={`/dashboard/bookings/${b.id}`} className="px-8 py-4 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all font-sans flex-1 text-center">
            {t("dashboard.card.viewDetails")}
          </Link>
          {["confirmed", "pending_payment"].includes(b.status) && (
            <>
              <button className="px-8 py-4 rounded-full bg-white/[0.03] border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all font-sans flex-1">
                {t("dashboard.card.changeFlight")}
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-4 rounded-full text-[10px] font-black text-red-400/40 uppercase tracking-[0.3em] hover:text-red-400 hover:bg-red-500/5 transition-all font-sans"
              >
                {t("dashboard.card.cancel")}
              </button>
            </>
          )}
          {b.status === "completed" && !b.rating && (
            <Link href={`/dashboard/bookings/${b.id}?review=true`} className="px-8 py-4 rounded-full bg-brand-gold text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all font-sans flex-1 text-center shadow-luxury-gold">
              {t("dashboard.card.rateTrip")}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
