"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, ShieldCheck, ChevronRight, Loader2, Key, Sparkles, ArrowLeft } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

function DriverResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [email, setEmail] = useState(searchParams.get("email") || "");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!email) {
            toast.error("E-mail necessário.");
            router.push("/driver/forgot-password");
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
            toast.success("Senha alterada com sucesso. Já pode aceder ao Portal.");
            router.push("/driver/login");
        } catch (error: any) {
            const msg = error.response?.data?.message || "Código inválido ou erro na alteração.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020203] flex items-center justify-center px-6 font-sans">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-[420px] relative z-10"
            >
                {/* Branding HUD */}
                <div className="flex items-center justify-between mb-16">
                    <Link href="/" className="lg:hidden">
                        <img src="/logoMov.png" alt="Logo" className="h-8 w-auto" />
                    </Link>
                    <Link
                        href="/driver/login"
                        className="group flex items-center gap-3 text-[9px] font-medium text-white/40 hover:text-white uppercase tracking-[0.3em] transition-all"
                    >
                        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        <span>Voltar ao Portal</span>
                    </Link>
                </div>

                <div className="mb-12 space-y-4">
                    <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight leading-[1.1] uppercase font-sans">
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-6">
                        {/* Recovery Code */}
                        <div className="space-y-2 group">
                            <label className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/30 group-focus-within:text-brand-gold transition-colors ml-1">Código de Confirmação</label>
                            <div className="relative">
                                <Key className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-brand-gold transition-all duration-500" />
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="000000"
                                    className="w-full bg-transparent border-b border-white/10 py-3 pl-8 pr-0 text-white text-xs font-medium uppercase tracking-[0.5em] placeholder:text-white/10 focus:outline-none focus:border-brand-gold transition-all duration-500"
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2 group">
                            <label className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/30 group-focus-within:text-brand-gold transition-colors ml-1">Nova Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-brand-gold transition-all duration-500" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-transparent border-b border-white/10 py-3 pl-8 pr-0 text-white text-xs font-medium tracking-[0.2em] placeholder:text-white/10 focus:outline-none focus:border-brand-gold transition-all duration-500"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-brand-gold text-black text-[10px] font-bold uppercase tracking-[0.4em] rounded-full hover:shadow-[0_20px_50px_-10px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden mt-8"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1000ms] ease-in-out z-0" />
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (
                            <span className="relative z-10 flex items-center justify-center gap-3">
                                Atualizar Senha
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

export default function DriverResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050507] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
            </div>
        }>
            <DriverResetPasswordContent />
        </Suspense>
    );
}
