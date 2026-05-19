"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldAlert, RefreshCcw, Headset, ArrowLeft } from "lucide-react";
import { useI18n } from "@/i18n/context";

export default function PaymentFailedPage() {
    const { t } = useI18n();

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#07070A] pt-40 pb-24 relative overflow-hidden flex items-center justify-center font-sans">
                {/* Background Decor with Luxury Gold/Crimson Radial Blur */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-950/10 blur-[130px] rounded-full pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-gold/2 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="max-w-xl w-full px-6 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-[#09090D]/85 border border-red-500/10 rounded-[2.5rem] p-10 md:p-14 text-center backdrop-blur-xl shadow-[0_30px_70px_rgba(0,0,0,0.8)] relative group overflow-hidden"
                    >
                        {/* Golden/Crimson top shimmer */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
                        
                        <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-red-500/[0.03] border border-red-500/10 mb-8 relative">
                            <div className="absolute inset-0 rounded-full border border-red-500/5 border-dashed animate-spin-slow opacity-40" />
                            <ShieldAlert className="w-10 h-10 text-red-500/80 drop-shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse" />
                        </div>

                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500/60 block mb-3">
                            Elite Security Protocols
                        </span>
                        
                        <h1 className="text-4xl md:text-5xl font-light text-white mb-5 tracking-tight font-sans">
                            {t("bookingFlow.payment.failedTitle")}
                        </h1>
                        
                        <p className="text-white/40 text-xs md:text-sm leading-relaxed max-w-md mx-auto mb-10 font-normal">
                            {t("bookingFlow.payment.failedDesc")}
                        </p>

                        <div className="space-y-4 max-w-sm mx-auto">
                            <Link 
                                href="/reservar" 
                                className="w-full py-4 bg-gradient-to-br from-brand-gold via-[#C5A028] to-brand-gold text-black rounded-full flex items-center justify-center gap-3 transition-all font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] duration-500 shadow-[0_15px_30px_rgba(197,160,40,0.15)] group cursor-pointer"
                            >
                                <RefreshCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-700" />
                                <span>{t("bookingFlow.payment.failedActionRetry")}</span>
                            </Link>

                            <Link 
                                href="/dashboard" 
                                className="w-full py-4 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 rounded-full flex items-center justify-center gap-3 transition-all text-white/70 hover:text-white font-black text-[10px] uppercase tracking-widest duration-500 cursor-pointer"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                <span>{t("bookingFlow.payment.failedActionDashboard")}</span>
                            </Link>

                            <div className="pt-4 border-t border-white/[0.04]">
                                <a 
                                    href="tel:+351924851105"
                                    className="inline-flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-white/30 hover:text-brand-gold transition-colors duration-500 group cursor-pointer"
                                >
                                    <Headset className="w-3.5 h-3.5 text-white/20 group-hover:text-brand-gold" />
                                    <span>{t("bookingFlow.payment.failedActionSupport")}</span>
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    <p className="text-center text-[8px] text-white/10 uppercase tracking-[0.5em] mt-10 font-black">
                        MOVNLY GLOBAL SECURE GATEWAY
                    </p>
                </div>
            </main>
            <Footer />
        </>
    );
}
