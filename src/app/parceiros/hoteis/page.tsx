"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useI18n } from "@/i18n/context";
import { Building2, Check, ArrowRight, Phone, Shield, Bell, Calendar, Hotel } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function HoteisPage() {
    const { t } = useI18n();

    // Map benefits from i18n
    const benefitIcons = [Shield, Bell, Calendar];
    const benefitKeys = ["0", "1", "2"];
    
    const benefits = benefitKeys.map((key, i) => {
        const benefitData = t(`b2b.segments.hotels.benefits.${key}`) as any;
        return {
            ...benefitData,
            icon: benefitIcons[i],
            size: i === 2 ? "large" : "medium",
            image: i === 2 ? "https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg" : undefined
        };
    });

    return (
        <div className="min-h-screen bg-luxury-mesh text-white selection:bg-brand-gold/30">
            <Navbar />

            <main className="overflow-hidden">
                {/* Elite Hospitality Hero */}
                <section className="relative pt-40 pb-24 overflow-hidden border-b border-white/5">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-gold/5 blur-[140px] rounded-full pointer-events-none animate-glow-pulse" />

                    <div className="nx-container relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -40 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-brand-gold/20 bg-brand-gold/5 text-brand-gold text-[10px] font-black uppercase tracking-[0.4em] mb-10"
                                >
                                    <Hotel className="w-3.5 h-3.5" /> {t("b2b.segments.hotels.badge")}
                                </motion.div>

                                <h1 className="text-6xl md:text-8xl font-bold leading-[1.1] mb-8">
                                    {t("b2b.segments.hotels.subtitle1")}<br />
                                    <span className="font-bold text-brand-gold">{t("b2b.segments.hotels.subtitle2")}</span>
                                </h1>

                                <p className="text-lg md:text-xl text-white/50 mb-12 max-w-xl leading-relaxed font-light">
                                    {t("b2b.segments.hotels.desc")}
                                </p>

                                <div className="flex flex-wrap gap-8 items-center">
                                    <Link href="/book" className="bg-brand-gold text-black px-12 py-5 rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl">
                                        {t("b2b.segments.hotels.cta")}
                                    </Link>
                                    <a href="tel:+351210000000" className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-brand-gold transition-colors flex items-center gap-3 border-b border-white/10 pb-2">
                                        {t("cta.callNow")} <ArrowRight className="w-4 h-4" />
                                    </a>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                                className="relative rounded-[56px] overflow-hidden aspect-square luxury-card group/hero"
                            >
                                <img
                                    src="https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg"
                                    className="w-full h-full object-cover grayscale-[20%] group-hover/hero:grayscale-0 group-hover/hero:scale-110 transition-all duration-[2s]"
                                    alt="Hospitality Service"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                <div className="absolute inset-0 bg-brand-gold/5 transition-opacity group-hover/hero:opacity-0" />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Bento Benefits Grid */}
                <section className="nx-container py-32">
                    <div className="mb-24">
                        <span className="text-brand-gold text-[10px] uppercase tracking-[0.5em] font-medium mb-6 block">Hospitality Excellence</span>
                        <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
                            {t("b2b.segments.hotels.bento_title").split(" ").slice(0, 2).join(" ")}<br />
                            <span className="text-serif italic font-medium text-white/40">{t("b2b.segments.hotels.bento_desc")}</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {benefits.map((benefit, i) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`group relative rounded-[48px] luxury-card p-12 overflow-hidden ${benefit.size === "large" ? "md:col-span-2 flex flex-col md:flex-row gap-12" : "flex flex-col"
                                    }`}
                            >
                                {benefit.image && (
                                    <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <img src={benefit.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[3s]" alt="" />
                                    </div>
                                )}

                                <div className="relative z-10 flex-1">
                                    <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-10 shadow-glow">
                                        <benefit.icon className="w-8 h-8 text-brand-gold" />
                                    </div>
                                    <h3 className="text-3xl font-bold mb-4 tracking-tighter group-hover:text-brand-gold transition-colors">{benefit.title}</h3>
                                    <p className="text-white/40 text-lg leading-relaxed max-w-[280px] font-light italic font-serif">
                                        {benefit.desc}
                                    </p>
                                </div>

                                {benefit.size === "large" && (
                                    <div className="relative z-10 flex-1 flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/10 pt-10 md:pt-0 md:pl-12">
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-1">
                                                <p className="text-3xl font-bold text-white tracking-tighter">24/7</p>
                                                <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold">Suporte Dedicado</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-3xl font-bold text-white tracking-tighter">100%</p>
                                                <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold">Confiança</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Final Call to Action */}
                <section className="nx-container pb-40">
                    <motion.div
                        whileInView={{ opacity: 1, scale: 1 }}
                        initial={{ opacity: 0, scale: 0.98 }}
                        className="glass-bento-premium rounded-[64px] p-12 md:p-32 flex flex-col md:flex-row items-center justify-between gap-16 relative overflow-hidden"
                    >
                        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-gold/5 blur-[150px] rounded-full animate-glow-pulse" />

                        <div className="space-y-8 max-w-2xl relative z-10">
                            <h2 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                                {t("b2b.segments.hotels.subtitle2")}<br />
                                <span className="text-serif italic font-medium text-white/40">{t("b2b.segments.hotels.cta_card_desc")}</span>
                            </h2>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-8 w-full md:w-auto relative z-10">
                            <button className="h-16 px-16 rounded-full bg-brand-gold text-black font-bold text-[10px] uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl">
                                {t("b2b.segments.hotels.cta")}
                            </button>
                            <a href="tel:+351210000000" className="h-16 px-12 rounded-full border border-white/10 flex items-center justify-center gap-4 text-white/30 hover:text-white transition-all group">
                                <Phone className="w-5 h-5 text-brand-gold/60 group-hover:text-brand-gold transition-colors" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t("cta.callNow").includes(":") ? t("cta.callNow").split(":")[1].trim() : t("cta.callNow")}</span>
                            </a>
                        </div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
