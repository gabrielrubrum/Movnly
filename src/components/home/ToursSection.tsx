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
        <section className="nx-section bg-surface-0 py-24 relative overflow-hidden">
            {/* Subtle background accent */}
            <div className="absolute inset-0 bg-gradient-to-b from-surface-1/30 via-transparent to-transparent pointer-events-none" />

            <div className="nx-container relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16">
                    <div>
                        <span className="badge-editorial mb-4 inline-block">{t("tours_section.badge")}</span>
                        <h2 className="luxury-headline">
                            {t("tours_section.title1")}{" "}
                            <span className="opacity-40">{t("tours_section.title2")}</span>
                        </h2>
                        <p className="luxury-subheadline mt-4 max-w-lg">
                            {t("tours_section.sub")}
                        </p>
                    </div>
                    <Link
                        href="/tours"
                        className="shrink-0 flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-brand-gold hover:text-white transition-all border-b border-brand-gold/30 hover:border-white pb-1 font-sans"
                    >
                        {t("tours_section.viewAll")} <ArrowRight className="w-4 h-4" />
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
                                    "group relative rounded-[24px] overflow-hidden border transition-all duration-700 bg-white/[0.02] cursor-pointer block flex flex-col hover:-translate-y-2",
                                    isSummer 
                                        ? "border-brand-gold/40 shadow-[0_0_40px_rgba(212,175,55,0.05)] hover:border-brand-gold hover:shadow-[0_0_60px_rgba(212,175,55,0.15)]" 
                                        : "border-white/[0.06] hover:border-brand-gold/30 hover:bg-white/[0.04]"
                                )}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                {/* Image */}
                                <div className="relative h-64 overflow-hidden shrink-0">
                                    <img
                                        src={tour.img}
                                        alt={tour.title}
                                        className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-1000 saturate-[0.8] group-hover:saturate-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#07070A] via-[#07070A]/20 to-transparent" />

                                    {/* Tag */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        <span className="px-3 py-1.5 bg-brand-gold text-black text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg self-start">
                                            {t(`tours_list.${tour.id}.tag`)}
                                        </span>
                                        {isSummer && (
                                            <span className="px-3 py-1.5 bg-black/80 backdrop-blur-md border border-brand-gold/20 text-brand-gold text-[8px] font-black uppercase tracking-[0.3em] rounded-full animate-pulse shadow-2xl self-start">
                                                Edição Limitada
                                            </span>
                                        )}
                                    </div>

                                    {/* Rating */}
                                    <div className="absolute top-4 right-4 flex items-center gap-1.5 text-white bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/10">
                                        <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                                        <span className="text-[10px] font-bold font-sans">5.0</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 relative flex-1 flex flex-col">
                                    {isSummer && (
                                        <div className="absolute -top-10 right-6 w-20 h-20 bg-brand-gold/10 blur-[40px] rounded-full group-hover:bg-brand-gold/20 transition-all pointer-events-none" />
                                    )}
                                    
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-brand-gold transition-colors">{t(`tours_list.${tour.id}.title`)}</h3>
                                        <p className="text-[11px] text-white/50 font-medium uppercase tracking-widest mb-6 font-sans leading-relaxed line-clamp-2">
                                            {t(`tours_list.${tour.id}.sub`)}
                                        </p>
                                    </div>

                                    <div className="flex items-end justify-between mt-auto">
                                        <div className="flex items-center gap-2.5 text-white/40 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                            <Clock className="w-3.5 h-3.5 text-brand-gold/60" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider font-sans text-white/80">{tour.duration}</span>
                                        </div>
                                        <div className="text-right flex flex-col justify-end">
                                            <p className="text-[9px] text-white/30 uppercase tracking-widest font-sans mb-1">{t("tours_section.from")}</p>
                                            <p className="text-2xl font-black text-brand-gold leading-none tracking-tighter group-hover:scale-105 transition-transform origin-right">€{tour.price}</p>
                                        </div>
                                    </div>

                                    {/* Hover CTA */}
                                    <div className="mt-6 flex items-center justify-between text-brand-gold opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 pt-4 border-t border-white/5">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] font-sans">Reservar</span>
                                        <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom CTA Banner */}
                <div className="mt-12 glass-concierge rounded-[24px] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/[0.06]">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-brand-gold" />
                        </div>
                        <div>
                            <p className="text-white font-black text-sm">{t("tours_section.customTitle")}</p>
                            <p className="text-white/40 text-xs mt-0.5">{t("tours_section.customDesc")}</p>
                        </div>
                    </div>
                    <Link
                        href="/tours"
                        className="shrink-0 btn-editorial-primary h-12 px-10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2"
                    >
                        {t("tours_section.viewAll")} <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

            </div>
        </section>
    );
}
