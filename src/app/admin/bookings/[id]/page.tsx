"use client";

import { useBooking, useBookings } from "@/hooks/useBookings";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, Car, CheckCircle2, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { use } from "react";

export default function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const booking = useBooking(resolvedParams.id);
    const { updateStatus, drivers, assignDriver } = useBookings();
    const [selectedDriverId, setSelectedDriverId] = useState("");

    if (!booking) return <div className="p-20 text-center text-white/50">Loading booking or not found...</div>;

    return (
        <div className="px-6 md:px-12 py-10 max-w-[1200px] mx-auto space-y-10">
            <Link href="/admin/bookings" className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-white transition-colors w-max">
                <ArrowLeft className="w-4 h-4" /> Voltar às Reservas
            </Link>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-3xl lg:text-5xl font-normal text-white text-serif italic tracking-tight mb-2">
                        Booking Details
                    </h1>
                    <p className="font-mono text-brand-gold text-lg">{booking.reference}</p>
                </div>
                <BookingStatusBadge status={booking.status} />
            </div>

            <div className="grid lg:grid-cols-[1fr_400px] gap-8">

                {/* Left Col: Info */}
                <div className="space-y-6">
                    <div className="p-8 bg-[#0C0C11] border border-white/5 rounded-3xl shadow-xl">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6">Route Information</h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4 text-white/40" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Pickup</p>
                                    <p className="text-lg font-bold text-white">{booking.origin}</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4 text-brand-gold" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-brand-gold/50 mb-1">Dropoff</p>
                                    <p className="text-lg font-bold text-white">{booking.destination}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-[#0C0C11] border border-white/5 rounded-3xl shadow-xl flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Resumo Financeiro</p>
                            <p className="text-sm font-bold text-white">Payment Status: <span className="text-brand-gold">{booking.paymentStatus?.toUpperCase() || 'UNKNOWN'}</span></p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Total Authorized</p>
                            <p className="text-3xl font-normal text-white text-serif italic">{formatCurrency(booking.totalPrice)}</p>
                        </div>
                    </div>
                </div>

                {/* Right Col: Operations */}
                <div className="space-y-6">

                    <div className="p-8 bg-brand-gold/5 border border-brand-gold/20 rounded-3xl shadow-xl">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-gold mb-6 flex items-center gap-3">
                            <Car className="w-4 h-4" /> Driver Assignment
                        </h2>

                        {booking.driver ? (
                            <div className="p-4 bg-black/40 rounded-xl border border-white/5 mb-4">
                                <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Assigned to</p>
                                <p className="text-lg font-bold text-white">{booking.driver.name}</p>
                                <p className="text-xs text-brand-gold">{booking.driver.phone}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <select
                                    className="w-full bg-black/50 border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none"
                                    value={selectedDriverId}
                                    onChange={(e) => setSelectedDriverId(e.target.value)}
                                >
                                    <option value="">Select a driver...</option>
                                    {drivers?.map(d => (
                                        <option key={d.id} value={d.id}>{d.name} ({d.email})</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => assignDriver(booking.id, selectedDriverId)}
                                    disabled={!selectedDriverId}
                                    className="w-full py-3 bg-brand-gold text-black font-black uppercase tracking-widest text-[10px] rounded-xl disabled:opacity-50 hover:bg-white transition-colors"
                                >
                                    Assign to Ride
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="p-8 bg-[#0C0C11] border border-white/5 rounded-3xl shadow-xl">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6">Status Operations</h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => updateStatus(booking.id, "in_progress")}
                                className="w-full py-4 bg-white/5 text-white hover:bg-white/10 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors border border-white/5"
                            >
                                Mark as In Progress
                            </button>
                            <button
                                onClick={() => {
                                    if (confirm("FINALIZING: Are you sure you want to complete this ride? This action will automatically trigger the scheduled payout transfer to the driver's bank account.")) {
                                        updateStatus(booking.id, "completed");
                                    }
                                }}
                                className="w-full py-4 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 font-bold text-xs uppercase tracking-widest rounded-xl transition-colors border border-emerald-500/20 flex items-center justify-center gap-3"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Finish Ride & Payout
                            </button>
                        </div>
                        <p className="text-[10px] text-white/30 text-center mt-4">
                            Finishing the ride triggers automated clearing to the driver's Stripe Connect profile.
                        </p>
                    </div>

                </div>

            </div>
        </div>
    );
}
