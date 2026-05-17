"use client";

import { useState } from "react";
import { Mail, ArrowLeft, ChevronRight, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/auth/forgot-password`, { email });
            setSent(true);
            toast.success("Código enviado com sucesso.");
        } catch (error: any) {
            const msg = error.response?.data?.message || "Ocorreu um erro ao enviar o código.";
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

                <AnimatePresence mode="wait">
                    {!sent ? (
                        <motion.div 
                            key="form-section" 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="luxury-card p-10 md:p-12"
                        >
                            <div className="mb-10 space-y-4">
                                <h2 className="text-4xl font-light text-white tracking-tight leading-none uppercase">
                                    Recuperar<br />
                                    <span className="text-brand-gold font-medium">Senha.</span>
                                </h2>
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-[1px] bg-brand-gold/40" />
                                    <p className="text-white/40 text-[9px] font-medium uppercase tracking-[0.4em] leading-none">
                                        Segurança de Conta
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-2 group">
                                    <label className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/30 group-focus-within:text-brand-gold transition-colors ml-1">
                                        E-mail da Conta
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-brand-gold transition-all duration-500" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="EXEMPLO@EMAIL.COM"
                                            className="w-full bg-transparent border-b border-white/10 py-3 pl-8 pr-0 text-white text-xs font-medium uppercase tracking-[0.1em] placeholder:text-white/10 focus:outline-none focus:border-brand-gold transition-all duration-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-brand-gold text-black text-[10px] font-bold uppercase tracking-[0.4em] rounded-full hover:shadow-[0_20px_50px_-10px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden mt-4"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1000ms] ease-in-out z-0" />
                                    {loading ? (
                                        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                    ) : (
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            Enviar Código
                                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    )}
                                </button>
                            </form>
                            
                            <div className="mt-8 text-center lg:hidden">
                                <Link
                                    href="/login"
                                    className="text-[9px] font-medium text-white/30 hover:text-white uppercase tracking-[0.3em] transition-all"
                                >
                                    Voltar ao Login
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success-section"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="luxury-card p-12 text-center space-y-10 relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-gold/[0.05] to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

                            <div className="relative">
                                <div className="w-24 h-24 bg-brand-gold/5 border border-brand-gold/20 rounded-full flex items-center justify-center mx-auto relative group">
                                    <ShieldCheck className="w-10 h-10 text-brand-gold relative z-10" />
                                    <div className="absolute inset-0 bg-brand-gold/20 blur-[30px] rounded-full opacity-40 group-hover:opacity-60 transition-opacity" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-white text-3xl font-black uppercase tracking-tight leading-none">
                                    Código <br />
                                    <span className="text-brand-gold">Enviado.</span>
                                </h2>
                                <p className="text-white/40 text-[9px] font-medium uppercase tracking-[0.3em] leading-relaxed max-w-[260px] mx-auto">
                                    Verifique o seu e-mail institucional <br/>
                                    <span className="text-white/70 font-bold tracking-normal lowecase mt-1 block">{email}</span>
                                </p>
                            </div>

                            <Link
                                href={`/reset-password?email=${encodeURIComponent(email)}`}
                                className="w-full h-14 bg-white text-black text-[10px] font-bold uppercase tracking-[0.4em] rounded-full hover:bg-brand-gold transition-all duration-500 flex items-center justify-center gap-3 mt-8 relative z-10"
                            >
                                Inserir Código
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            
                            <button 
                                onClick={() => setSent(false)}
                                className="text-[9px] text-white/20 hover:text-white uppercase tracking-[0.3em] font-medium transition-colors"
                            >
                                Não recebeu? Tentar novamente
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-16 text-center">
                    <p className="text-white/10 text-[8px] font-medium uppercase tracking-[0.5em]">
                        © 2024 MOVNLY · Global Security Protocols
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
