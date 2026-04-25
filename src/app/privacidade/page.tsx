"use client";

import { motion } from "framer-motion";
import { Eye, Lock, Database, Globe, ArrowLeft } from "lucide-react";
import { useI18n } from "@/i18n/context";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PrivacySection {
    title: string;
    content: string;
}

export default function PrivacyPage() {
    const { t } = useI18n();

    const sections = (t("legal.privacy.sections") as PrivacySection[]) || [];
    
    const icons = [Eye, Lock, Database, Globe];

    return (
        <main className="min-h-screen bg-[#07070A] pt-48 pb-32 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-500/5 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-gold/5 blur-[140px] rounded-full translate-y-1/2 -translate-x-1/2" />
            
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
                            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em]">
                                {t("legal.privacy.badge")}
                            </span>
                            <h1 className="text-white text-7xl md:text-8xl font-light tracking-tighter leading-[0.85] font-serif">
                                {t("legal.privacy.title").split(" ")[0]} 
                                <span className="block italic text-brand-gold font-extralight mt-2">
                                    {t("legal.privacy.title").split(" ").slice(1).join(" ")}
                                </span>
                            </h1>
                            <p className="text-white/30 text-xs font-medium uppercase tracking-[0.4em] max-w-md leading-relaxed">
                                {t("legal.privacy.lastUpdated")}
                            </p>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24 border-t border-white/5 pt-24">
                        {sections.map((section, idx) => {
                            const Icon = icons[idx] || Eye;
                            return (
                                <motion.section 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, duration: 0.8 }}
                                    className="group"
                                >
                                    <div className="space-y-8">
                                        <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover:border-emerald-500/30 transition-all duration-700 group-hover:scale-110">
                                            <Icon className="w-6 h-6 text-emerald-500/40 group-hover:text-emerald-400 transition-colors" />
                                        </div>
                                        <div className="space-y-6">
                                            <h2 className="text-white text-xl font-bold tracking-tight font-serif italic italic group-hover:text-brand-gold transition-colors">
                                                {section.title}
                                            </h2>
                                            <p className="text-white/50 text-base leading-relaxed font-light">
                                                {section.content}
                                            </p>
                                        </div>
                                    </div>
                                </motion.section>
                            );
                        })}
                    </div>

                    {/* Footer Policy */}
                    <div className="mt-48 pt-12 border-t border-white/5 flex flex-col items-center gap-8 opacity-40 hover:opacity-100 transition-opacity duration-1000">
                        <div className="flex items-center gap-4">
                            <div className="h-px w-12 bg-white/20" />
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/50">NexRice Compliance Unit</span>
                            <div className="h-px w-12 bg-white/20" />
                        </div>
                        <p className="text-white/20 text-[8px] uppercase tracking-[0.4em] text-center max-w-sm leading-loose">
                            Compromisso inabalável com o sigilo profissional e a proteção de dados dos nossos passageiros.
                        </p>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
