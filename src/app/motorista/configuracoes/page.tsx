"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShieldCheck, Building2, User, Key,
    Car, Wallet, CheckCircle2, AlertCircle, RefreshCw, CreditCard
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useAuthStore } from "@/lib/auth-store";

export default function ConfiguracoesPage() {
    const { token, user: authUser } = useAuthStore();
    const [stripeStatus, setStripeStatus] = useState<"input" | "processing" | "linked" | "connect_pending">("input");
    const [bankName, setBankName] = useState("");
    const [iban, setIban] = useState("");
    const [loading, setLoading] = useState(true);
    const [driverData, setDriverData] = useState<any>(null);
    const [connectStatus, setConnectStatus] = useState<any>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [profileRes, connectRes] = await Promise.all([
                    axios.get(`${API_URL}/driver/profile`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/payouts/connect/status`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { connected: false } }))
                ]);
                setDriverData(profileRes.data);
                setBankName(profileRes.data.profile?.bankName || "");
                setIban(profileRes.data.profile?.iban || "");
                setConnectStatus(connectRes.data);
                if (connectRes.data?.connected) {
                    setStripeStatus("linked");
                } else if (profileRes.data.profile?.iban) {
                    setStripeStatus("linked");
                }
            } catch (error) {
                console.error("Erro ao carregar perfil:", error);
                toast.error("Erro ao carregar dados", { description: "Não foi possível sincronizar as suas informações." });
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchProfile();
    }, [token, API_URL]);

    const handleStripeConnect = async (e?: React.MouseEvent) => {
        if(e) e.preventDefault();
        
        if (!bankName.trim() || !iban.trim()) {
            toast.error("Formulário Incompleto", { description: "Por favor preencha o nome do banco e o número da sua conta (IBAN)." });
            return;
        }

        setStripeStatus("processing");

        try {
            // 1. Guardar IBAN no perfil
            await axios.patch(`${API_URL}/driver/profile`, { bankName, iban }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 2. Criar/obter link de onboarding Stripe Connect
            const connectRes = await axios.post(`${API_URL}/payouts/connect/onboard`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (connectRes.data?.url) {
                // Redirecionar para o onboarding da Stripe
                toast.success("A redirecionar para a Stripe...", { description: "Complete o processo de verificação para receber pagamentos." });
                setTimeout(() => { window.location.href = connectRes.data.url; }, 1500);
            } else {
                setStripeStatus("linked");
                toast.success("Conta Bancária Guardada!");
            }
        } catch (error: any) {
            console.error("Erro ao guardar perfil:", error);
            setStripeStatus("input");
            // Se Stripe Connect não estiver disponível, guarda só o IBAN
            if (error.response?.status === 400 && error.response?.data?.message?.includes('Stripe')) {
                try {
                    await axios.patch(`${API_URL}/driver/profile`, { bankName, iban }, { headers: { Authorization: `Bearer ${token}` } });
                    setStripeStatus("linked");
                    toast.success("Dados bancários guardados.", { description: "Stripe Connect será ativado em breve." });
                } catch { toast.error("Erro ao guardar dados."); }
            } else {
                toast.error("Falha na Ligação", { description: "Ocorreu um erro ao comunicar com o servidor." });
            }
        }
    };

    return (
        <main className="py-12 md:py-16 lg:py-24 relative z-10 w-full px-6 sm:px-10 lg:px-16 2xl:px-24">
            <div className="w-full flex-1 max-w-[1400px] space-y-24 animate-luxury-reveal mx-auto">
                <div className="space-y-4">
                    <h1 className="text-white text-6xl font-extralight tracking-tighter italic leading-none">
                        Meus {" "}<span className="text-brand-gold not-italic font-light">Dados</span>
                    </h1>
                    <p className="text-white/30 text-lg font-light italic max-w-md">
                        Faça a gestão das suas informações pessoais, do seu veículo e da conta para onde os seus ganhos são enviados.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 xl:gap-24">
                    {/* STRIPE CONNECT MODULE */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <Wallet className="w-5 h-5 text-brand-gold" />
                            <h2 className="text-xl font-light text-white uppercase tracking-widest">A Sua Conta Bancária</h2>
                        </div>

                        <div className="relative overflow-hidden rounded-[32px] border border-white/5 bg-white/[0.01] p-10 group transition-colors hover:border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)]">
                            <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-5 transition-opacity pointer-events-none">
                                <Building2 className="w-64 h-64" />
                            </div>

                            <AnimatePresence mode="wait">
                                {stripeStatus === "input" && (
                                    <motion.div 
                                        key="input"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="relative z-10 space-y-6"
                                    >
                                        <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20 shadow-inner">
                                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                            <p className="text-[10px] uppercase font-black tracking-widest text-amber-500/80 leading-relaxed">
                                                Nenhuma conta conectada. Preencha o nome do seu banco e o respetivo número de conta (IBAN) para começar a receber o dinheiro das viagens na sua conta pessoal.
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 block mb-3">Nome do seu Banco</label>
                                                <input 
                                                    type="text" 
                                                    value={bankName}
                                                    onChange={e => setBankName(e.target.value)}
                                                    placeholder="Ex: Santander, Caixa Geral de Depósitos"
                                                    className="w-full bg-[#111116] border border-white/10 rounded-2xl p-5 text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 transition-all font-light"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] uppercase font-black tracking-widest text-white/40 block mb-3">O seu Número de Conta (IBAN)</label>
                                                <input 
                                                    type="text"
                                                    value={iban}
                                                    onChange={e => setIban(e.target.value)}
                                                    placeholder="PT50..."
                                                    className="w-full bg-[#111116] border border-white/10 rounded-2xl p-5 text-white placeholder-white/20 focus:outline-none focus:border-brand-gold/50 focus:ring-1 focus:ring-brand-gold/50 transition-all font-medium uppercase tracking-widest"
                                                />
                                            </div>
                                        </div>

                                        <button 
                                            onClick={handleStripeConnect}
                                            className="w-full flex items-center justify-center p-6 mt-4 bg-brand-gold hover:bg-white transition-all text-black rounded-2xl font-bold tracking-tight text-lg shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
                                        >
                                            Guardar e Validar Conta Bancária
                                        </button>
                                    </motion.div>
                                )}

                                {stripeStatus === "processing" && (
                                    <motion.div 
                                        key="processing"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="relative z-10 py-16 flex flex-col items-center justify-center text-center space-y-8"
                                    >
                                        <RefreshCw className="w-10 h-10 text-brand-gold animate-spin" />
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/80">A carregar segurança da Stripe...</p>
                                        </div>
                                    </motion.div>
                                )}

                                {stripeStatus === "linked" && (
                                    <motion.div 
                                        key="linked"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="relative z-10 space-y-10"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                                            </div>
                                            <div>
                                                <p className="text-3xl font-extralight italic text-white tracking-tighter">Conta Conectada</p>
                                                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-emerald-400/80 mt-1 flex items-center gap-2">
                                                    Pronta a Receber Pagamentos
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-white/40">
                                                    <Building2 className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Instituição</span>
                                                </div>
                                                <span className="text-white font-medium text-sm">{bankName || "Banco Registado"}</span>
                                            </div>

                                            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-4 text-white/40">
                                                    <CreditCard className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Routing (IBAN)</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-brand-gold text-lg tracking-[0.2em] opacity-80">••••</span>
                                                    <span className="text-white font-black tracking-widest text-sm uppercase">{iban.length > 4 ? iban.slice(-4) : "0000"}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="pt-6">
                                               <button className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] hover:text-brand-gold transition-colors flex items-center justify-center w-full">
                                                    Revisar Documentação Fiscal
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* OTHER SETTINGS SUMMARY (GHOSTED) */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <User className="w-5 h-5 text-white/20" />
                            <h2 className="text-xl font-light text-white/60 uppercase tracking-widest">Informação Operacional</h2>
                        </div>
                        
                        <div className="space-y-4">
                            {loading ? (
                                <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/5 animate-pulse flex flex-col gap-4">
                                     <div className="h-4 w-24 bg-white/5 rounded" />
                                     <div className="h-8 w-48 bg-white/10 rounded" />
                                </div>
                            ) : (
                                <>
                                    <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/5 opacity-50 flex items-center justify-between hover:opacity-100 hover:border-white/10 transition-all cursor-not-allowed">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Nome do Motorista</p>
                                            <p className="text-lg text-white">{driverData?.name || "Carregando..."}</p>
                                        </div>
                                        <ShieldCheck className="w-6 h-6 text-brand-gold opacity-50" />
                                    </div>
                                    <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/5 opacity-50 flex items-center justify-between hover:opacity-100 hover:border-white/10 transition-all cursor-not-allowed">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">O seu Veículo</p>
                                            <p className="text-lg text-white italic tracking-tight">
                                                {driverData?.profile?.vehicle?.model || "Sem Veículo"} 
                                                <span className="not-italic text-[10px] font-black tracking-widest ml-2 text-brand-gold uppercase">
                                                    {driverData?.profile?.vehicle?.type || "N/A"}
                                                </span>
                                            </p>
                                        </div>
                                        <Car className="w-8 h-8 text-white/20" />
                                    </div>
                                    <div className="p-8 rounded-[32px] bg-white/[0.01] border border-white/5 opacity-50 flex items-center justify-between hover:opacity-100 hover:border-white/10 transition-all cursor-not-allowed">
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">A sua Senha</p>
                                            <p className="text-sm text-white/60 mt-1">Alterada recentemente</p>
                                        </div>
                                        <Key className="w-6 h-6 text-white/20" />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
