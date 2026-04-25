"use client";

import { motion } from "framer-motion";
import {
    DollarSign, ArrowUpRight, TrendingUp,
    Calendar, CreditCard, ShieldCheck,
    Zap, ArrowDownLeft, Activity, ChevronRight, DownloadCloud
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

    // Real data from Backend
    const totalNet = driverStats?.availableBalance || 0;
    const pendingNet = driverStats?.pendingBalance || 0;
    const totalGross = driverStats?.totalRevenue || 0;
    const platformFee = totalGross - (driverStats?.totalEarnings || 0);

    if (loading) {
        return (
            <div className="min-h-screen bg-transparent flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="py-12 md:py-16 lg:py-24 relative z-10 w-full px-6 sm:px-10 lg:px-16 2xl:px-24">
            <div className="w-full flex-1 max-w-none space-y-24 animate-luxury-reveal">

            {/* Header Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full">
                        <ShieldCheck className="w-3 h-3 text-brand-gold" />
                        <span className="text-[8px] font-bold text-brand-gold uppercase tracking-[0.3em]">Extrato Financeiro Verificado</span>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12">
                    <div className="space-y-4">
                        <h1 className="text-white text-6xl font-extralight tracking-tighter italic leading-none">
                            Meus {" "}<span className="text-brand-gold not-italic font-light">Ganhos</span>
                        </h1>
                        <p className="text-white/30 text-lg font-light italic max-w-md">
                            Acompanhamento detalhado da sua produtividade e transparência de rendimentos.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        {/* Premium Glassmorphism Balance Pill with Action */}
                        <div className="flex bg-brand-gold/5 border border-brand-gold/20 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(212,175,55,0.1)] relative group min-w-[280px] transition-all hover:border-brand-gold/40 hover:shadow-[0_0_60px_rgba(212,175,55,0.15)]">
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/0 via-brand-gold/10 to-brand-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 z-0 pointer-events-none" />
                            
                            <div className="px-10 py-6 text-white flex flex-col items-end z-10 flex-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-brand-gold relative">Levantamento Disp.</span>
                                <span className="text-4xl font-light italic tracking-tighter relative mt-1 text-white">{formatCurrency(totalNet)}</span>
                            </div>
                            
                            <button 
                                onClick={async () => {
                                    if(totalNet > 0) {
                                        const res = await requestPayout();
                                        if (res.success) {
                                            toast.success("Sucesso no Levantamento", {
                                                description: `Processo de ${formatCurrency(totalNet)} iniciado via Stripe Connect.`,
                                            });
                                        } else {
                                            toast.error("Erro no Processamento", {
                                                description: res.message
                                            });
                                        }
                                    } else {
                                        toast.error("Saldo Insuficiente", {
                                            description: "Não possui fundos disponíveis para levantamento no momento (Regra de 20 dias)."
                                        });
                                    }
                                }}
                                className="bg-brand-gold hover:bg-white text-black px-6 flex flex-col items-center justify-center transition-colors relative z-10 border-l border-brand-gold/30 hover:cursor-pointer group/btn"
                            >
                                <DownloadCloud className="w-5 h-5 group-hover/btn:scale-110 group-hover/btn:-translate-y-1 transition-transform mb-1" />
                                <span className="text-[7px] font-black uppercase tracking-widest opacity-80">Sacar</span>
                            </button>
                        </div>
                        
                        <div className="px-10 py-6 rounded-[32px] bg-white/[0.02] border border-white/5 text-white/40 flex flex-col items-end relative overflow-hidden group min-w-[240px]">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 relative z-10">Retido (Regra 20d)</span>
                            <span className="text-4xl font-light italic tracking-tighter relative z-10 mt-1 text-white">{formatCurrency(pendingNet)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] 2xl:grid-cols-[2fr_1fr] gap-10">

                {/* Big Card: Balance Insight */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-10 md:p-14 rounded-[48px] bg-white/[0.02] border border-white/5 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:opacity-10 transition-all duration-1000">
                        <TrendingUp className="w-64 h-64 text-brand-gold" />
                    </div>

                    <div className="relative z-10 space-y-12">
                        <div className="flex items-center justify-between">
                            <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Período Atual</p>
                                <p className="text-xl font-light text-white italic tracking-tight">Lisboa • Abril 2026</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-16">
                            <div className="space-y-4">
                                <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.5em]">Volume de Negócios (Gross)</h3>
                                <div className="text-7xl font-extralight text-white tracking-widest leading-none tabular-nums">{formatCurrency(totalGross)}</div>
                                <div className="flex items-center gap-3 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
                                    <ArrowUpRight className="w-4 h-4" /> +12% vs último mês
                                </div>
                            </div>

                            <div className="pt-10 md:pt-0 md:pl-16 md:border-l border-white/10 space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Taxa de Operação Plataforma</p>
                                    <p className="text-3xl font-light text-white/40 italic">-{formatCurrency(platformFee)}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-brand-gold/60 uppercase tracking-widest">Seu Ganho Líquido</p>
                                    <p className="text-4xl font-light text-brand-gold italic tabular-nums">{formatCurrency(totalNet)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Small Cards: Stats */}
                <div className="space-y-8 flex flex-col justify-between">
                    {[
                        { label: "Serviços Finalizados", value: completed.length, icon: Calendar, color: "gold" },
                        { label: "Média por Viagem", value: formatCurrency(totalNet / (completed.length || 1)), icon: Activity, color: "white" },
                        { label: "Próximo Pagamento", value: "Dia 10 Abr", icon: CreditCard, color: "white" }
                    ].map((stat, idx) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (idx * 0.1) }}
                            className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex items-center justify-between group"
                        >
                            <div className="flex items-center gap-6">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                    stat.color === 'gold' ? "bg-brand-gold/10 text-brand-gold" : "bg-white/5 text-white/40 group-hover:bg-white group-hover:text-black"
                                )}>
                                    <stat.icon className="w-5 h-5" strokeWidth={1.5} />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">{stat.label}</div>
                                    <div className="text-xl font-light text-white italic tracking-tighter leading-none">{stat.value}</div>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-brand-gold transition-all" />
                        </motion.div>
                    ))}
                </div>

            </div>

            {/* Recent Activity List & Protection Progress */}
            <div className="grid lg:grid-cols-2 gap-12">
                
                {/* Release Projection Chart */}
                <div className="space-y-8 bg-[#0C0C11] border border-white/5 rounded-[48px] p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/5 blur-3xl rounded-full" />
                    
                    <div className="relative z-10">
                        <h2 className="text-2xl font-extralight text-white tracking-tighter mb-2">Projeção de Liberação</h2>
                        <p className="text-[10px] text-white/20 uppercase font-black tracking-widest mb-10">Fluxo de Caixa (Regra de Segurança 20 Dias)</p>
                        
                        <div className="space-y-6">
                            {[
                                { label: "Próximos 7 dias", value: pendingNet * 0.3, progress: 30 },
                                { label: "8-14 dias", value: pendingNet * 0.5, progress: 80 },
                                { label: "15-20 dias", value: pendingNet * 0.2, progress: 100 }
                            ].map((proj) => (
                                <div key={proj.label} className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-white/40">{proj.label}</span>
                                        <span className="text-brand-gold">{formatCurrency(proj.value)}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${proj.progress}%` }}
                                            className="h-full bg-brand-gold/60"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            <p className="text-[9px] text-white/30 uppercase font-black leading-relaxed tracking-widest">
                                Seus ganhos são protegidos e liberados automaticamente após 20 dias de segurança. A qualquer momento, acione o botão "Sacar" para transferir os fundos disponíveis diretamente para o seu IBAN.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <h2 className="text-2xl font-extralight text-white tracking-tighter px-4">Últimas Transações</h2>
                    <div className="grid gap-4">
                        {completed.slice(0, 5).map((t, idx) => (
                            <div key={t.id} className="p-8 rounded-[32px] bg-white/[0.01] border border-white/5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                                <div className="flex items-center gap-8">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-brand-gold transition-colors">
                                        <Zap className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-lg font-light text-white italic tracking-tight">{t.destination}</div>
                                        <div className="text-[8px] font-black text-white/10 uppercase tracking-widest">{t.reference} • Finalizado às {t.pickupTime}</div>
                                    </div>
                                </div>

                                <div className="text-right space-y-1">
                                    <div className="text-xl font-light text-brand-gold italic tracking-tighter">+{formatCurrency(t.driverAmount || 0)}</div>
                                    <div className="text-[8px] font-black text-white/10 uppercase tracking-widest">Seu Ganho Fixo • Verificado</div>
                                </div>
                            </div>
                        ))}

                        <button className="py-8 text-center rounded-[32px] border border-dashed border-white/5 text-[9px] font-black text-white/20 uppercase tracking-[0.4em] hover:border-brand-gold/40 hover:text-brand-gold transition-all">
                            Ver Extrato Completo
                        </button>
                    </div>
                </div>
            </div>

            </div>
        </main>
    );
}
