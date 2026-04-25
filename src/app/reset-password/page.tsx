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
        <div className="min-h-screen bg-[#050507] flex items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-brand-gold selection:text-black">

            {/* Cinematic Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-gold/5 rounded-full blur-[150px] opacity-30 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px] opacity-10" />
                <div className="absolute inset-0 bg-[#07070A]/90 backdrop-blur-[2px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-[440px] relative z-10"
            >
                {/* Upper Navigation */}
                <div className="flex items-center justify-between mb-12">
                    <Link href="/forgot-password" className="group flex items-center gap-3 text-[10px] font-bold text-white/30 hover:text-white uppercase tracking-[0.3em] transition-all">
                        <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white/5 group-hover:border-white/10 transition-all">
                            <ArrowLeft className="w-3.5 h-3.5" />
                        </div>
                        <span>Atrás</span>
                    </Link>
                    <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-brand-gold" />
                    </div>
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-white text-5xl font-light italic tracking-tight mb-4 leading-tight">
                        Nova <span className="text-brand-gold not-italic font-normal">Senha</span>
                    </h1>
                    <p className="text-white/30 text-[10px] font-light leading-relaxed max-w-[280px] mx-auto uppercase tracking-[0.3em]">
                        Defina a sua nova senha para <span className="text-white font-bold">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-5">
                        {/* Recovery Code */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 ml-1">Código de Confirmação</label>
                            <div className="relative group">
                                <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-brand-gold transition-colors" />
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="000000"
                                    className="w-full bg-white/[0.02] border border-white/5 py-5 text-center text-xl font-light tracking-[1em] text-brand-gold rounded-2xl placeholder:text-white/10 focus:outline-none focus:border-brand-gold/30 focus:bg-white/[0.04] transition-all shadow-xl"
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 ml-1">Nova Palavra-passe</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-brand-gold transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-white/[0.02] border border-white/5 py-5 pl-12 pr-6 rounded-2xl text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-brand-gold/30 focus:bg-white/[0.04] transition-all shadow-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-16 bg-brand-gold text-black text-[11px] font-bold uppercase tracking-[1em] rounded-2xl hover:bg-white transition-all shadow-[0_10px_40px_-10px_rgba(212,175,55,0.4)] group flex items-center justify-center gap-4 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <span className="relative z-10 flex items-center gap-4">
                                Atualizar Senha
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </button>
                </form>

                <div className="mt-20 pt-10 border-t border-white/5 text-center">
                    <div className="flex items-center justify-center gap-3 text-[8px] font-bold text-white/10 uppercase tracking-[0.5em]">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Segurança NexRice Encriptada</span>
                    </div>
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
