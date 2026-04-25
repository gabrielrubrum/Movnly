"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import {
    Eye, EyeOff, Lock, Mail, ArrowLeft,
    Loader2, ShieldCheck, ChevronRight,
    Fingerprint, Sparkles, Car
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function DriverLoginForm({ loading, error, onSubmit, form, setForm, requires2FA, setRequires2FA, twoFactorCode, setTwoFactorCode }: any) {
    const [showPw, setShowPw] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-[440px] relative z-10"
        >
            {/* Upper Navigation */}
            <div className="flex items-center justify-between mb-12">
                <Link href="/login" className="group flex items-center gap-3 text-[10px] font-bold text-white/30 hover:text-white uppercase tracking-[0.3em] transition-all">
                    <div className="w-8 h-8 rounded-full border border-white/5 flex items-center justify-center group-hover:bg-white/5 group-hover:border-white/10 transition-all">
                        <ArrowLeft className="w-3.5 h-3.5" />
                    </div>
                    <span>Voltar</span>
                </Link>
                <div className="flex items-center gap-2 px-3 py-1 bg-brand-gold/10 border border-brand-gold/20 rounded-full">
                    <div className="w-1 h-1 rounded-full bg-brand-gold animate-pulse" />
                    <span className="text-[9px] font-bold text-brand-gold uppercase tracking-widest">Canal de Parceiro</span>
                </div>
            </div>

            <div className="mb-12">
                <h2 className="text-white text-5xl font-light italic tracking-tight mb-2 leading-tight">
                    Portal do <span className="text-brand-gold not-italic">Motorista</span>
                </h2>
                <p className="text-white/30 text-sm font-light leading-relaxed">
                    Aceda à sua plataforma de gestão de missões e ganhos.
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-[10px] font-bold uppercase tracking-widest text-center"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-5">
                    {!requires2FA ? (
                        <>
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 ml-1">E-mail Profissional</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-brand-gold transition-colors" />
                                    <input
                                        type="email"
                                        placeholder="mario.silva@nexride.pt"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full bg-white/[0.02] border border-white/5 py-4 pl-12 pr-6 rounded-xl text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-brand-gold/30 focus:bg-white/[0.04] transition-all shadow-xl"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-1">
                                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">Palavra-passe</label>
                                    <Link href="/forgot-password" intrinsic-title="Recuperar" className="text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gold/60 hover:text-brand-gold transition-all">
                                        Esqueceu-se?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-brand-gold transition-colors" />
                                    <input
                                        type={showPw ? "text" : "password"}
                                        placeholder="••••••••"
                                        required
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="w-full bg-white/[0.02] border border-white/5 py-4 pl-12 pr-12 rounded-xl text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-brand-gold/30 focus:bg-white/[0.04] transition-all shadow-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(!showPw)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-white/10 hover:text-white transition-colors hover:bg-white/5"
                                    >
                                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-6 text-center"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-8 h-8 text-brand-gold" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-gold mb-4 block">Cofre de Segurança</label>
                                <input
                                    type="text"
                                    placeholder="000000"
                                    maxLength={6}
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value)}
                                    className="w-full bg-white/[0.03] border border-white/10 py-5 text-center text-2xl font-light tracking-[0.8em] text-brand-gold rounded-2xl focus:outline-none focus:border-brand-gold focus:bg-brand-gold/5 transition-all shadow-2xl"
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Institutional Honeypot */}
                    <div className="hidden">
                        <input
                            type="text"
                            name="website"
                            value={form.honeypot || ""}
                            onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
                            tabIndex={-1}
                            autoComplete="off"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-brand-gold text-black text-[11px] font-bold uppercase tracking-[1em] rounded-xl hover:bg-white transition-all shadow-[0_10px_40px_-10px_rgba(212,175,55,0.4)] group flex items-center justify-center gap-4 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <span className="relative z-10 flex items-center gap-4">
                            Entrar na Conta
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    )}
                </button>
            </form>

            <div className="mt-10 pt-10 border-t border-white/5 flex flex-col items-center gap-6">
                <p className="text-[10px] text-white/20 uppercase tracking-widest text-center">
                    Problemas com o acesso? Contacte o suporte operacional.
                </p>
                <Link href="/contact" className="text-brand-gold hover:text-white transition-colors text-[10px] uppercase font-bold tracking-widest">
                    Suporte ao Motorista
                </Link>
            </div>
        </motion.div>
    );
}

function DriverLoginPageContent() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [requires2FA, setRequires2FA] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState("");
    const [biometricState, setBiometricState] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');

    const router = useRouter();
    const searchParams = useSearchParams();
    const setAuth = useAuthStore((state) => state.setAuth);

    const redirect = searchParams.get("redirect") || "/motorista";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

    const [form, setForm] = useState({
        email: "",
        password: "",
        honeypot: "",
    });

    const handleBiometricLogin = async () => {
        toast.info("Autenticação biométrica em desenvolvimento para a App Nativa.", {
            description: "Por favor, utilize as suas credenciais profissionais de e-mail."
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${apiUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, twoFactorCode: requires2FA ? twoFactorCode : undefined }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Authentication failed");

            if (data.requiresTwoFactor) {
                setRequires2FA(true);
                toast.info("Código de segurança necessário.");
                return;
            }

            if (data.user.role !== "DRIVER" && data.user.role !== "ADMIN") {
                throw new Error("Acesso restrito a motoristas parceiros.");
            }

            setAuth(data.user, data.access_token);
            toast.success("Portal do Motorista acessado.");
            router.push(redirect);
        } catch (err: any) {
            setError(err.message);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050507] flex overflow-hidden font-sans selection:bg-brand-gold selection:text-black">

            {/* Cinematic Background */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-gold/10 rounded-full blur-[150px] opacity-40 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[120px] opacity-20" />
                <div className="absolute inset-0 bg-[#07070A]/80 backdrop-blur-[2px]" />
            </div>

            {/* LEFT SIDE - BRANDING */}
            <div className="hidden lg:flex w-[42%] relative flex-col justify-between p-20 z-10 border-r border-white/5">
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <img src="/logo-mark2.svg" alt="NexRice Elite" className="w-12 h-12 grayscale group-hover:grayscale-0 transition-all duration-500" />
                        <span className="text-xl font-black text-white tracking-[0.2em] group-hover:tracking-[0.25em] transition-all duration-500 font-sans uppercase">
                            Nex<span className="text-brand-gold">Parceiros</span>
                        </span>
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative z-10 max-w-lg"
                >
                    <div className="flex items-center gap-3 mb-10">
                        <div className="h-[1px] w-8 bg-brand-gold/40" />
                        <span className="text-[10px] font-black text-brand-gold/60 uppercase tracking-[0.5em]">Excelência Operacional</span>
                    </div>

                    <h1 className="text-white text-7xl font-extralight tracking-tighter italic leading-[0.9] mb-12">
                        Mantenha Lisboa <br />
                        <span className="text-brand-gold font-light not-italic">em movimento.</span>
                    </h1>

                    <p className="text-white/30 text-xl font-light italic leading-relaxed max-w-sm mb-16">
                        Aceda ao seu painel de controlo, verifique as suas missões e acompanhe os seus ganhos.
                    </p>

                    <motion.button
                        onClick={handleBiometricLogin}
                        disabled={biometricState === 'scanning' || biometricState === 'success'}
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "w-full flex items-center gap-6 p-6 rounded-2xl bg-white/[0.02] border border-white/5 transition-all relative overflow-hidden group",
                            biometricState === 'scanning' && "border-brand-gold/30 bg-brand-gold/[0.02]",
                            biometricState === 'success' && "border-emerald-500/30 bg-emerald-500/[0.02]"
                        )}
                    >
                        {/* Scanning Laser Line */}
                        {biometricState === 'scanning' && (
                            <motion.div
                                initial={{ top: "0%" }}
                                style={{ top: "0%" }}
                                animate={{ top: "100%" }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent z-20 shadow-[0_0_15px_rgba(212,175,55,0.8)]"
                            />
                        )}

                        <div className="relative">
                            <Fingerprint className={cn(
                                "w-10 h-10 transition-all duration-700",
                                biometricState === 'idle' && "text-brand-gold opacity-40 group-hover:opacity-100",
                                biometricState === 'scanning' && "text-brand-gold animate-pulse",
                                biometricState === 'success' && "text-emerald-400 scale-110"
                            )} />
                            {biometricState === 'success' && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 2, opacity: 0 }}
                                    transition={{ duration: 1 }}
                                    className="absolute inset-0 bg-emerald-400 rounded-full"
                                />
                            )}
                        </div>

                        <div className="text-left">
                            <div className={cn(
                                "text-[10px] font-bold uppercase tracking-widest mb-1 transition-colors",
                                biometricState === 'success' ? "text-emerald-400" : "text-white"
                            )}>
                                {biometricState === 'idle' && "Acesso Biométrico"}
                                {biometricState === 'scanning' && "A Digitalizar..."}
                                {biometricState === 'success' && "Identidade Confirmada"}
                            </div>
                            <div className="text-white/20 text-[9px] uppercase tracking-widest">
                                {biometricState === 'success' ? "A carregar perfil de parceiro" : "Segurança máxima garantida"}
                            </div>
                        </div>

                        {biometricState === 'scanning' && (
                            <div className="ml-auto">
                                <Loader2 className="w-4 h-4 text-brand-gold animate-spin" />
                            </div>
                        )}
                        {biometricState === 'success' && (
                            <div className="ml-auto">
                                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            </div>
                        )}
                    </motion.button>
                </motion.div>

                <div className="relative z-10 flex items-center justify-between text-[8px] font-bold text-white/10 uppercase tracking-[0.5em]">
                    <span>© 2026 NexRice Fleet</span>
                    <Link href="/terms" className="hover:text-white transition-colors">Termos de Parceiro</Link>
                </div>
            </div>

            {/* RIGHT SIDE - FORM */}
            <div className="w-full lg:w-[58%] flex items-center justify-center p-6 md:p-20 relative z-10">
                <DriverLoginForm
                    loading={loading}
                    error={error}
                    onSubmit={handleSubmit}
                    form={form}
                    setForm={setForm}
                    requires2FA={requires2FA}
                    setRequires2FA={setRequires2FA}
                    twoFactorCode={twoFactorCode}
                    setTwoFactorCode={setTwoFactorCode}
                />
            </div>
        </div>
    );
}

export default function DriverLoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#050507] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
            </div>
        }>
            <DriverLoginPageContent />
        </Suspense>
    );
}
