"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, ShieldCheck, ChevronRight, Loader2, Key, Sparkles, ArrowLeft } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!email) {
            toast.error("E-mail necessário.");
            router.push("/forgot-password");
        }
    }, [email, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/auth/reset-password`, {
                email,
                code,
                password,
            });
            toast.success("Senha alterada com sucesso. Já pode entrar.");
            router.push("/login");
        } catch (error: any) {
            const msg = error.response?.data?.message || "Código inválido ou erro na alteração.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-luxury-mesh flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* HUD Navigation */}
            <div className="absolute top-8 left-8 md:top-12 md:left-12 z-20">
                <Link
                    href="/login"
                    className="group flex items-center gap-3 text-[10px] font-bold text-white/20 hover:text-white uppercase tracking-[0.4em] transition-all"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="hidden sm:inline">Voltar</span>
                </Link>
            </div>

            {/* Background Light Leaks */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/[0.03] blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-gold/[0.02] blur-[150px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[420px] z-10"
            >
                {/* Branding Section */}
                <div className="text-center mb-12 relative">
                    <Link href="/">
                        <img src="/logoMov.png" alt="MOVNLY" className="h-24 md:h-28 w-auto mx-auto mb-6 hover:scale-105 transition-transform duration-700" />
                    </Link>
                    <div className="w-20 h-px bg-brand-gold/20 mx-auto" />
                </div>

                {/* Reset Card */}
                <div className="bg-[#0A0A0F]/60 backdrop-blur-3xl border border-white/[0.03] rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden group/card">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent scale-x-0 group-hover/card:scale-x-100 transition-transform duration-1000" />
                    
                    <div className="mb-12 space-y-4">
                        <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight leading-[1.1] uppercase">
                            Nova<br />
                            <span className="text-brand-gold font-medium">Senha.</span>
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-[1px] bg-brand-gold/40" />
                            <p className="text-white/40 text-[9px] font-medium uppercase tracking-[0.4em] leading-none">
                                <span className="text-white/80">{email}</span>
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-8">
                            {/* Recovery Code */}
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 group-focus-within:text-brand-gold transition-colors ml-1">Código de Confirmação</label>
                                <div className="relative">
                                    <Key className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-brand-gold transition-all duration-500" />
                                    <input
                                        type="text"
                                        required
                                        maxLength={6}
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        placeholder="000000"
                                        className="w-full bg-transparent border-b border-white/10 py-3 pl-8 pr-0 text-white text-sm font-medium uppercase tracking-[0.6em] placeholder:text-white/5 focus:outline-none focus:border-brand-gold transition-all duration-500"
                                    />
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 group-focus-within:text-brand-gold transition-colors ml-1">Nova Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-brand-gold transition-all duration-500" />
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-transparent border-b border-white/10 py-3 pl-8 pr-0 text-white text-lg tracking-[0.3em] placeholder:text-white/5 focus:outline-none focus:border-brand-gold transition-all duration-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-brand-gold text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl hover:shadow-[0_20px_50px_-10px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden mt-8"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1000ms] ease-in-out z-0" />
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto text-black" /> : (
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    Atualizar Senha
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-12 space-y-2">
                    <p className="text-[8px] text-white/10 uppercase tracking-[0.5em] font-medium">© 2024 MOVNLY · Global Security Protocols</p>
                </div>
            </motion.div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050507] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
}
