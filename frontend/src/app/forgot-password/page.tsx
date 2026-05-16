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
        <div className="min-h-screen bg-[#050507] flex items-center justify-center px-6 font-sans selection:bg-brand-gold selection:text-black">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="w-full max-w-[420px]"
            >
                {/* Nav */}
                <div className="flex items-center justify-between mb-10">
                    <Link
                        href="/login"
                        className="group flex items-center gap-3 text-[10px] font-bold text-white/20 hover:text-white uppercase tracking-[0.3em] transition-all"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Voltar</span>
                    </Link>
                    <Link href="/">
                        <img src="/logoMov.png" alt="MOVNLY" className="h-10 md:h-12 w-auto  opacity-30 hover:opacity-80 transition-opacity" />
                    </Link>
                </div>

                <AnimatePresence mode="wait">
                    {!sent ? (
                        <motion.div key="form-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Heading */}
                            <div className="mb-8">
                                <h1 className="text-white text-5xl font-extralight tracking-tighter leading-[0.9]">
                                    Recuperar
                                    <span className="font-black italic text-brand-gold"> Acesso</span>
                                </h1>
                                <p className="text-white/30 text-xs font-light leading-relaxed mt-4 max-w-[300px]">
                                    Introduza o seu e-mail para receber o código de recuperação da sua conta MOVNLY.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 ml-1">
                                        Endereço de E-mail
                                    </label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-brand-gold transition-all duration-500" />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="ex: nome@empresa.com"
                                            className="w-full bg-white/[0.01] border border-white/5 py-5 pl-12 pr-6 rounded-2xl text-white text-xs placeholder:text-white/10 focus:outline-none focus:border-brand-gold/20 focus:bg-white/[0.03] transition-all duration-500 shadow-2xl"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-14 bg-gradient-to-r from-brand-gold to-[#B8860B] text-black text-[10px] font-black uppercase tracking-[0.8em] rounded-2xl hover:scale-[1.01] hover:brightness-110 transition-all shadow-[0_20px_50px_-15px_rgba(212,175,55,0.4)] group flex items-center justify-center gap-4 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out opacity-20" />
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <span className="relative z-10 flex items-center gap-3 ml-[0.8em]">
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
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-8 text-center py-4"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mx-auto">
                                <ShieldCheck className="w-8 h-8 text-brand-gold" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-white text-2xl font-extralight tracking-tight">
                                    Código <span className="font-black italic text-brand-gold">Enviado</span>
                                </h2>
                                <p className="text-white/30 text-xs font-light leading-relaxed max-w-[260px] mx-auto">
                                    Verifique a sua caixa de entrada em <span className="text-white/60">{email}</span> e siga as instruções.
                                </p>
                            </div>
                            <Link
                                href={`/reset-password?email=${encodeURIComponent(email)}`}
                                className="w-full h-14 bg-white/[0.03] border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.8em] rounded-2xl hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3 group"
                            >
                                Inserir Código
                                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p className="text-white/10 text-[8px] font-bold uppercase tracking-[0.4em] text-center mt-10">
                    © 2024 MOVNLY
                </p>
            </motion.div>
        </div>
    );
}
