"use client";

import { useState } from "react";
import { Mail, ArrowLeft, ChevronRight, Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function DriverForgotPasswordPage() {
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

                <AnimatePresence mode="wait">
                    {!sent ? (
                        <motion.div key="form-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Heading */}
                            <div className="mb-12 space-y-4">
                                <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight leading-[1.1] uppercase font-sans">
                                    Recuperar<br />
                                    <span className="text-brand-gold font-medium">Acesso.</span>
                                </h2>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-[1px] bg-brand-gold/40" />
                                    <p className="text-white/40 text-[9px] font-medium uppercase tracking-[0.4em] leading-none">
                                        Portal do Motorista
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2 group">
                                    <label className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/30 group-focus-within:text-brand-gold transition-colors ml-1">
                                        E-mail do Motorista
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-brand-gold transition-all duration-500" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="MOTORISTA@EXEMPLO.COM"
                                            className="w-full bg-transparent border-b border-white/10 py-3 pl-8 pr-0 text-white text-xs font-medium uppercase tracking-[0.1em] placeholder:text-white/10 focus:outline-none focus:border-brand-gold transition-all duration-500"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-brand-gold text-black text-[10px] font-bold uppercase tracking-[0.4em] rounded-full hover:shadow-[0_20px_50px_-10px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden mt-8"
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
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success-section"
                            initial={{ scale: 0.98, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center space-y-8 py-8"
                        >
                            <div className="w-20 h-20 rounded-full bg-brand-gold/5 border border-brand-gold/10 flex items-center justify-center mx-auto relative group">
                                <ShieldCheck className="w-8 h-8 text-brand-gold animate-pulse" />
                                <div className="absolute inset-0 bg-brand-gold/20 blur-[30px] rounded-full opacity-20" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight leading-[1.1] uppercase font-sans">
                                    Código <br />
                                    <span className="text-brand-gold font-medium">Enviado.</span>
                                </h2>
                                <p className="text-white/40 text-[9px] font-medium uppercase tracking-[0.3em] leading-relaxed max-w-[260px] mx-auto mt-4">
                                    Verifique o seu e-mail <br/><span className="text-white/80 font-bold">{email}</span>
                                </p>
                            </div>
                            <Link
                                href={`/driver/reset-password?email=${encodeURIComponent(email)}`}
                                className="w-full h-14 bg-white/[0.03] border border-white/10 text-white text-[10px] font-bold uppercase tracking-[0.4em] rounded-full hover:bg-white hover:text-black hover:border-transparent transition-all flex items-center justify-center gap-3 mt-8"
                            >
                                Inserir Código
                                <ChevronRight className="w-3.5 h-3.5 hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
