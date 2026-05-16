"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Clock, Star } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";

import { TOURS } from "@/lib/constants";

export function ToursSection() {
    const { t } = useI18n();
    const featuredTours = TOURS.slice(0, 4);
    return (
        <section className="nx-section bg-[#050507] py-32 relative overflow-hidden border-t border-white/5">
            <div className="nx-container relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16">
                    <div>
                        <span className="text-brand-gold text-[10px] uppercase tracking-[0.5em] font-medium mb-6 block">
                            {t("tours_section.badge")}
                        </span>
                        <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.05]">
                            {t("tours_section.title1")}{" "}
                            <span className="font-sans font-medium text-white/30">{t("tours_section.title2")}</span>
                        </h2>
                        <p className="text-lg text-white/40 max-w-xl leading-relaxed font-light mt-6">
                            {t("tours_section.sub")}
                        </p>
                    </div>
                    <Link
                        href="/tours"
                        className="shrink-0 flex items-center gap-4 px-8 py-3 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-white hover:border-brand-gold/40 hover:bg-white/5 transition-all duration-500 group shadow-xl"
                    >
                        {t("tours_section.viewAll")} <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform text-brand-gold" />
                    </Link>
                </div>

                {/* Tour Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredTours.map((tour, idx) => {
                        const isSummer = tour.id === 'summer-tour';
                        return (
                            <Link
                                key={tour.id}
                                href={`/tours#${tour.id}`}
                                className={cn(
                                    "group relative h-[480px] md:h-[540px] rounded-[2rem] overflow-hidden border transition-all duration-700 bg-[#0A0A0F] shadow-2xl block flex flex-col justify-between",
                                    isSummer 
                                        ? "border-brand-gold/40 shadow-[0_0_40px_rgba(212,175,55,0.05)] hover:border-brand-gold" 
                                        : "border-white/[0.05] hover:border-white/15"
                                )}
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0 z-0">
                                    <img
                                        src={tour.img}
                                        alt={tour.title}
                                        className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-90 transition-transform duration-[2s] ease-out saturate-[0.8] group-hover:saturate-100"
                                    />
                                    {/* Seamless Fade Overlays */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/60 to-transparent opacity-90" />
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/40 via-transparent to-transparent opacity-80" />
                                </div>

                                {/* Top Section */}
                                <div className="relative z-10 p-8 flex justify-between items-start">
                                    <div className="flex flex-col gap-3">
                                        <span className="px-4 py-1.5 bg-brand-gold text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg self-start">
                                            {t(`tours_list.${tour.id}.tag`)}
                                        </span>
                                        {isSummer && (
                                            <span className="px-3 py-1.5 bg-black/80 backdrop-blur-md border border-brand-gold/20 text-brand-gold text-[8px] font-black uppercase tracking-[0.3em] rounded-full animate-pulse shadow-2xl self-start">
                                                Edição Limitada
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-white bg-white/5 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                        <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                                        <span className="text-[10px] font-bold">5.0</span>
                                    </div>
                                </div>

                                {/* Bottom Content */}
                                <div className="relative z-10 p-8 flex flex-col gap-4">
                                    {/* Tour Info */}
                                    <div>
                                        <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight mb-2 group-hover:text-brand-gold transition-colors duration-500">
                                            {t(`tours_list.${tour.id}.title`)}
                                        </h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6 line-clamp-1">
                                            {t(`tours_list.${tour.id}.sub`)}
                                        </p>
                                    </div>

                                    {/* Metadata */}
                                    <div className="flex items-center gap-4 text-white/40 pb-6 border-b border-white/[0.06]">
                                        <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                                            <Clock className="w-3.5 h-3.5 text-brand-gold/60" />
                                            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/80">{tour.duration}</span>
                                        </div>
                                    </div>

                                    {/* Footer (Price & Button) */}
                                    <div className="flex items-end justify-between mt-2">
                                        <div>
                                            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mb-1 font-sans">{t("tours_section.from")}</p>
                                            <span className="text-3xl font-bold text-white tracking-tighter leading-none group-hover:text-brand-gold transition-colors duration-500">
                                                €{tour.price}
                                            </span>
                                        </div>

                                        <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 bg-white/5 border border-white/10 text-white group-hover:bg-brand-gold group-hover:text-black group-hover:border-brand-gold group-hover:scale-110">
                                            <ArrowRight className="w-5 h-5 -rotate-45" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom CTA Banner */}
                <div className="mt-16 bg-[#0A0A0F] border border-white/[0.06] rounded-[2rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                    
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-14 h-14 rounded-full bg-white/[0.02] border border-white/10 flex items-center justify-center shrink-0 shadow-xl group-hover:border-brand-gold/40 group-hover:bg-brand-gold/5 transition-all duration-500">
                            <MapPin className="w-6 h-6 text-brand-gold/60 group-hover:text-brand-gold transition-colors" />
                        </div>
                        <div>
                            <p className="text-xl md:text-2xl text-white font-bold tracking-tight">{t("tours_section.customTitle")}</p>
                            <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mt-1">{t("tours_section.customDesc")}</p>
                        </div>
                    </div>
                    <Link
                        href="/tours"
                        className="shrink-0 relative z-10 flex items-center gap-4 px-10 py-4 rounded-full bg-brand-gold text-black text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white transition-all duration-500 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    >
                        {t("tours_section.viewAll")} <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

            </div>
        </section>
    );
}
