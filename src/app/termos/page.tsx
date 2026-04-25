"use client";

import { motion } from "framer-motion";
import { Shield, Scale, ScrollText, AlertTriangle, ArrowLeft } from "lucide-react";
import { useI18n } from "@/i18n/context";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TermsSection {
    title: string;
    content: string;
}

export default function TermsPage() {
    const { t } = useI18n();

    const sections = (t("legal.terms.sections") as TermsSection[]) || [];
    
    const icons = [Shield, Scale, ScrollText, AlertTriangle];

    return (
        <main className="min-h-screen bg-[#07070A] pt-48 pb-32 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-gold/5 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/5 blur-[140px] rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="max-w-5xl mx-auto px-6 relative z-10 font-sans">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Header Section */}
                    <div className="flex flex-col gap-12 mb-32">
                        <Link 
                            href="/"
                            className="flex items-center gap-3 text-white/40 hover:text-brand-gold transition-all group w-fit"
                        >
                            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand-gold/40">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Voltar</span>
                        </Link>

                        <div className="space-y-8">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] font-black uppercase tracking-[0.4em]">
                                {t("legal.terms.badge")}
                            </span>
                            <h1 className="text-white text-7xl md:text-8xl font-light tracking-tighter leading-[0.85] font-serif">
                                {t("legal.terms.title").split(" ")[0]} 
                                <span className="block italic text-brand-gold font-extralight mt-2">
                                    {t("legal.terms.title").split(" ").slice(1).join(" ")}
                                </span>
                            </h1>
                            <p className="text-white/30 text-xs font-medium uppercase tracking-[0.4em] max-w-md leading-relaxed">
                                {t("legal.terms.lastUpdated")}
                            </p>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="mt-24 space-y-32 border-t border-white/5 pt-24">
                        {sections.map((section, idx) => {
                            const Icon = icons[idx] || Shield;
                            return (
                                <motion.section 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, duration: 0.8 }}
                                    className="group grid md:grid-cols-[1fr_2fr] gap-12 items-start"
                                >
                                    <div className="flex flex-col gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center transition-all duration-700 group-hover:border-brand-gold/30 group-hover:scale-105">
                                            <Icon className="w-7 h-7 text-brand-gold/40 group-hover:text-brand-gold transition-colors" />
                                        </div>
                                        <h2 className="text-white text-2xl font-bold tracking-tight font-serif italic group-hover:text-brand-gold transition-colors">
                                            {section.title}
                                        </h2>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-12 top-0 bottom-0 w-px bg-white/5 hidden md:block" />
                                        <p className="text-white/50 text-xl leading-relaxed font-light italic text-serif">
                                            {section.content}
                                        </p>
                                    </div>
                                </motion.section>
                            );
                        })}
                    </div>

                    {/* Footer Legal */}
                    <div className="mt-48 pt-12 border-t border-white/5 flex flex-col items-center gap-8 opacity-40 hover:opacity-100 transition-opacity duration-1000">
                        <div className="flex items-center gap-4">
                            <div className="h-px w-12 bg-white/20" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/50">NexRice Institutional</span>
                            <div className="h-px w-12 bg-white/20" />
                        </div>
                        <p className="text-white/20 text-[8px] uppercase tracking-[0.4em] text-center max-w-sm leading-loose">
                            Ao utilizar os nossos serviços, o passageiro aceita integralmente as condições de transporte e segurança aqui descritas.
                        </p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}

