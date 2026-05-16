"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck, Loader2, ChevronRight, XCircle } from "lucide-react";
import axios from "axios";
import Link from "next/link";

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
        <div className="min-h-screen bg-[#07070A] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-full max-w-md animate-luxury-reveal">
                <img src="/logoMov.png" alt="MOVNLY" className="h-10 md:h-12 w-auto mx-auto mb-12" />

                {status === "loading" && (
                    <div className="space-y-6">
                        <Loader2 className="w-12 h-12 text-brand-gold animate-spin mx-auto" />
                        <h2 className="text-white uppercase tracking-[0.3em] font-black text-xl">A verificar conta</h2>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest">
                            Estamos a confirmar os seus dados...
                        </p>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-8 animate-luxury-reveal">
                        <div className="w-24 h-24 bg-brand-gold/10 border border-brand-gold/20 rounded-full flex items-center justify-center mx-auto">
                            <ShieldCheck className="w-12 h-12 text-brand-gold" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-white uppercase tracking-[0.3em] font-black text-2xl">Confirmado</h2>
                            <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed max-w-[280px] mx-auto">
                                A sua conta foi verificada com sucesso. Bem-vindo à MOVNLY.
                            </p>
                        </div>
                        <Link
                            href="/login"
                            className="btn-editorial btn-editorial-primary w-full py-5 flex items-center justify-center gap-4"
                        >
                            <span className="text-[10px] uppercase font-black tracking-[0.2em]">Entrar na Conta</span>
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-8 animate-luxury-reveal">
                        <div className="w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-white uppercase tracking-[0.3em] font-black text-2xl">Erro na Verificação</h2>
                            <p className="text-white/40 text-[10px] uppercase tracking-widest leading-relaxed max-w-[280px] mx-auto text-red-400">
                                O código de verificação é inválido ou já expirou.
                            </p>
                        </div>
                        <Link
                            href="/register"
                            className="text-white/40 hover:text-white transition-colors text-[10px] uppercase tracking-widest border-b border-white/10 pb-1"
                        >
                            Tentar registar novamente
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#07070A] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-brand-gold animate-spin" />
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
