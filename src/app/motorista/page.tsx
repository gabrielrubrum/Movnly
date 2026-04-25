"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import {
  MapPin, Clock, Users, Briefcase, Phone,
  Navigation, CheckCircle, Star, DollarSign, Car,
  ChevronRight, AlertCircle, Loader2, Activity,
  ShieldCheck, ArrowUpRight, Zap, Target
} from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { useFinances } from "@/hooks/useFinances";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { EarningsChart } from "@/components/driver/EarningsChart";

export default function MotoristaDashboard() {
  const { bookings, loading: bookingsLoading, updateStatus, acceptBooking, marketplace, live } = useBookings();
  const { driverStats, loading: financesLoading } = useFinances();
  const [status, setStatus] = useState<"available" | "offline">("available");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [updating, setUpdating] = useState(false);

  const loading = bookingsLoading || financesLoading;

  // Real-time Socket Listener
  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;
    socket.on("new_ride_available", (data: any) => {
      toast.info("🚗 Nova Corrida Disponível!", {
        description: `${data.from?.split(',')[0]} → ${data.to?.split(',')[0]} · ${data.category?.toUpperCase()} · €${data.price}`,
        duration: 10000,
        icon: <Zap className="w-4 h-4 text-brand-gold" />
      });
    });
    return () => { socket.off("new_booking_available"); };
  }, [socket]);

  // Derived Data
  const activeTrip = live[0];
  const totalEarnings = driverStats?.totalEarnings || 0;
  const availableEarnings = driverStats?.availableBalance || 0;
  
  const mockChartData = [
    { day: "SEG", amount: 120 },
    { day: "TER", amount: 190 },
    { day: "QUA", amount: 150 },
    { day: "QUI", amount: 280 },
    { day: "SEX", amount: 210 },
    { day: "SAB", amount: 350 },
    { day: "DOM", amount: 220 },
  ];

  const getStatusIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'confirmed') return 0;
    if (s === 'on_route') return 1;
    if (s === 'arrived') return 2;
    if (s === 'in_progress') return 3;
    if (s === 'completed') return 4;
    return 0;
  };

  const currentIndex = activeTrip ? getStatusIndex(activeTrip.status) : 0;

  const currentStates = [
    { label: "Reserva confirmada", done: currentIndex > 0, active: currentIndex === 0 },
    { label: "A caminho do cliente", done: currentIndex > 1, active: currentIndex === 1 },
    { label: "Chegou ao local", done: currentIndex > 2, active: currentIndex === 2 },
    { label: "Viagem em curso", done: currentIndex > 3, active: currentIndex === 3 },
    { label: "Viagem terminada", done: currentIndex > 4, active: currentIndex === 4 },
  ];

  const handleNextStep = async () => {
    if (!activeTrip) return;
    setUpdating(true);
    try {
      const statuses: any[] = ["CONFIRMED", "ON_ROUTE", "ARRIVED", "IN_PROGRESS", "COMPLETED"];
      const nextStatus = statuses[currentIndex + 1];
      
      if (nextStatus === "COMPLETED") {
        setShowPinModal(true);
      } else {
        await updateStatus(activeTrip.id, nextStatus as any);
        toast.success("Estado da viagem atualizado!");
      }
    } catch (error) {
      toast.error("Erro ao atualizar estado.");
    } finally {
      setUpdating(false);
    }
  };

  const handleFinalizeWithPin = async () => {
    if (!activeTrip || !pin) return;
    setUpdating(true);
    try {
      await updateStatus(activeTrip.id, "COMPLETED" as any, pin);
      toast.success("Viagem concluída!");
      setShowPinModal(false);
      setPin("");
    } catch (error) {
      toast.error("PIN incorreto.");
    } finally {
      setUpdating(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      setAcceptingId(id);
      await acceptBooking(id);
      toast.success("Reserva aceite com sucesso!");
    } catch (err) {
      toast.error("Erro ao aceitar reserva.");
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-luxury-reveal">
      
      {/* Cockpit HUD */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full w-max">
            <Target className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.2em]">Serviço Privado</span>
          </div>
          <h1 className="text-6xl font-extralight text-white italic tracking-tighter leading-none">
            Painel do <span className="not-italic font-light text-brand-gold">Motorista</span>
          </h1>
          <div className="flex items-center gap-5 mt-4">
             <p className="text-white/30 text-lg font-light italic">Gestão centralizada das suas viagens.</p>
             <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                <Activity className="w-3 h-3 text-brand-gold" />
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Estado: Online</span>
             </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <button 
             onClick={() => setStatus(status === "available" ? "offline" : "available")}
             className={cn(
               "h-16 px-10 rounded-[22px] text-[11px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-5 border shadow-2xl relative overflow-hidden group",
               status === "available" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-500"
             )}
           >
             <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className={cn("w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]", status === "available" ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
             {status === "available" ? "Disponível para Viagens" : "Modo Offline"}
           </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-12">
        
        {/* Mission Control Arena */}
        <div className="space-y-10">
           
           {activeTrip ? (
             <div className="p-12 rounded-[56px] bg-[#0A0A0F] border border-brand-gold/20 shadow-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 blur-[100px] rounded-full" />
                <div className="flex items-center justify-between mb-12 relative z-10">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 flex items-center justify-center text-brand-gold">
                         <Activity className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-brand-gold uppercase tracking-widest leading-none">Viagem em Curso</p>
                         <p className="text-xl font-light text-white italic tracking-tight uppercase">{activeTrip.reference}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-4xl font-extralight text-brand-gold tracking-tighter tabular-nums">{formatCurrency(activeTrip.driverAmount || 0)}</p>
                      <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Ganho Líquido</p>
                   </div>
                </div>

                <div className="space-y-12 relative z-10 mb-16">
                   <div className="flex items-start gap-8">
                      <div className="w-6 h-6 rounded-full border-2 border-brand-gold bg-transparent flex items-center justify-center mt-1">
                         <div className="w-2 h-2 rounded-full bg-brand-gold" />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">Ponto de Recolha</p>
                         <p className="text-2xl font-light text-white italic tracking-tight">{activeTrip.origin}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-8">
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center mt-1">
                         <div className="w-2 h-2 rounded-full bg-black" />
                      </div>
                      <div>
                         <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-2">Destino do Passageiro</p>
                         <p className="text-2xl font-light text-white italic tracking-tight">{activeTrip.destination}</p>
                      </div>
                   </div>
                </div>

                {/* Progress HUD */}
                <div className="grid grid-cols-5 gap-4 mb-16 px-4">
                   {currentStates.map((s, i) => (
                     <div key={i} className="flex flex-col items-center gap-3">
                        <div className={cn(
                          "w-full h-1.5 rounded-full transition-all duration-700",
                          s.done ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" : s.active ? "bg-brand-gold animate-pulse" : "bg-white/5"
                        )} />
                        <span className={cn(
                          "text-[7px] font-black uppercase tracking-widest text-center leading-tight",
                          s.active || s.done ? "text-white" : "text-white/10"
                        )}>{s.label.split(' ')[0]}</span>
                     </div>
                   ))}
                           <div className="flex items-center gap-6 relative z-10">
                   <button 
                     onClick={handleNextStep}
                     disabled={updating}
                     className="flex-1 h-24 bg-brand-gold text-black text-[14px] font-black uppercase tracking-[0.5em] rounded-[32px] hover:bg-white transition-all shadow-3xl flex items-center justify-center gap-5 group relative overflow-hidden"
                   >
                     <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                     {updating ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                       <span className="relative z-10 flex items-center gap-5">
                        <CheckCircle className="w-6 h-6" />
                        {currentIndex === 1 ? "Confirmar Chegada" : currentIndex === 2 ? "Iniciar Viagem" : currentIndex === 3 ? "Finalizar Viagem" : "Próximo Passo"}
                       </span>
                     )}
                   </button>
                   <a href={`tel:${activeTrip.passenger.phone}`} className="w-24 h-24 rounded-[32px] bg-white/[0.03] border border-white/10 flex items-center justify-center text-white hover:bg-brand-gold hover:text-black transition-all group shadow-xl">
                      <Phone className="w-7 h-7 group-hover:scale-110 transition-transform" />
                   </a>
                </div>
        </div>
             </div>
           ) : (
             <div className="p-20 text-center rounded-[56px] bg-white/[0.01] border border-dashed border-white/10 py-40">
                <Activity className="w-16 h-16 text-white/5 mx-auto mb-8" />
                <h3 className="text-3xl font-light text-white/30 italic">Em Espera Operacional</h3>
                <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black mt-4">Sua disponibilidade está a ser sinalizada aos nossos clientes VIP.</p>
             </div>
           )}

           {/* Marketplace */}
           <div className="space-y-8">
              <h2 className="text-2xl font-light text-white italic tracking-tight px-6 uppercase">Viagens Disponíveis</h2>
              <div className="grid gap-6">
                 {marketplace.map((m) => (
                   <div key={m.id} className="p-10 rounded-[40px] bg-white/[0.02] border border-white/5 hover:border-brand-gold/30 transition-all group">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                         <div className="flex items-center gap-8">
                            <div className="w-16 h-16 rounded-2xl bg-brand-gold/5 flex items-center justify-center text-brand-gold/40 group-hover:bg-brand-gold group-hover:text-black transition-all">
                               <Car className="w-6 h-6" />
                            </div>
                            <div>
                               <p className="text-xl font-light text-white italic tracking-tight">{m.origin.split(',')[0]} → {m.destination.split(',')[0]}</p>
                               <div className="flex items-center gap-4 mt-2 text-[9px] font-black uppercase tracking-widest text-white/20">
                                  <span>{m.pickupTime}</span>
                                  <span className="w-1 h-1 rounded-full bg-white/10" />
                                  <span className="text-brand-gold/60">{m.category}</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex items-center gap-10">
                            <div className="text-right">
                               <p className="text-2xl font-light text-brand-gold italic tracking-tighter">{formatCurrency(m.driverAmount || 0)}</p>
                               <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest">Oferta Líquida</p>
                            </div>
                            <button 
                              onClick={() => handleAccept(m.id)}
                              className="px-8 py-4 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-brand-gold hover:text-black transition-all"
                            >
                              Aceitar Reserva
                            </button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

        </div>

        {/* Tactical Intel Sidebar */}
        <div className="space-y-10">
           
           {/* Earnings Widget */}
           <div className="p-10 rounded-[48px] bg-[#0F0F14] border border-white/5 shadow-2xl space-y-10">
              <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-[10px] font-black text-brand-gold uppercase tracking-[0.4em] mb-1">Rendimentos Semanais</h3>
                   <p className="text-3xl font-light text-white italic tracking-tight tabular-nums">{formatCurrency(totalEarnings)}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                   <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <EarningsChart data={mockChartData} />

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                 <div>
                    <p className="text-xl font-light text-white italic tracking-tighter">{formatCurrency(availableEarnings)}</p>
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Disponível para Levantamento</p>
                 </div>
                 <button className="px-6 py-3 rounded-xl bg-brand-gold/10 text-brand-gold text-[9px] font-black uppercase tracking-widest border border-brand-gold/20 hover:bg-brand-gold hover:text-black transition-all">
                    Levantar
                 </button>
              </div>
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-2 gap-6">
              {[
                { label: "Taxa Aceitação", value: "98%", icon: ShieldCheck, color: "emerald" },
                { label: "Rating Médio", value: "5.0 ★", icon: Star, color: "gold" },
                { label: "Tempo Online", value: "6h 42m", icon: Clock, color: "white" },
                { label: "Cancelamento", value: "0.2%", icon: AlertCircle, color: "white" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 flex flex-col items-center gap-4 text-center group hover:border-white/10 transition-all">
                   <div className={cn(
                     "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                     color === "gold" ? "bg-brand-gold/10 text-brand-gold" : color === "emerald" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/20"
                   )}>
                      <Icon className="w-4 h-4" />
                   </div>
                   <div>
                     <p className="text-xl font-light text-white italic tracking-tighter">{value}</p>
                     <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-1">{label}</p>
                   </div>
                </div>
              ))}
           </div>

        </div>

      </div>

      {/* PIN Verification Modal */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPinModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg bg-[#0A0A0F] border border-white/10 rounded-[48px] p-16 relative z-10 text-center">
              <ShieldCheck className="w-16 h-16 text-brand-gold mx-auto mb-8" />
              <h3 className="text-3xl font-light text-white italic mb-4">Validar Finalização</h3>
              <p className="text-white/40 text-sm mb-12">Solicite o PIN de 6 dígitos ao passageiro para confirmar a finalização da viagem.</p>
              <input 
                type="text" 
                maxLength={6} 
                value={pin} 
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full h-24 bg-white/5 border border-white/10 rounded-3xl text-center text-5xl font-extralight tracking-[0.5em] text-brand-gold outline-none mb-12"
                placeholder="000000"
              />
              <button onClick={handleFinalizeWithPin} disabled={pin.length < 6} className="w-full py-6 bg-brand-gold text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl">Confirmar Finalização</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function TrendingUp(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
  );
}
