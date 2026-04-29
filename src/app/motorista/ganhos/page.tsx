"use client";

import { motion } from "framer-motion";
import {
    TrendingUp, Wallet, DollarSign, Calendar,
    ShieldCheck, Zap, DownloadCloud, Activity, CreditCard
} from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import { useFinances } from "@/hooks/useFinances";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function GanhosPage() {
    const { completed, loading: bookingsLoading } = useBookings();
    const { driverStats, loading: financesLoading, requestPayout } = useFinances();
    const loading = bookingsLoading || financesLoading;

    const totalNet = driverStats?.availableBalance || 0;
    const pendingNet = driverStats?.pendingBalance || 0;
    const totalGross = driverStats?.totalRevenue || 0;
    const totalEarnings = driverStats?.totalEarnings || 0;
    const platformFee = totalGross - totalEarnings;

    const handlePayout = async () => {
        if (totalNet <= 0) {
            toast.error("Sem saldo disponível", { description: "Regra de 20 dias ainda em vigor." });
            return;
        }
        const res = await requestPayout();
        if (res.success) toast.success("Levantamento iniciado", { description: `${formatCurrency(totalNet)} via Stripe Connect.` });
        else toast.error("Erro no levantamento", { description: res.message });
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold text-white tracking-tight">Rendimentos</h1>
                    <p className="text-white/30 text-sm mt-1.5">Acompanhamento detalhado dos seus ganhos</p>
                </div>
            </div>

            {/* Balance cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Available — CTA */}
                <div className="sm:col-span-2 lg:col-span-1 rounded-3xl overflow-hidden border border-brand-gold/20"
                    style={{ background: "linear-gradient(135deg, #0D0B06 0%, #0A0A0F 100%)" }}>
                    <div className="p-6">
                        <p className="text-[9px] font-black text-brand-gold/60 uppercase tracking-widest mb-1">Para Levantar</p>
                        <p className="text-4xl font-bold text-white">{formatCurrency(totalNet)}</p>
                        <p className="text-[9px] text-white/25 uppercase tracking-widest mt-1">disponível agora</p>
                    </div>
                    <button onClick={handlePayout}
                        className="w-full py-4 bg-brand-gold text-black text-[11px] font-black uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2">
                        <DownloadCloud className="w-4 h-4" /> Sacar Agora
                    </button>
                </div>

                <div className="p-6 rounded-3xl bg-[#0C0C11] border border-white/[0.06]">
                    <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-1">Retido (20 dias)</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(pendingNet)}</p>
                    <p className="text-[9px] text-white/15 uppercase tracking-widest mt-1">em processamento</p>
                </div>

                <div className="p-6 rounded-3xl bg-[#0C0C11] border border-white/[0.06]">
                    <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-1">Total Acumulado</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(totalEarnings)}</p>
                    <p className="text-[9px] text-white/15 uppercase tracking-widest mt-1">ganho líquido</p>
                </div>
            </div>

            {/* Stats + Transactions */}
            <div className="grid lg:grid-cols-[1fr_360px] gap-6">

                {/* Transactions */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black text-white/40 uppercase tracking-widest">Últimas Transações</h2>
                    <div className="space-y-3">
                        {completed.slice(0, 8).length > 0 ? completed.slice(0, 8).map((t: any, i: number) => (
                            <motion.div key={t.id}
                                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                className="flex items-center gap-4 p-5 rounded-2xl bg-[#0C0C11] border border-white/[0.06] hover:border-white/10 transition-all group">
                                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold flex-shrink-0">
                                    <Zap className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{t.destination}</p>
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-wider mt-0.5">{t.reference} · {t.pickupTime}</p>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <p className="text-base font-bold text-brand-gold">+{formatCurrency(t.driverAmount || 0)}</p>
                                    <p className="text-[8px] font-black text-emerald-400/40 uppercase tracking-widest">Verificado</p>
                                </div>
                            </motion.div>
                        )) : (
                            <div className="py-16 text-center rounded-3xl bg-white/[0.01] border border-dashed border-white/5">
                                <DollarSign className="w-10 h-10 text-white/5 mx-auto mb-4" />
                                <p className="text-white/25 font-bold text-sm">Sem transações ainda</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar stats */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black text-white/40 uppercase tracking-widest">Resumo</h2>

                    {[
                        { label: "Viagens Concluídas", value: String(completed.length), icon: Calendar },
                        { label: "Média por Viagem", value: formatCurrency(totalEarnings / (completed.length || 1)), icon: Activity },
                        { label: "Volume Bruto", value: formatCurrency(totalGross), icon: TrendingUp },
                        { label: "Taxa Plataforma", value: `-${formatCurrency(platformFee)}`, icon: CreditCard },
                    ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex items-center gap-4 p-5 rounded-2xl bg-[#0C0C11] border border-white/[0.06]">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/30 flex-shrink-0">
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">{label}</p>
                                <p className="text-base font-bold text-white mt-0.5">{value}</p>
                            </div>
                        </div>
                    ))}

                    {/* Payout projection */}
                    <div className="p-5 rounded-2xl bg-[#0C0C11] border border-white/[0.06] space-y-4">
                        <p className="text-[9px] font-black text-white/25 uppercase tracking-widest">Projeção de Liberação</p>
                        {[
                            { label: "Próximos 7 dias", pct: 30 },
                            { label: "8–14 dias", pct: 80 },
                            { label: "15–20 dias", pct: 100 },
                        ].map(({ label, pct }) => (
                            <div key={label}>
                                <div className="flex justify-between mb-1.5">
                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-wider">{label}</span>
                                    <span className="text-[9px] font-black text-brand-gold">{formatCurrency(pendingNet * pct / 100)}</span>
                                </div>
                                <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                        className="h-full bg-brand-gold/60 rounded-full" />
                                </div>
                            </div>
                        ))}
                        <div className="flex items-start gap-2 pt-2 border-t border-white/5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                            <p className="text-[9px] text-white/25 leading-relaxed">Ganhos protegidos e liberados automaticamente após 20 dias.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
