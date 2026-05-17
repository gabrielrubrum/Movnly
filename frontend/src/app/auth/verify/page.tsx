"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, Loader2, ChevronRight, XCircle, Sparkles } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get("token");
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            return;
        }

        const verify = async () => {
            try {
                await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/auth/verify-email?token=${token}`);
                setStatus("success");
            } catch (error) {
                setStatus("error");
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-screen bg-luxury-mesh flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Light Leaks */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/[0.03] blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-gold/[0.02] blur-[150px] rounded-full pointer-events-none" />

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[420px] z-10"
            >
                <div className="text-center mb-16">
                    <img src="/logoMov.png" alt="MOVNLY" className="h-20 md:h-24 w-auto mx-auto mb-6 hover:scale-105 transition-transform duration-700" />
                    <div className="w-16 h-px bg-brand-gold/20 mx-auto" />
                </div>

                <AnimatePresence mode="wait">
                    {status === "loading" && (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="luxury-card p-12 text-center space-y-8"
                        >
                            <div className="relative w-20 h-20 mx-auto">
                                <Loader2 className="w-20 h-20 text-brand-gold animate-spin-slow" />
                                <div className="absolute inset-0 bg-brand-gold/20 blur-2xl rounded-full opacity-20" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-white text-[10px] font-bold uppercase tracking-[0.4em] text-glow-gold">Autenticando</h2>
                                <p className="text-white/30 text-[9px] uppercase tracking-[0.2em]">Confirmando as suas credenciais no hub operacional...</p>
                            </div>
                        </motion.div>
                    )}

                    {status === "success" && (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="luxury-card p-12 text-center space-y-10 relative overflow-hidden"
                        >
                            {/* Scanning Light Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-gold/[0.05] to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
                            
                            <div className="relative">
                                <div className="w-24 h-24 bg-brand-gold/5 border border-brand-gold/20 rounded-full flex items-center justify-center mx-auto relative group">
                                    <ShieldCheck className="w-10 h-10 text-brand-gold relative z-10" />
                                    <div className="absolute inset-0 bg-brand-gold/20 blur-[30px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity" />
                                    <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-brand-gold animate-pulse" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-white text-3xl font-black uppercase tracking-tight leading-none">Confirmado.</h2>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-6 h-[1px] bg-brand-gold/30" />
                                    <p className="text-white/40 text-[9px] font-medium uppercase tracking-[0.3em]">Rede Ativada com Sucesso</p>
                                    <div className="w-6 h-[1px] bg-brand-gold/30" />
                                </div>
                            </div>

                            <Link
                                href="/login"
                                className="w-full h-14 bg-brand-gold text-black text-[10px] font-bold uppercase tracking-[0.4em] rounded-full hover:shadow-[0_20px_50px_-10px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden flex items-center justify-center gap-3"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1000ms] ease-in-out z-0" />
                                <span className="relative z-10 flex items-center gap-3">
                                    Entrar na Conta
                                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        </motion.div>
                    )}

                    {status === "error" && (
                        <motion.div 
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="luxury-card p-12 text-center space-y-10 border-red-500/20"
                        >
                            <div className="w-24 h-24 bg-red-500/5 border border-red-500/20 rounded-full flex items-center justify-center mx-auto relative">
                                <XCircle className="w-10 h-10 text-red-500 relative z-10" />
                                <div className="absolute inset-0 bg-red-500/20 blur-[30px] rounded-full opacity-30" />
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-white text-2xl font-black uppercase tracking-tight leading-none">Falha na Verificação.</h2>
                                <p className="text-red-500/60 text-[9px] font-medium uppercase tracking-[0.2em] leading-relaxed max-w-[240px] mx-auto">
                                    O código de autenticação é inválido ou o protocolo de ativação expirou.
                                </p>
                            </div>

                            <Link
                                href="/register"
                                className="inline-block text-white/30 hover:text-brand-gold transition-colors text-[9px] uppercase tracking-[0.3em] font-medium border-b border-white/5 pb-1"
                            >
                                Tentar Novo Registo
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-16 text-center">
                    <p className="text-white/10 text-[8px] font-medium uppercase tracking-[0.5em]">
                        © 2024 MOVNLY · Executive Fleet Management
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020203] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-brand-gold animate-spin" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
