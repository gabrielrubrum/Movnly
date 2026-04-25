"use client";

import { useState, useEffect } from "react";
import { X, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/context";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);
    const { t } = useI18n();

    useEffect(() => {
        const consent = localStorage.getItem("nexride_cookies_accepted");
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const accept = () => {
        localStorage.setItem("nexride_cookies_accepted", "true");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-8 left-8 right-8 md:left-auto md:w-[480px] z-[500] animate-luxury-reveal">
            <div className="glass-concierge luxury-card p-10 border-white/10 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-brand-gold/40 group-hover:bg-brand-gold transition-colors duration-700" />

                <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-full bg-brand-gold/5 flex items-center justify-center border border-brand-gold/10 flex-shrink-0">
                        <ShieldCheck className="w-6 h-6 text-brand-gold" />
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-black uppercase tracking-[0.3em] text-white">Privacidade & Cookies</h4>
                        <p className="text-[13px] text-white/40 leading-relaxed font-sans">
                            Utilizamos cookies para personalizar a sua experiência de reserva e garantir a segurança das suas transações. Ao continuar, concorda com a nossa política.
                        </p>

                        <div className="flex items-center gap-4 pt-4">
                            <button
                                onClick={accept}
                                className="px-8 py-4 bg-brand-gold text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all duration-500 shadow-[0_10px_30px_rgba(212,175,55,0.15)]"
                            >
                                Aceitar Tudo
                            </button>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors"
                            >
                                Recusar
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
