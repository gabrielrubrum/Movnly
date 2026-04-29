"use client";

import { useState, useEffect } from "react";
import { formatCurrency } from "@/lib/utils";
import {
  Phone, CheckCircle, Star, Car, AlertCircle,
  Loader2, ShieldCheck, Zap, Target,
  Clock, Navigation, TrendingUp, Wallet,
  MapPin, ArrowRight, Users, BarChart3,
  CircleDot, CheckCheck, Route, MessageSquare,
  Bell, X, BellRing
} from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { useFinances } from "@/hooks/useFinances";
import { useSocket } from "@/hooks/useSocket";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { EarningsChart } from "@/components/driver/EarningsChart";
import { BookingChat } from "@/components/chat/BookingChat";

export default function MotoristaDashboard() {
  const { loading: bookingsLoading, updateStatus, acceptBooking, marketplace, live } = useBookings();
  const { driverStats, loading: financesLoading } = useFinances();
  const [status, setStatus] = useState<"available" | "offline">("available");
  const [statusLoading, setStatusLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingRides, setPendingRides] = useState<any[]>([]);

  const toggleStatus = async () => {
    const next = status === "available" ? "offline" : "available";
    setStatusLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
      const { token } = useAuthStore.getState();
      await fetch(`${API_URL}/driver/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: next === "available" ? "ONLINE" : "OFFLINE" }),
      });
      setStatus(next);
      toast.success(next === "available" ? "Estás disponível para corridas" : "Ficaste offline");
    } catch {
      toast.error("Erro ao atualizar estado.");
    } finally {
      setStatusLoading(false);
    }
  };

  const [pin, setPin] = useState("");
  const [showPinModal, setShowPinModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const loading = bookingsLoading || financesLoading;

  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;
    socket.on("new_ride_available", (data: any) => {
      // Adicionar à lista de notificações pendentes
      setPendingRides(prev => {
        const exists = prev.find(r => r.id === data.id);
        if (exists) return prev;
        return [data, ...prev].slice(0, 10); // max 10
      });
      setShowNotifications(true);
      // Toast de alerta sonoro visual
      toast.info("🚗 Nova corrida disponível!", {
        description: `${data.from?.split(',')[0]} → ${data.to?.split(',')[0]} · €${data.price}`,
        duration: 8000,
        action: {
          label: "Ver",
          onClick: () => setShowNotifications(true),
        },
      });
    });
    return () => { socket.off("new_ride_available"); };
  }, [socket]);

  const activeTrip = live[0];
  const totalEarnings = driverStats?.totalEarnings || 0;
  const availableEarnings = driverStats?.availableBalance || 0;

  const chartData = [
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

  const tripSteps = [
    { label: "Confirmado", icon: CheckCircle },
    { label: "A Caminho", icon: Route },
    { label: "Chegou", icon: MapPin },
    { label: "Em Curso", icon: CircleDot },
    { label: "Concluído", icon: CheckCheck },
  ];

  const nextActionLabel = ["Iniciar Rota", "Confirmar Chegada", "Iniciar Viagem", "Finalizar Viagem", "Concluído"][currentIndex] || "Avançar";

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
    <div className="space-y-8">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-[9px] font-black text-brand-gold uppercase tracking-[0.35em]">Painel do Motorista</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-none">
            Bem-vindo, <span className="text-brand-gold">Ricardo</span>
          </h1>
          <p className="text-white/30 text-sm mt-2 font-medium">Quarta-feira, 29 de Abril · Lisboa</p>
        </div>
        <div className="flex items-center gap-3 self-start">
          {/* Notification bell */}
          <button
            onClick={() => setShowNotifications(v => !v)}
            className="relative w-12 h-12 rounded-2xl bg-white/5 border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            {pendingRides.length > 0 ? (
              <BellRing className="w-5 h-5 text-brand-gold animate-pulse" />
            ) : (
              <Bell className="w-5 h-5" />
            )}
            {pendingRides.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-gold text-black text-[9px] font-black rounded-full flex items-center justify-center">
                {pendingRides.length}
              </span>
            )}
          </button>

          <button
            onClick={toggleStatus}
            disabled={statusLoading}
            className={cn(
              "flex items-center gap-3 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all disabled:opacity-60",
              status === "available"
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20"
                : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10"
            )}
          >
            {statusLoading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <span className={cn("w-2 h-2 rounded-full", status === "available" ? "bg-emerald-500 animate-pulse" : "bg-white/20")} />
            }
            {status === "available" ? "Disponível" : "Offline"}
          </button>
        </div>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Ganhos Totais", value: formatCurrency(totalEarnings), icon: TrendingUp, accent: "gold", sub: "acumulado" },
          { label: "Para Levantar", value: formatCurrency(availableEarnings), icon: Wallet, accent: "emerald", sub: "disponível" },
          { label: "Avaliação", value: "5.0", icon: Star, accent: "gold", sub: "★ média" },
          { label: "Aceitação", value: "98%", icon: ShieldCheck, accent: "blue", sub: "taxa" },
        ].map(({ label, value, icon: Icon, accent, sub }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-[#0C0C11] border border-white/[0.06] hover:border-white/10 transition-all duration-300 group relative overflow-hidden"
          >
            <div className={cn(
              "absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 -translate-y-1/2 translate-x-1/2",
              accent === "gold" ? "bg-brand-gold/15" : accent === "emerald" ? "bg-emerald-500/15" : "bg-blue-500/15"
            )} />
            <div className={cn(
              "w-10 h-10 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300",
              accent === "gold" ? "bg-brand-gold/10 text-brand-gold" :
              accent === "emerald" ? "bg-emerald-500/10 text-emerald-400" :
              "bg-blue-500/10 text-blue-400"
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
            <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mt-1">{label}</p>
            <p className="text-[8px] text-white/15 uppercase tracking-widest mt-0.5">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Main Grid ──────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">

        {/* ── Left Column ────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Viagem Ativa */}
          {activeTrip ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl overflow-hidden border border-brand-gold/20"
              style={{ background: "linear-gradient(135deg, #0D0B06 0%, #0A0A0F 100%)" }}
            >
              {/* Top bar */}
              <div className="px-8 py-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
                  <span className="text-[10px] font-black text-brand-gold uppercase tracking-[0.35em]">Viagem em Curso</span>
                </div>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">#{activeTrip.reference}</span>
              </div>

              {/* Route */}
              <div className="px-8 py-6 border-b border-white/5">
                <div className="flex items-stretch gap-4">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="w-3 h-3 rounded-full border-2 border-brand-gold" />
                    <div className="w-px flex-1 bg-gradient-to-b from-brand-gold/40 to-white/10 min-h-[32px]" />
                    <div className="w-3 h-3 rounded-full bg-white" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-1">Recolha</p>
                      <p className="text-base font-bold text-white">{activeTrip.origin}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-1">Destino</p>
                      <p className="text-base font-bold text-white">{activeTrip.destination}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-center">
                    <p className="text-3xl font-bold text-brand-gold">{formatCurrency(activeTrip.driverAmount || 0)}</p>
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mt-1">Ganho</p>
                  </div>
                </div>
              </div>

              {/* Progress steps */}
              <div className="px-8 py-5 border-b border-white/5">
                <div className="flex items-center gap-2">
                  {tripSteps.map((step, i) => {
                    const StepIcon = step.icon;
                    const done = i < currentIndex;
                    const active = i === currentIndex;
                    return (
                      <div key={step.label} className="flex items-center gap-2 flex-1">
                        <div className="flex flex-col items-center gap-1.5 flex-1">
                          <div className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                            done ? "bg-emerald-500/20 text-emerald-400" :
                            active ? "bg-brand-gold text-black" :
                            "bg-white/5 text-white/15"
                          )}>
                            <StepIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className={cn(
                            "text-[7px] font-black uppercase tracking-wider text-center hidden sm:block",
                            done ? "text-emerald-400/60" : active ? "text-brand-gold" : "text-white/10"
                          )}>{step.label}</span>
                        </div>
                        {i < tripSteps.length - 1 && (
                          <div className={cn("h-px flex-1 mb-4 transition-all", done ? "bg-emerald-500/30" : "bg-white/5")} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="px-8 py-6 flex gap-3">
                <button
                  onClick={handleNextStep}
                  disabled={updating || currentIndex >= 4}
                  className="flex-1 h-14 bg-brand-gold text-black text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-40"
                >
                  {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <><CheckCircle className="w-4 h-4" />{nextActionLabel}</>
                  )}
                </button>
                <button
                  onClick={() => setActiveChatId(activeTrip.id)}
                  className="w-14 h-14 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold hover:bg-brand-gold hover:text-black transition-all"
                  title="Chat com passageiro"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
                <a
                  href={`tel:${activeTrip.passenger?.phone || ''}`}
                  className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-all"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </motion.div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/8 p-14 text-center bg-white/[0.01]">
              <div className="w-16 h-16 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-5">
                <Navigation className="w-7 h-7 text-white/10" />
              </div>
              <p className="text-white/25 font-bold text-base">Sem viagem ativa</p>
              <p className="text-[9px] text-white/10 uppercase tracking-widest font-black mt-2">Aguardando atribuição</p>
            </div>
          )}

          {/* Marketplace */}
          <div>
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-brand-gold/50" />
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Corridas Disponíveis</h2>
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                marketplace.length > 0 ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20" : "bg-white/5 text-white/20"
              )}>
                {marketplace.length} disponíveis
              </span>
            </div>

            <div className="space-y-3">
              {marketplace.length === 0 ? (
                <div className="p-10 rounded-3xl bg-white/[0.01] border border-dashed border-white/5 text-center">
                  <Car className="w-8 h-8 text-white/5 mx-auto mb-3" />
                  <p className="text-[9px] text-white/10 uppercase tracking-widest font-black">Sem corridas no marketplace</p>
                </div>
              ) : marketplace.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-3xl bg-[#0C0C11] border border-white/[0.06] hover:border-brand-gold/25 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-gold/5 border border-brand-gold/10 flex items-center justify-center text-brand-gold/30 group-hover:bg-brand-gold group-hover:text-black group-hover:border-brand-gold transition-all flex-shrink-0">
                      <Car className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-bold text-white truncate">{m.origin.split(',')[0]}</p>
                        <ArrowRight className="w-3 h-3 text-white/20 flex-shrink-0" />
                        <p className="text-sm font-bold text-white truncate">{m.destination.split(',')[0]}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-wider">{m.pickupTime}</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-[9px] font-black text-brand-gold/40 uppercase tracking-wider">{m.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-xl font-bold text-brand-gold">{formatCurrency(m.driverAmount || 0)}</p>
                        <p className="text-[8px] text-white/15 uppercase tracking-widest font-black">ganho</p>
                      </div>
                      <button
                        onClick={() => handleAccept(m.id)}
                        disabled={acceptingId === m.id}
                        className="px-5 py-2.5 bg-white/5 border border-white/10 text-white/50 text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-all disabled:opacity-40"
                      >
                        {acceptingId === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aceitar"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column ───────────────────────────────────── */}
        <div className="space-y-5">

          {/* Earnings card */}
          <div className="rounded-3xl bg-[#0C0C11] border border-white/[0.06] overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">Esta Semana</p>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalEarnings)}</p>
            </div>
            <div className="p-6">
              <EarningsChart data={chartData} />
            </div>
            <div className="px-6 pb-6 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-1">Para Levantar</p>
                <p className="text-xl font-bold text-white">{formatCurrency(availableEarnings)}</p>
              </div>
              <button className="px-5 py-2.5 rounded-xl bg-brand-gold/10 text-brand-gold text-[9px] font-black uppercase tracking-widest border border-brand-gold/20 hover:bg-brand-gold hover:text-black transition-all">
                Sacar
              </button>
            </div>
          </div>

          {/* Performance metrics */}
          <div className="rounded-3xl bg-[#0C0C11] border border-white/[0.06] p-6">
            <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-5">Performance</p>
            <div className="space-y-4">
              {[
                { label: "Taxa de Aceitação", value: "98%", icon: ShieldCheck, color: "emerald", bar: 98 },
                { label: "Avaliação Média", value: "5.0 ★", icon: Star, color: "gold", bar: 100 },
                { label: "Tempo Online Hoje", value: "6h 42m", icon: Clock, color: "blue", bar: 70 },
                { label: "Cancelamentos", value: "0.2%", icon: AlertCircle, color: "white", bar: 2 },
              ].map(({ label, value, icon: Icon, color, bar }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                    color === "gold" ? "bg-brand-gold/10 text-brand-gold" :
                    color === "emerald" ? "bg-emerald-500/10 text-emerald-400" :
                    color === "blue" ? "bg-blue-500/10 text-blue-400" :
                    "bg-white/5 text-white/20"
                  )}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-bold text-white">{value}</p>
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          color === "gold" ? "bg-brand-gold" :
                          color === "emerald" ? "bg-emerald-500" :
                          color === "blue" ? "bg-blue-500" : "bg-white/20"
                        )}
                        style={{ width: `${bar}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Viagens Hoje", value: "0", icon: Car },
              { label: "Passageiros", value: "0", icon: Users },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="p-5 rounded-2xl bg-[#0C0C11] border border-white/[0.06] text-center">
                <Icon className="w-5 h-5 text-white/15 mx-auto mb-3" />
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mt-1">{label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Notifications Panel ────────────────────────────────── */}
      <AnimatePresence>
        {showNotifications && (
          <div className="fixed inset-0 z-[200] flex items-stretch sm:items-center justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="relative z-10 w-full sm:w-[400px] h-full bg-[#0A0A0F] border-l border-white/10 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Corridas Disponíveis</h3>
                    <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">{marketplace.length + pendingRides.length} no total</p>
                  </div>
                </div>
                <button onClick={() => setShowNotifications(false)}
                  className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/30 hover:text-white transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Rides list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Pending from socket (real-time) */}
                {pendingRides.map((ride, i) => (
                  <motion.div key={ride.id || i}
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl border border-brand-gold/25 bg-brand-gold/5 relative">
                    <div className="absolute top-3 right-3">
                      <span className="text-[8px] font-black text-brand-gold uppercase tracking-widest px-2 py-0.5 bg-brand-gold/10 rounded-full">Novo</span>
                    </div>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold flex-shrink-0">
                        <Car className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 pr-12">
                        <p className="text-sm font-bold text-white truncate">{ride.from?.split(',')[0]}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <ArrowRight className="w-3 h-3 text-white/20" />
                          <p className="text-sm text-white/50 truncate">{ride.to?.split(',')[0]}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-brand-gold">€{ride.price}</p>
                      <button
                        onClick={async () => {
                          if (ride.id) {
                            setAcceptingId(ride.id);
                            try {
                              await acceptBooking(ride.id);
                              toast.success("Corrida aceite!");
                              setPendingRides(prev => prev.filter(r => r.id !== ride.id));
                            } catch { toast.error("Erro ao aceitar."); }
                            finally { setAcceptingId(null); }
                          }
                        }}
                        disabled={acceptingId === ride.id}
                        className="px-5 py-2 bg-brand-gold text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all disabled:opacity-50"
                      >
                        {acceptingId === ride.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aceitar"}
                      </button>
                    </div>
                  </motion.div>
                ))}

                {/* Marketplace rides */}
                {marketplace.map((m, i) => (
                  <div key={m.id} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-white/30 flex-shrink-0">
                        <Car className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{m.origin.split(',')[0]}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <ArrowRight className="w-3 h-3 text-white/20" />
                          <p className="text-sm text-white/50 truncate">{m.destination.split(',')[0]}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-white">{formatCurrency(m.driverAmount || 0)}</p>
                      <button
                        onClick={() => handleAccept(m.id)}
                        disabled={acceptingId === m.id}
                        className="px-5 py-2 bg-white/8 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-all disabled:opacity-50"
                      >
                        {acceptingId === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aceitar"}
                      </button>
                    </div>
                  </div>
                ))}

                {marketplace.length === 0 && pendingRides.length === 0 && (
                  <div className="py-16 text-center">
                    <Bell className="w-10 h-10 text-white/5 mx-auto mb-4" />
                    <p className="text-white/25 font-bold text-sm">Sem corridas disponíveis</p>
                    <p className="text-[9px] text-white/10 uppercase tracking-widest font-black mt-2">As notificações aparecem aqui em tempo real</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Chat ───────────────────────────────────────────────── */}
      {activeChatId && (
        <BookingChat
          bookingId={activeChatId}
          isOpen={!!activeChatId}
          onClose={() => setActiveChatId(null)}
          title="Chat com Passageiro"
        />
      )}

      {/* ── Floating chat button (sem viagem ativa) ────────────── */}
      {!activeTrip && !activeChatId && (
        <div className="fixed bottom-8 right-8 z-[150]">
          <button
            onClick={() => toast.info("Sem viagem ativa", { description: "O chat fica disponível quando tiveres uma viagem em curso." })}
            className="w-14 h-14 rounded-2xl bg-[#0C0C11] border border-white/10 flex items-center justify-center text-white/30 hover:border-brand-gold/30 hover:text-brand-gold transition-all shadow-xl"
            title="Chat com passageiro"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>
      )}
      {/* ── PIN Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPinModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-[#0A0A0F] border border-white/10 rounded-3xl p-10 relative z-10 text-center"
            >
              <div className="w-16 h-16 rounded-3xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-brand-gold" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Validar Finalização</h3>
              <p className="text-white/30 text-sm mb-8">Introduza o PIN de 6 dígitos do passageiro</p>
              <input
                type="text" maxLength={6} value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full h-20 bg-white/5 border border-white/10 rounded-2xl text-center text-4xl font-bold tracking-[0.5em] text-brand-gold outline-none focus:border-brand-gold/40 mb-6 transition-all"
                placeholder="000000" autoFocus
              />
              <button
                onClick={handleFinalizeWithPin}
                disabled={pin.length < 6 || updating}
                className="w-full py-4 bg-brand-gold text-black text-[11px] font-black uppercase tracking-widest rounded-2xl disabled:opacity-40 hover:bg-white transition-all"
              >
                {updating ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirmar Viagem"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
