"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { useBookings } from "@/hooks/useBookings";
import { useFinances } from "@/hooks/useFinances";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import {
  TrendingUp, TrendingDown, Car, Users, Star, Clock,
  AlertTriangle, CheckCircle, Plane, ArrowRight, UserCheck,
  MoreHorizontal, Activity, DollarSign, Loader2, AlertCircle, Check,
  Zap, Calendar, BarChart3, ChevronRight, Bell, ShieldCheck,
  Target, Shield, Globe, Navigation
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FLIGHT_ALERTS = [
  { flight: "TP1234", status: "Atraso Confirmado", booking: "VOL-Elite-08", action: "Ajustar", sev: "amber" },
  { flight: "AF1624", status: "Chegada Antecipada", booking: "VOL-First-12", action: "Picket", sev: "brand" },
  { flight: "BA4920", status: "Alerta de Desvio", booking: "VOL-Corp-22", action: "Contatar", sev: "red" },
];

export default function AdminDashboard() {
  const { bookings, live, loading: bookingsLoading, drivers } = useBookings();
  const { adminStats, loading: financesLoading } = useFinances();
  const [healthData, setHealthData] = useState<any>(null);
  const loading = bookingsLoading || financesLoading;
  const { token } = useAuthStore();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/health`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHealthData(res.data);
      } catch (e) { console.error("Health check failed"); }
    };
    if (token) fetchHealth();
  }, [token, API_URL]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
      </div>
    );
  }

  const KPIS = [
    { label: "Volume Total", value: formatCurrency(adminStats?.totalRevenue || 0), icon: DollarSign, color: "gold" },
    { label: "Lucratividade", value: formatCurrency(adminStats?.platformProfit || 0), icon: TrendingUp, color: "emerald" },
    { label: "Em Trânsito", value: String(live.length), icon: Navigation, color: "gold" },
    { label: "Fleet Active", value: String(drivers?.length || 0), icon: Car, color: "white" },
    { label: "Lead Precision", value: "99.4%", icon: Shield, color: "gold" },
    { label: "Global Reach", value: "Lisbon Hub", icon: Globe, color: "white" },
  ];

  return (
    <div className="space-y-12 animate-luxury-reveal">
      
      {/* Centro de Comando Executivo */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full w-max">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em]">Segurança NexRice Ativa</span>
          </div>
          <h1 className="text-5xl font-extralight text-white italic leading-none">
            NexRice <span className="not-italic font-light text-brand-gold">Executive Control</span>
          </h1>
          <p className="text-white/30 text-lg font-light italic">Gestão centralizada da frota e performance operacional.</p>
        </div>
        <div className="flex items-center gap-6">
           <div className="px-6 py-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4 transition-all hover:bg-brand-gold/5 group">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest leading-none mb-1 group-hover:text-white transition-colors">{healthData?.status || "Operação Otimizada"}</span>
                <span className="text-[8px] text-white/10 font-mono tracking-tighter">Sincronização Ativa · Conectividade Global</span>
              </div>
           </div>
           <div className="w-14 h-14 rounded-2xl bg-brand-gold flex items-center justify-center text-black shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform cursor-pointer">
              <Activity className="w-6 h-6" />
           </div>
        </div>
      </div>

      {/* Indicadores de Operação */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {KPIS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-8 rounded-[36px] bg-[#0A0A0F] border border-white/5 group hover:border-brand-gold/30 transition-all duration-500 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold/5 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="flex items-center justify-between mb-8">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  color === "gold" ? "bg-brand-gold/10 text-brand-gold" : color === "emerald" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/20"
                )}>
                   <Icon className="w-4 h-4" />
                </div>
             </div>
             <div>
                <p className="text-2xl font-light text-white italic tracking-tight mb-1">{value}</p>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-none">{label}</p>
             </div>
          </div>
        ))}
      </div>

      {/* Main Intel Grid */}
      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-10">
        
        {/* Consolidado Financeiro */}
        <div className="p-12 rounded-[56px] bg-[#0A0A0F] border border-brand-gold/10 shadow-3xl relative overflow-hidden">
           <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/[0.02] to-transparent" />
           
           <div className="flex items-center justify-between mb-16 relative z-10">
              <div>
                 <h2 className="text-3xl font-light text-white italic tracking-tight uppercase">Gestão Financeira</h2>
                 <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mt-2">Distribuição de Resultados (Consolidado)</p>
              </div>
              <div className="text-right">
                 <p className="text-4xl font-extralight text-brand-gold tracking-tight tabular-nums">{formatCurrency(adminStats?.platformProfit || 0)}</p>
                 <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Margem Operacional</p>
              </div>
           </div>

           <div className="grid md:grid-cols-3 gap-8 relative z-10">
              <DistributionCard label="Gestão Central" percentage="60%" value={adminStats?.ownerShare || 0} active />
              <DistributionCard label="Parceiro Operacional A" percentage="20%" value={adminStats?.partnerAShare || 0} />
              <DistributionCard label="Parceiro Operacional B" percentage="20%" value={adminStats?.partnerBShare || 0} />
           </div>
        </div>

        {/* Audit Secure Feed */}
        <div className="p-10 rounded-[48px] bg-white/[0.01] border border-white/5 backdrop-blur-3xl flex flex-col">
           <div className="flex items-center justify-between mb-10 px-4">
              <h3 className="text-[11px] font-black text-white uppercase tracking-[0.4em] flex items-center gap-4">
                 <Shield className="w-4 h-4 text-brand-gold" /> Monitorização Operacional
              </h3>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           </div>
           
           <div className="flex-1 space-y-7 overflow-y-auto max-h-[450px] pr-4 custom-scrollbar">
              {bookings
                .flatMap(b => (b.auditLogs || []).map(l => ({ ...l, reference: b.reference })))
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 15)
                .map((log, idx) => (
                   <motion.div 
                     initial={{ opacity: 0, x: -10 }} 
                     animate={{ opacity: 1, x: 0 }} 
                     transition={{ delay: idx * 0.05 }}
                     key={idx} 
                     className="flex gap-5 group cursor-crosshair pb-7 border-b border-white/[0.02] last:border-0"
                   >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-gold/20 group-hover:bg-brand-gold group-hover:scale-125 transition-all duration-300" />
                        <div className="w-[1px] flex-1 bg-gradient-to-b from-brand-gold/20 to-transparent" />
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-[8px] font-black text-brand-gold uppercase tracking-tighter bg-brand-gold/5 px-2 py-0.5 rounded border border-brand-gold/10">
                                 {log.action.replace('SECURITY_', '')}
                              </span>
                              <span className="text-[9px] font-mono text-white/20 italic group-hover:text-white/40 transition-colors">{log.ipAddress}</span>
                            </div>
                            <span className="text-[8px] text-white/10 uppercase font-bold tracking-tighter">SISTEMA PROTEGIDO</span>
                         </div>
                         <p className="text-[11px] text-white/30 leading-relaxed font-light group-hover:text-white/60 transition-colors">
                            Procedimento de infraestrutura para <span className="text-brand-gold/60 font-medium">{log.reference}</span>. 
                            Monitorização de integridade ativa.
                         </p>
                      </div>
                   </motion.div>
                ))}
           </div>
        </div>

      </div>

      {/* Fleet & Logistics Ground Floor */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Real-time Fleet Status */}
        <div className="lg:col-span-2 p-10 rounded-[56px] bg-white/[0.02] border border-white/5 space-y-8">
           <div className="flex items-center justify-between px-4">
              <h2 className="text-xl font-light text-white italic tracking-tight uppercase">Estado da Frota</h2>
              <Link href="/admin/map" className="text-[9px] font-black text-brand-gold uppercase tracking-[0.3em] hover:underline underline-offset-8 transition-all">Centro de Operações</Link>
           </div>
           
           <div className="grid md:grid-cols-2 gap-6">
              {drivers?.slice(0, 4).map((d) => (
                <div key={d.id} className="p-6 rounded-[32px] bg-[#0A0A0F] border border-white/5 flex items-center justify-between group hover:border-emerald-500/20 transition-all">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.02] flex items-center justify-center text-white/20 group-hover:text-emerald-400 group-hover:bg-emerald-500/5 transition-all">
                         <UserCheck className="w-6 h-6" />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-white uppercase tracking-tight">{d.name}</p>
                         <p className="text-[9px] text-emerald-400/40 uppercase tracking-widest font-black mt-1 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-emerald-400 pulse" /> Disponível
                         </p>
                      </div>
                   </div>
                   <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/20 hover:bg-brand-gold hover:text-black transition-all">
                      <ArrowRight className="w-4 h-4" />
                   </button>
                </div>
              ))}
              {(!drivers || drivers.length === 0) && (
                <div className="col-span-2 p-12 text-center text-white/10 uppercase text-[10px] font-black tracking-widest">Nenhuma unidade em serviço</div>
              )}
           </div>
        </div>

        {/* Airport Intelligence */}
        <div className="p-10 rounded-[56px] bg-[#0A0A0F] border border-white/5 space-y-8">
           <h3 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] px-4">Monitorização de Voos</h3>
           <div className="space-y-4">
              {FLIGHT_ALERTS.map((f, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/[0.01] border border-white/5 hover:border-brand-gold/30 transition-all">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-light text-white italic">{f.flight}</span>
                      <span className={cn(
                        "text-[8px] font-black uppercase px-2 py-1 rounded",
                        f.sev === 'red' ? "bg-red-500/10 text-red-400" : "bg-brand-gold/10 text-brand-gold"
                      )}>{f.status}</span>
                   </div>
                   <p className="text-[9px] font-black text-white/20 uppercase tracking-widest leading-relaxed">Booking: {f.booking} · <span className="text-brand-gold/40">Acção: {f.action}</span></p>
                </div>
              ))}
           </div>
        </div>

      </div>

      {/* Global Booking Ledger */}
      <div className="space-y-10 border-t border-white/5 pt-16">
         <div className="flex items-center justify-between px-8">
            <h2 className="text-2xl font-light text-white italic tracking-tight uppercase">Livro de Reservas</h2>
            <Link href="/admin/bookings" className="text-[10px] font-black text-white/20 hover:text-brand-gold uppercase tracking-[0.3em] transition-all">Ver Histórico Completo</Link>
         </div>

         <div className="space-y-4">
            {bookings.slice(0, 8).map((b) => (
              <div key={b.id} className="p-8 rounded-[48px] bg-[#0A0A0F] border border-white/5 hover:border-brand-gold/20 transition-all group">
                 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="flex items-center gap-10">
                       <div className="w-20 h-20 rounded-3xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center text-[10px] font-black text-brand-gold tracking-widest">
                          {b.reference.split('-').pop()}
                       </div>
                       <div>
                          <p className="text-lg font-black text-white uppercase tracking-tight group-hover:text-brand-gold transition-colors">{b.origin.split(',')[0]} → {b.destination.split(',')[0]}</p>
                          <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-white/30 mt-2">
                             <span className="text-brand-gold">{b.category}</span>
                             <span className="w-1 h-1 rounded-full bg-white/10" />
                             <span>{b.pickupDate} · {b.pickupTime}</span>
                             <span className="w-1 h-1 rounded-full bg-white/10" />
                             <span className="text-white/10">{b.passenger.name}</span>
                          </div>
                       </div>
                    </div>
                    <div className="flex items-center gap-10">
                       <div className="text-right">
                          <p className="text-2xl font-light text-white italic tracking-tighter">{formatCurrency(b.totalPrice)}</p>
                          <BookingStatusBadge status={b.status} />
                       </div>
                    </div>
                 </div>
              </div>
            ))}
         </div>
      </div>

    </div>
  );
}

function DistributionCard({ label, percentage, value, active }: any) {
  return (
    <div className={cn(
      "p-8 rounded-[40px] border transition-all duration-500 group/card",
      active ? "bg-brand-gold/10 border-brand-gold/20" : "bg-white/[0.01] border-white/5 hover:border-white/20"
    )}>
       <div className="flex items-center justify-between mb-8">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
            active ? "bg-brand-gold text-black" : "bg-white/5 text-white/20"
          )}>
             {active ? <ShieldCheck className="w-6 h-6" /> : <Users className="w-6 h-6" />}
          </div>
          <span className={cn(
            "text-[10px] font-black uppercase tracking-widest",
            active ? "text-brand-gold" : "text-white/20"
          )}>{percentage}</span>
       </div>
       <p className="text-3xl font-light text-white italic tracking-tight mb-2 tabular-nums">{formatCurrency(value)}</p>
       <p className="text-[9px] font-black uppercase tracking-widest text-white/20">{label}</p>
    </div>
  );
}
