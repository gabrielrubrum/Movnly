"use client";

import { useState, useEffect } from "react";
import { X, Cookie } from "lucide-react";
import Link from "next/link";

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem("nexride_cookies_accepted");
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const accept = () => {
        localStorage.setItem("nexride_cookies_accepted", "true");
        setIsVisible(false);
    };

    const decline = () => {
        localStorage.setItem("nexride_cookies_accepted", "false");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-[420px] z-[500]"
            style={{ animation: "fadeInUp 0.4s ease" }}>
            <div className="rounded-2xl p-6 relative overflow-hidden"
                style={{ background: "#0A0A0F", border: "1px solid rgba(212,175,55,0.2)", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>

                <div className="absolute top-0 left-0 w-full h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)" }} />

                <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/15 flex items-center justify-center flex-shrink-0">
                        <Cookie className="w-4.5 h-4.5 text-brand-gold" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-white mb-1">Cookies e Privacidade</h4>
                        <p className="text-[12px] text-white/40 leading-relaxed">
                            Usamos cookies para melhorar a sua experiência e garantir a segurança das transações.{" "}
                            <Link href="/privacidade" className="text-brand-gold hover:underline">Saber mais</Link>
                        </p>
                    </div>
                    <button onClick={decline} className="text-white/20 hover:text-white transition-colors flex-shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex gap-3">
                    <button onClick={accept}
                        className="flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-black transition-all hover:bg-white"
                        style={{ background: "#D4AF37" }}>
                        Aceitar
                    </button>
                    <button onClick={decline}
                        className="flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        Recusar
                    </button>
                </div>
            </div>
            <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        </div>
    );
}
