"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { XCircle, RefreshCcw, Headset, ArrowRight } from "lucide-react";

export default function PaymentCancelledPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#07070A] pt-40 pb-24 relative overflow-hidden flex items-center justify-center">
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 blur-[120px] rounded-full" />
                
                <div className="max-w-xl w-full px-6 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="card-premium p-12 text-center border-red-500/20"
                    >
                        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-8">
                            <XCircle className="w-10 h-10 text-red-500" />
                        </div>

                        <h1 className="text-4xl font-normal text-white mb-4 italic text-serif tracking-tight">Pagamento <span className="text-red-500 not-italic">Cancelado</span></h1>
                        <p className="text-white/40 text-sm leading-relaxed mb-12">
                            O processo de transação foi interrompido. Nenhuma cobrança foi efetuada no seu cartão. Se isto foi um erro, pode tentar novamente abaixo.
                        </p>

                        <div className="grid gap-4">
                            <Link 
                                href="/reservar" 
                                className="w-full py-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 rounded-2xl flex items-center justify-center gap-3 transition-all group"
                            >
                                <RefreshCcw className="w-4 h-4 text-brand-gold group-hover:rotate-180 transition-transform duration-700" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">Tentar Novamente</span>
                            </Link>

                            <Link 
                                href="/dashboard" 
                                className="w-full py-4 bg-brand-gold hover:bg-brand-600 rounded-2xl flex items-center justify-center gap-3 transition-all text-black shadow-[0_4px_20px_rgba(197,160,89,0.3)]"
                            >
                                <ArrowRight className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Voltar ao Portal Portfolio</span>
                            </Link>

                            <button 
                                className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors"
                            >
                                <Headset className="w-3.5 h-3.5" />
                                Falar com o Concierge 24/7
                            </button>
                        </div>
                    </motion.div>

                    <p className="text-center text-[9px] text-white/10 uppercase tracking-[0.4em] mt-12 font-black">
                        NexRice Elite Security — Falha Controlada
                    </p>
                </div>
            </main>
            <Footer />
        </>
    );
}
