"use client";

import { useI18n } from "@/i18n/context";
import { Shield, Plane, Clock, MapPin, CheckCircle2 } from "lucide-react";

export function WhyChooseUs() {
    const { t, tArray } = useI18n();

    return (
        <section className="nx-section bg-surface-0 relative overflow-hidden py-24">
            <div className="nx-container relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">

                    {/* Professional Visual Narrative */}
                    <div className="relative group animate-luxury-reveal pt-8 lg:pt-0">
                        <div className="relative aspect-[3/4] md:aspect-[4/5] rounded-[24px] md:rounded-[48px] overflow-hidden border border-white/5 shadow-2xl bg-surface-1">
                            <img
                                src="https://images.pexels.com/photos/3354648/pexels-photo-3354648.jpeg?auto=compress&cs=tinysrgb&w=1200"
                                alt="Motorista Profissional NexRice"
                                className="w-full h-full object-cover transition-all duration-[4s] group-hover:scale-105 saturate-[0.8] contrast-[1.1]"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#07070A]/90 via-transparent to-transparent opacity-80" />

                            {/* Floating Top Badge */}
                            <div className="absolute top-6 left-6 flex items-center gap-2.5 px-5 py-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">{t("whyChooseUs.badge")}</span>
                            </div>

                            {/* Floating Overlay Card - Optimized for Mobile */}
                            <div className="absolute bottom-4 left-4 right-4 lg:bottom-10 lg:left-10 lg:right-10 p-6 md:p-10 bg-black/50 backdrop-blur-xl border border-white/10 rounded-[24px] md:rounded-[32px] animate-luxury-reveal shadow-2xl">
                                <h2 className="text-xl md:text-4xl font-bold text-white mb-3 tracking-tight leading-loose">
                                    {t("whyChooseUs.title1")} <span className="opacity-40">{t("whyChooseUs.title2")}</span> {t("whyChooseUs.title3")}
                                </h2>
                                <p className="text-white/40 text-[9px] md:text-sm font-bold uppercase tracking-[0.2em] leading-relaxed">
                                    {t("whyChooseUs.sub")}
                                </p>
                            </div>
                        </div>

                        {/* Ambient Glow */}
                        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] opacity-10 select-none pointer-events-none" />
                    </div>

                    {/* Content Narrative */}
                    <div className="space-y-10 md:space-y-16 animate-luxury-reveal" style={{ animationDelay: "300ms" }}>
                        <div className="flex flex-col gap-6">
                            <span className="badge-editorial">{t("whyChooseUs.badge")}</span>
                            <h3 className="luxury-headline">
                                {t("whyChooseUs.ritual")} <span className="opacity-40">{t("whyChooseUs.welcome")}</span>
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                            <div className="flex flex-row md:flex-col items-center md:items-start gap-6 p-6 md:p-0 rounded-[24px] md:rounded-none bg-white/[0.02] md:bg-transparent border border-white/5 md:border-none group/item">
                                <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-[16px] md:rounded-[20px] bg-white/[0.02] border border-white/10 flex items-center justify-center transition-all duration-700 group-hover/item:border-white/20 shadow-xl">
                                    <Clock className="w-6 h-6 md:w-7 md:h-7 text-white/60 group-hover/item:text-white transition-transform group-hover/item:scale-110" />
                                </div>
                                <div className="space-y-1 md:space-y-3">
                                    <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-white/20 block">{t("whyChooseUs.standard")}</span>
                                    <span className="text-lg md:text-2xl font-bold text-white tracking-tight leading-tight group-hover/item:text-white/80 transition-colors duration-700">{t("whyChooseUs.zeroWait")}</span>
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col items-center md:items-start gap-6 p-6 md:p-0 rounded-[24px] md:rounded-none bg-white/[0.02] md:bg-transparent border border-white/5 md:border-none group/item">
                                <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-[16px] md:rounded-[20px] bg-white/[0.02] border border-white/10 flex items-center justify-center transition-all duration-700 group-hover/item:border-white/20 shadow-xl">
                                    <MapPin className="w-6 h-6 md:w-7 md:h-7 text-white/60 group-hover/item:text-white transition-transform group-hover/item:scale-110" />
                                </div>
                                <div className="space-y-1 md:space-y-3">
                                    <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-white/20 block">{t("whyChooseUs.location")}</span>
                                    <span className="text-lg md:text-2xl font-bold text-white tracking-tight leading-tight group-hover/item:text-white/80 transition-colors duration-700">{t("whyChooseUs.hub")}</span>
                                </div>
                            </div>
                        </div>

                        {/* Certification Badges */}
                        <div className="pt-8 md:pt-12 border-t border-white/[0.05] flex flex-wrap gap-6 md:gap-10">
                            {tArray("whyChooseUs.trustBadges").map((badge: string) => (
                                <div key={badge} className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-white/30 group/badge hover:text-white/60 transition-all">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/40 group-hover/badge:text-emerald-500 transition-colors" />
                                    {badge}
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
