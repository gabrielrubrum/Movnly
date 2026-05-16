"use client";

import { useBooking } from "@/hooks/useBookings";
import { useI18n } from "@/i18n/context";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, MapPin, Calendar, Clock, Car, 
  ShieldCheck, Phone, Mail, ChevronRight, 
  Download, Share2, Star, Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, formatDate } from "@/lib/utils";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import Link from "next/link";

export default function BookingDetailsPage() {
    const { id } = useParams();
    const { t } = useI18n();
    const router = useRouter();
    const booking = useBooking(id as string);

    if (!booking) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 animate-pulse">
                    Carregando detalhes da reserva...
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-luxury-reveal pb-20 px-4 md:px-0">
            {/* Header / Navigation */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10 pt-4">
                <div className="space-y-6">
                    <button 
                        onClick={() => router.back()}
                        className="group flex items-center gap-3 text-white/40 hover:text-brand-gold transition-all"
                    >
                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand-gold/40">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Voltar ao Histórico</span>
                    </button>
                    
                    <div className="flex flex-col">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-gold">Voucher de Viagem</span>
                            <BookingStatusBadge status={booking.status} />
                        </div>
                        <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tight leading-none">
                            #{booking.reference}
                        </h1>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <Download className="w-5 h-5" />
                    </button>
                    <button className="h-14 w-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Details Column */}
                <div className="lg:col-span-2 space-y-12">
                    
                    {/* Route Section */}
                    <div className="luxury-card p-10 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                        
                        <h3 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] mb-12">Itinerário da Viagem</h3>
                        
                        <div className="space-y-12 relative">
                            {/* Vertical Line Connector */}
                            <div className="absolute left-[7px] top-3 bottom-3 w-px bg-gradient-to-b from-brand-gold/40 via-white/10 to-emerald-500/40" />

                            <div className="flex gap-8 items-start relative">
                                <div className="mt-1.5 w-4 h-4 rounded-full border-2 border-brand-gold bg-black z-10" />
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Ponto de Partida</p>
                                    <p className="text-2xl font-light text-white italic text-serif leading-tight">{booking.origin}</p>
                                </div>
                            </div>

                            <div className="flex gap-8 items-start relative">
                                <div className="mt-1.5 w-4 h-4 rounded-full bg-emerald-500 z-10 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Destino Final</p>
                                    <p className="text-2xl font-light text-white italic text-serif leading-tight">{booking.destination}</p>
                                </div>
                            </div>
                        </div>

                        {/* Route Stats */}
                        <div className="mt-16 pt-10 border-t border-white/5 grid grid-cols-2 md:grid-cols-3 gap-8">
                            <div className="space-y-1">
                                <p className="text-[9px] uppercase tracking-widest text-white/20">Distância Total</p>
                                <p className="text-xl font-medium text-white tracking-tighter">{booking.distance || "12 km"}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] uppercase tracking-widest text-white/20">Tempo Estimado</p>
                                <p className="text-xl font-medium text-white tracking-tighter">{booking.estimatedDuration || "25 min"}</p>
                            </div>
                            <div className="hidden md:block space-y-1">
                                <p className="text-[9px] uppercase tracking-widest text-white/20">Status de Rede</p>
                                <p className="text-xl font-medium text-emerald-400 tracking-tighter">Live Track</p>
                            </div>
                        </div>
                    </div>

                    {/* Flight & Extras */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="luxury-card p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <Car className="w-5 h-5 text-brand-gold" />
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Serviço Selecionado</h4>
                            </div>
                            <div className="space-y-1">
                                <p className="text-2xl font-light text-white italic tracking-tight uppercase">{booking.category}</p>
                                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Veículo MOVNLY</p>
                            </div>
                        </div>

                        {booking.flightNumber && (
                             <div className="luxury-card p-8 border-brand-gold/10">
                                <div className="flex items-center gap-4 mb-6">
                                    <Calendar className="w-5 h-5 text-brand-gold" />
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Voo Monitorizado</h4>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-2xl font-light text-brand-gold italic tracking-tight uppercase">{booking.flightNumber}</p>
                                    <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Chegada em Tempo Real</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-8">
                    
                    {/* Time/Date Sidebar Card */}
                    <div className="luxury-card p-8 bg-brand-gold/[0.02]">
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-brand-gold" />
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase tracking-widest text-white/20">Data de Recolha</p>
                                    <p className="text-lg font-light text-white italic">{formatDate(booking.pickupDate)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-brand-gold" />
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase tracking-widest text-white/20">Hora Marcada</p>
                                    <p className="text-lg font-light text-white italic">{booking.pickupTime}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Price Card */}
                    <div className="luxury-card p-8 border-brand-gold/20 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-transparent pointer-events-none" />
                        <div className="relative z-10">
                            <p className="text-[9px] uppercase tracking-[0.5em] text-white/30 mb-8">Resumo do Pagamento</p>
                            
                            <div className="space-y-4 mb-10 pb-10 border-b border-white/5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-white/40">Tarifa Base</span>
                                    <span className="text-white font-medium">{formatCurrency(booking.basePrice)}</span>
                                </div>
                                {booking.extras.map(extra => (
                                    <div key={extra.id} className="flex justify-between items-center text-sm">
                                        <span className="text-white/40">{extra.name}</span>
                                        <span className="text-white font-medium">+{formatCurrency(extra.price)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[8px] uppercase tracking-[0.3em] text-brand-gold font-black mb-1">Total Pago</p>
                                    <p className="text-5xl font-extralight text-white tracking-tighter italic">
                                        {formatCurrency(booking.totalPrice)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-400 uppercase tracking-widest">Pago</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Driver Card (Optional) */}
                    {booking.driver ? (
                        <div className="luxury-card p-8 border-white/10 group">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-brand-gold flex items-center justify-center text-black font-black text-xl shadow-luxury-gold group-hover:scale-105 transition-all">
                                    {booking.driver.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div>
                                    <p className="text-lg font-light text-white italic leading-tight">{booking.driver.name}</p>
                                    <div className="flex items-center gap-1 text-brand-gold mt-1">
                                        <Star className="w-3 h-3 fill-current" />
                                        <span className="text-[10px] font-bold text-white/40">{booking.driver.rating} · Motorista MOVNLY</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 pt-6 border-t border-white/5 text-center">
                                <div className="flex justify-around items-center">
                                    <a href={`tel:${booking.driver.phone}`} className="flex flex-col items-center gap-2 group/icon">
                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover/icon:bg-brand-gold group-hover/icon:text-black transition-all">
                                            <Phone className="w-4 h-4" />
                                        </div>
                                        <span className="text-[8px] uppercase tracking-widest text-white/30">Ligar</span>
                                    </a>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <span className="text-[8px] uppercase tracking-widest text-white/30">Verificado</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="luxury-card p-8 bg-white/[0.01] border-dashed border-white/10 flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mb-4">
                                <Loader2 className="w-6 h-6 text-white/10 animate-spin" />
                            </div>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Motorista Pendente</p>
                            <p className="text-[9px] text-white/10 uppercase tracking-widest leading-relaxed">Os detalhes do motorista serão atribuídos e enviados até 24h antes da viagem.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
