"use client";

import { useI18n } from "@/i18n/context";
import { Shield, Plane, Clock, MapPin, CheckCircle2 } from "lucide-react";

export function WhyChooseUs() {
    const { t, tArray } = useI18n();

    return (
        <section className="nx-section bg-[#050507] relative overflow-hidden py-32">
            <div className="nx-container relative z-10">
                <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">

                    {/* Left: Cinematic Visual */}
                    <div className="relative group pt-8 lg:pt-0">
                        <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/[0.05] shadow-2xl">
                            <img
                                src="https://images.pexels.com/photos/3354648/pexels-photo-3354648.jpeg?auto=compress&cs=tinysrgb&w=1200"
                                alt="Motorista Profissional"
                                className="w-full h-full object-cover transition-transform duration-[3s] ease-out group-hover:scale-105 saturate-[0.8]"
                            />
                            
                            {/* Seamless Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/60 to-transparent opacity-90" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#050507]/80 via-transparent to-transparent opacity-60" />

                            {/* Content on Image */}
                            <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between z-10">
                                {/* Top Badge */}
                                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 w-fit">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/80">
                                        {t("whyChooseUs.badge")}
                                    </span>
                                </div>

                                {/* Bottom Text */}
                                <div className="max-w-md">
                                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-[1.1]">
                                        {t("whyChooseUs.title1")} <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold to-[#F0D680]">{t("whyChooseUs.title2")}</span> {t("whyChooseUs.title3")}
                                    </h2>
                                    <div className="h-px w-12 bg-brand-gold/50 mb-6" />
                                    <p className="text-white/50 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] leading-relaxed">
                                        {t("whyChooseUs.sub")}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Ambient Glow */}
                        <div className="absolute -top-20 -right-20 w-[400px] h-[400px] bg-brand-gold/5 rounded-full blur-[100px] opacity-30 select-none pointer-events-none" />
                    </div>

                    {/* Right: Content Narrative */}
                    <div className="space-y-16">
                        
                        {/* Headline Section */}
                        <div className="space-y-6">
                            <span className="inline-block text-[10px] font-black uppercase tracking-[0.4em] text-white/30 border-b border-brand-gold/30 pb-2">
                                {t("whyChooseUs.badge")}
                            </span>
                            <h3 className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold text-white tracking-tighter leading-[0.95]">
                                {t("whyChooseUs.ritual")} <br/>
                                <span className="text-white/30 font-light">{t("whyChooseUs.welcome")}</span>
                            </h3>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 md:gap-12">
                            {/* Item 1 */}
                            <div className="group/item">
                                <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center mb-6 transition-all duration-500 group-hover/item:border-brand-gold/40 group-hover/item:bg-brand-gold/5 shadow-xl">
                                    <Clock className="w-6 h-6 text-brand-gold/60 group-hover/item:text-brand-gold transition-colors" />
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">
                                    {t("whyChooseUs.standard")}
                                </h4>
                                <p className="text-2xl font-bold text-white tracking-tight leading-tight">
                                    {t("whyChooseUs.zeroWait")}
                                </p>
                            </div>

                            {/* Item 2 */}
                            <div className="group/item">
                                <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center mb-6 transition-all duration-500 group-hover/item:border-brand-gold/40 group-hover/item:bg-brand-gold/5 shadow-xl">
                                    <MapPin className="w-6 h-6 text-brand-gold/60 group-hover/item:text-brand-gold transition-colors" />
                                </div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-3">
                                    {t("whyChooseUs.location")}
                                </h4>
                                <p className="text-2xl font-bold text-white tracking-tight leading-tight">
                                    {t("whyChooseUs.hub")}
                                </p>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="pt-12 border-t border-white/[0.06]">
                            <div className="flex flex-wrap gap-x-8 gap-y-5">
                                {tArray("whyChooseUs.trustBadges").map((badge: string) => (
                                    <div key={badge} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.25em] text-white/40 hover:text-white/80 transition-all cursor-default">
                                        <div className="w-5 h-5 rounded-full bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20">
                                            <CheckCircle2 className="w-3 h-3 text-brand-gold" />
                                        </div>
                                        {badge}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    );
}
