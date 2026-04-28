"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  Phone, CheckCircle, Star, Car, AlertCircle,
  Loader2, Activity, ShieldCheck, Zap, Target,
  Clock, MapPin, ChevronRight, Navigation
} from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { useFinances } from "@/hooks/useFinances";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { EarningsChart } from "@/components/driver/EarningsChart";

export default function MotoristaDashboard() {
  const { loading: bookingsLoading, updateStatus, acceptBooking, marketplace, live } = useBookings();
  const { driverStats, loading: financesLoading } = useFinances();
  const [status, setStatus] = useState<"available" | "offline">("available");
  const [pin, setPin] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const loading = bookingsLoading || financesLoading;

  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;
    socket.on("new_ride_available", (data: any) => {
      toast.info("🚗 Nova Corrida Disponível!", {
        description: `${data.from?.split(',')[0]} → ${data.to?.split(',')[0]} · €${data.price}`,
        duration: 10000,
      });
    });
    return () => { socket.off("new_ride_available"); };
  }, [socket]);

  const activeTrip = live[0];
  const totalEarnings = driverStats?.totalEarnings || 0;
  const availableEarnings = driverStats?.availableBalance || 0;

  const mockChartData = [
    { day: "SEG", amount: 120 }, { day: "TER", amount: 190 },
    { day: "QUA", amount: 150 }, { day: "QUI", amount: 280 },
    { day: "SEX", amount: 210 }, { day: "SAB", amount: 350 }, { day: "DOM", amount: 220 },
  ];

  const getStatusIndex = (s: string) => {
    const sl = s.toLowerCase();
    if (sl === 'confirmed') return 0;
    if (sl === 'on_route') return 1;
    if (sl === 'arrived') return 2;
    if (sl === 'in_progress') return 3;
    if (sl === 'completed') return 4;
    return 0;
  };

  const currentIndex = activeTrip ? getStatusIndex(activeTrip.status) : 0;
  const tripSteps = ["Confirmado", "A Caminho", "Chegou", "Em Curso", "Concluído"];

  const handleNextStep = async () => {
    if (!activeTrip) return;
    setUpdating(true);
    try {
      const statuses = ["CONFIRMED", "ON_ROUTE", "ARRIVED", "IN_PROGRESS", "COMPLETED"];
      const next = statuses[currentIndex + 1];
      if (next === "COMPLETED") { setShowPinModal(true); setUpdating(false); return; }
      await updateStatus(activeTrip.id, next as any);
      toast.success("Estado atualizado!");
    } catch { toast.error("Erro ao atualizar."); }
    finally { setUpdating(false); }
  };

  const handleFinalizeWithPin = async () => {
    if (!activeTrip || pin.length < 6) return;
    setUpdating(true);
    try {
      await updateStatus(activeTrip.id, "COMPLETED" as any, pin);
      toast.success("Viagem concluída!");
      setShowPinModal(false); setPin("");
    } catch { toast.error("PIN incorreto."); }
    finally { setUpdating(false); }
  };

  const handleAccept = async (id: string) => {
    setAcceptingId(id);
    try { await acceptBooking(id); toast.success("Corrida aceite!"); }
    catch { toast.error("Erro ao aceitar."); }
    finally { setAcceptingId(null); }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-luxury-reveal">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.3em]">Painel do Motorista</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-none">
            Bem-vindo, <span className="text-brand-gold">Ricardo</span>
          </h1>
        </div>
        <button
          onClick={() => setStatus(s => s === "available" ? "offline" : "available")}
          className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all",
            status === "available"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          )}
        >
          <span className={cn("w-2 h-2 rounded-full", status === "available" ? "bg-emerald-500 animate-pulse" : "bg-red-500")} />
          {status === "available" ? "Disponível" : "Offline"}
        </button>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Ganhos Totais", value: formatCurrency(totalEarnings), icon: TrendingUp, color: "gold" },
          { label: "Disponível", value: formatCurrency(availableEarnings), icon: Zap, color: "emerald" },
          { label: "Rating", value: "5.0 ★", icon: Star, color: "gold" },
          { label: "Aceitação", value: "98%", icon: ShieldCheck, color: "white" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="p-5 sm:p-6 rounded-3xl bg-[#0C0C11] border border-white/5 hover:border-brand-gold/20 transition-all duration-300 group relative overflow-hidden cursor-default">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/0 group-hover:from-brand-gold/[0.03] to-transparent transition-all duration-500" />
            <div className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110",
              color === "gold" ? "bg-brand-gold/10 text-brand-gold group-hover:bg-brand-gold/20" :
              color === "emerald" ? "bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20" :
              "bg-white/5 text-white/30 group-hover:bg-white/10 group-hover:text-white/60"
            )}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-xl sm:text-2xl font-light text-white tracking-tight">{value}</p>
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">

        {/* ── Missão Ativa / Marketplace ─────────────────────── */}
        <div className="space-y-8">

          {/* Viagem ativa */}
          {activeTrip ? (
            <div className="rounded-3xl bg-[#0A0A0F] border border-brand-gold/20 overflow-hidden">
              {/* Header da viagem */}
              <div className="p-6 sm:p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-gold/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-brand-gold animate-pulse" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-brand-gold uppercase tracking-widest">Viagem em Curso</p>
                    <p className="text-base font-light text-white italic">{activeTrip.reference}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-light text-brand-gold">{formatCurrency(activeTrip.driverAmount || 0)}</p>
                  <p className="text-[8px] text-white/20 uppercase tracking-widest">Ganho</p>
                </div>
              </div>

              {/* Rota */}
              <div className="p-6 sm:p-8 space-y-4 border-b border-white/5">
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full border-2 border-brand-gold mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-black mb-1">Recolha</p>
                    <p className="text-base font-light text-white">{activeTrip.origin}</p>
                  </div>
                </div>
                <div className="ml-1.5 w-px h-6 bg-white/10" />
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-white mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-black mb-1">Destino</p>
                    <p className="text-base font-light text-white">{activeTrip.destination}</p>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="p-6 sm:p-8 border-b border-white/5">
                <div className="flex gap-2">
                  {tripSteps.map((step, i) => (
                    <div key={step} className="flex-1 flex flex-col items-center gap-2">
                      <div className={cn(
                        "w-full h-1 rounded-full transition-all",
                        i < currentIndex ? "bg-emerald-500" : i === currentIndex ? "bg-brand-gold" : "bg-white/5"
                      )} />
                      <span className={cn(
                        "text-[7px] font-black uppercase tracking-wider text-center hidden sm:block",
                        i <= currentIndex ? "text-white/60" : "text-white/10"
                      )}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações */}
              <div className="p-6 sm:p-8 flex gap-4">
                <button
                  onClick={handleNextStep}
                  disabled={updating || currentIndex >= 4}
                  className="flex-1 h-14 bg-brand-gold text-black text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      {currentIndex === 0 ? "Iniciar Rota" : currentIndex === 1 ? "Confirmar Chegada" : currentIndex === 2 ? "Iniciar Viagem" : "Finalizar"}
                    </>
                  )}
                </button>
                <a
                  href={`tel:${activeTrip.passenger?.phone || ''}`}
                  className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-brand-gold hover:text-black transition-all"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white/[0.01] border border-dashed border-white/10 p-16 text-center">
              <Navigation className="w-12 h-12 text-white/5 mx-auto mb-4" />
              <p className="text-white/20 font-light text-lg">Sem viagem ativa</p>
              <p className="text-[9px] text-white/10 uppercase tracking-widest font-black mt-2">Aguardando atribuição</p>
            </div>
          )}

          {/* Marketplace */}
          <div>
            <div className="flex items-center justify-between mb-5 px-1">
              <h2 className="text-lg font-light text-white italic uppercase tracking-tight">Corridas Disponíveis</h2>
              <span className="text-[9px] font-black text-brand-gold uppercase tracking-widest">{marketplace.length} disponíveis</span>
            </div>
            <div className="space-y-4">
              {marketplace.length === 0 ? (
                <div className="p-10 rounded-3xl bg-white/[0.01] border border-dashed border-white/5 text-center">
                  <p className="text-[9px] text-white/10 uppercase tracking-widest font-black">Sem corridas no marketplace</p>
                </div>
              ) : marketplace.map((m) => (
                <div key={m.id} className="p-5 sm:p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-brand-gold/30 transition-all group">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-brand-gold/5 flex items-center justify-center text-brand-gold/40 group-hover:bg-brand-gold group-hover:text-black transition-all flex-shrink-0">
                        <Car className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-light text-white italic truncate">{m.origin.split(',')[0]} → {m.destination.split(',')[0]}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[9px] font-black text-white/20 uppercase">{m.pickupTime}</span>
                          <span className="text-[9px] font-black text-brand-gold/50 uppercase">{m.category}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-light text-brand-gold">{formatCurrency(m.driverAmount || 0)}</p>
                        <p className="text-[8px] text-white/10 uppercase tracking-widest">Ganho</p>
                      </div>
                      <button
                        onClick={() => handleAccept(m.id)}
                        disabled={acceptingId === m.id}
                        className="px-5 py-2.5 bg-white/5 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-all disabled:opacity-50"
                      >
                        {acceptingId === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aceitar"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sidebar ────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Gráfico de ganhos */}
          <div className="p-6 rounded-3xl bg-[#0F0F14] border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-brand-gold uppercase tracking-widest mb-1">Esta Semana</p>
                <p className="text-2xl font-light text-white italic">{formatCurrency(totalEarnings)}</p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <EarningsChart data={mockChartData} />
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div>
                <p className="text-lg font-light text-white italic">{formatCurrency(availableEarnings)}</p>
                <p className="text-[8px] text-white/20 uppercase tracking-widest font-black">Para Levantar</p>
              </div>
              <button className="px-4 py-2 rounded-xl bg-brand-gold/10 text-brand-gold text-[9px] font-black uppercase tracking-widest border border-brand-gold/20 hover:bg-brand-gold hover:text-black transition-all">
                Sacar
              </button>
            </div>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Aceitação", value: "98%", icon: ShieldCheck, color: "emerald" },
              { label: "Rating", value: "5.0 ★", icon: Star, color: "gold" },
              { label: "Online", value: "6h 42m", icon: Clock, color: "white" },
              { label: "Cancelamentos", value: "0.2%", icon: AlertCircle, color: "white" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center gap-3 text-center">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center",
                  color === "gold" ? "bg-brand-gold/10 text-brand-gold" :
                  color === "emerald" ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/20"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-lg font-light text-white italic">{value}</p>
                  <p className="text-[8px] font-black text-white/20 uppercase tracking-wider mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── PIN Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPinModal(false)} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm bg-[#0A0A0F] border border-white/10 rounded-3xl p-10 relative z-10 text-center">
              <ShieldCheck className="w-12 h-12 text-brand-gold mx-auto mb-6" />
              <h3 className="text-2xl font-light text-white italic mb-2">Validar Finalização</h3>
              <p className="text-white/30 text-sm mb-8">PIN de 6 dígitos do passageiro</p>
              <input
                type="text" maxLength={6} value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full h-20 bg-white/5 border border-white/10 rounded-2xl text-center text-4xl font-extralight tracking-[0.5em] text-brand-gold outline-none focus:border-brand-gold/40 mb-6"
                placeholder="000000" autoFocus
              />
              <button onClick={handleFinalizeWithPin} disabled={pin.length < 6 || updating} className="w-full py-4 bg-brand-gold text-black text-[11px] font-black uppercase tracking-widest rounded-2xl disabled:opacity-50 hover:bg-white transition-all">
                {updating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirmar"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function TrendingUp(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>;
}
