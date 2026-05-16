"use client";

import { useI18n } from "@/i18n/context";
import { Check, ArrowRight, ShieldCheck, Clock, Zap, Star } from "lucide-react";
import { motion } from "framer-motion";

export function HowItWorks() {
    const { t, tArray } = useI18n();

    return (
        <section className="nx-section bg-luxury-mesh py-32 overflow-hidden border-t border-white/5">
            <div className="nx-container">

                <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">

                    <div className="space-y-16">
                        <div>
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="text-brand-gold text-[10px] uppercase tracking-[0.5em] font-medium"
                            >
                                {t("howItWorks.sectionBadge")}
                            </motion.span>
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                className="text-5xl md:text-7xl font-bold text-white mt-8 mb-8 tracking-tight leading-[1.1]"
                            >
                                {t("howItWorks.safetyTitle")}
                            </motion.h2>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-lg text-white/50 leading-relaxed max-w-xl font-light"
                            >
                                {t("howItWorks.safetyDesc")}
                            </motion.p>
                        </div>

                        <div className="space-y-12">
                            {tArray("howItWorks.steps").map((step: any, i: number) => (
                                <motion.div
                                    key={step.title}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-start gap-8 md:gap-10 group"
                                >
                                    <div className="flex flex-col items-center pt-1">
                                        <div className="w-12 h-12 rounded-2xl border border-white/20 bg-brand-gold/10 flex items-center justify-center text-brand-gold text-sm font-bold transition-all duration-700 group-hover:bg-brand-gold group-hover:text-black shadow-glow">
                                            {i + 1}
                                        </div>
                                        {i < 2 && <div className="w-[1px] h-20 bg-gradient-to-b from-brand-gold/20 to-transparent my-4" />}
                                    </div>
                                    <div className="pt-1">
                                        <h4 className="text-2xl md:text-3xl text-white font-bold mb-3 tracking-tight group-hover:text-brand-gold transition-colors duration-500">
                                            {step.title}
                                        </h4>
                                        <p className="text-sm md:text-base font-light text-white/40 leading-relaxed max-w-sm">
                                            {step.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Visual Composition V2 */}
                    <div className="relative hidden md:block">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-8 pt-16">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="aspect-[4/5] rounded-[48px] overflow-hidden border border-white/10 shadow-luxury group/img relative"
                                >
                                    <div className="absolute inset-0 bg-brand-gold/5 z-10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-1000" />
                                    <img src="https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" className="w-full h-full object-cover grayscale-[30%] group-hover/img:grayscale-0 transition-all duration-1000" alt="Chauffeur Service" />
                                </motion.div>
                                <motion.div
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    className="p-10 rounded-[48px] bg-brand-gold text-black shadow-luxury-gold relative overflow-hidden"
                                >
                                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/20 blur-3xl rounded-full" />
                                    <Zap className="w-8 h-8 mb-6" />
                                    <h5 className="text-2xl font-bold leading-tight mb-3 uppercase tracking-tighter">{t("howItWorks.concierge")}</h5>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">{t("howItWorks.priorityReady")}</p>
                                </motion.div>
                            </div>
                            <div className="space-y-8">
                                <motion.div
                                    whileInView={{ opacity: 1, y: 0 }}
                                    initial={{ opacity: 0, y: 30 }}
                                    className="p-10 rounded-[48px] glass-bento-luxury border-white/10 shadow-luxury relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Clock className="w-8 h-8 text-brand-gold/60 mb-6 group-hover:text-brand-gold transition-colors" />
                                    <h5 className="text-2xl font-bold text-white leading-tight mb-3 uppercase tracking-tighter">{t("howItWorks.ops247")}</h5>
                                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">{t("howItWorks.liveOps")}</p>
                                </motion.div>
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="aspect-[4/6] rounded-[48px] overflow-hidden border border-white/10 shadow-luxury group/img relative"
                                >
                                    <div className="absolute inset-0 bg-brand-gold/5 z-10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-1000" />
                                    <img src="https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" className="w-full h-full object-cover grayscale-[30%] group-hover/img:grayscale-0 transition-all duration-[2s]" alt="Support" />
                                </motion.div>
                            </div>
                        </div>

                        {/* Interaction Pills V2 */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
                            {tArray("howItWorks.items").map((item: any, i: number) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                    className="px-10 py-5 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-full flex items-center gap-4 shadow-2xl hover:border-brand-gold/40 transition-colors cursor-default group"
                                >
                                    <div className="w-2 h-2 rounded-full bg-brand-gold/50 group-hover:bg-brand-gold group-hover:scale-125 transition-all" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/70 whitespace-nowrap group-hover:text-white transition-colors">{item.label}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
