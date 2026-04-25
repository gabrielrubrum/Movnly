"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useI18n } from "@/i18n/context";
import { MapPin, Clock, Users, ArrowRight, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ToursPage() {
    const { t, tArray } = useI18n();

    const tours = tArray("tours_section.items");

    return (
        <div className="min-h-screen bg-luxury-mesh text-white selection:bg-brand-gold/30">
            <Navbar />

            <main className="overflow-hidden">
                {/* Hero section */}
                <section className="relative min-h-[85vh] flex flex-col items-center justify-center pt-32 pb-20 px-4 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <video
                            autoPlay muted loop playsInline
                            className="w-full h-full object-cover opacity-20 scale-105 saturate-[0.5] animate-float"
                        >
                            <source src="https://assets.mixkit.co/videos/preview/mixkit-driving-through-a-curvy-road-in-a-forest-4028-large.mp4" type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/60 to-black" />
                    </div>

                    <div className="relative z-10 text-center max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-brand-gold/20 bg-brand-gold/5 text-brand-gold text-[10px] font-black uppercase tracking-[0.4em] mb-10 backdrop-blur-sm"
                        >
                            <MapPin className="w-3.5 h-3.5" /> {t("tours_section.badge")}
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="text-6xl md:text-8xl font-bold leading-[1.1] mb-8"
                        >
                            {t("tours_section.title1")}<br />
                            <span className="font-bold text-brand-gold">{t("tours_section.title2")}</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
                        >
                            {t("tours_section.sub")}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4"
                        >
                            {tArray("whyChooseUs.items").slice(0, 3).map((item: any) => (
                                <div key={item.title} className="flex items-center gap-2 text-white/30">
                                    <div className="w-1.5 h-1.5 rounded-full bg-brand-gold/50" />
                                    <span className="text-[11px] font-bold tracking-widest uppercase">{item.title}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-brand-gold/30">
                        <span className="text-[9px] uppercase tracking-[0.5em]">Scroll</span>
                        <div className="w-[1px] h-12 bg-gradient-to-b from-brand-gold/40 to-transparent" />
                    </div>
                </section>

                {/* Tours Grid */}
                <section className="nx-container py-32">
                    <div className="text-center mb-24">
                        <span className="text-brand-gold text-[10px] uppercase tracking-[0.4em] font-medium mb-6 block">Curated Experiences</span>
                        <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
                            {t("tours_section.viewAll").split(" ")[1]} <span className="text-serif italic font-light text-white/60">{t("tours_section.viewAll").split(" ").slice(2).join(" ")}</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tours.map((tour: any, idx: number) => (
                            <motion.div
                                key={tour.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative rounded-[48px] overflow-hidden luxury-card border-white/5 shadow-2xl h-[640px] flex flex-col"
                            >
                                {/* Image cover */}
                                <div className="relative h-2/3 overflow-hidden">
                                    <img
                                        src={tour.image}
                                        alt={tour.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] saturate-[0.4] group-hover:saturate-100 opacity-50 group-hover:opacity-100"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                    {tour.featured && (
                                        <div className="absolute top-8 left-8">
                                            <span className="px-6 py-2 bg-brand-gold text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-glow">
                                                Featured
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-10 flex flex-col flex-1">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-brand-gold text-[10px] uppercase tracking-[0.4em] font-medium font-serif italic">{tour.location}</span>
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-4 tracking-tight group-hover:text-brand-gold transition-colors">{tour.title}</h3>
                                    <p className="text-sm text-white/40 leading-relaxed mb-8 line-clamp-2 italic font-serif group-hover:text-white/60 transition-colors uppercase tracking-[0.05em]">{tour.desc}</p>

                                    <div className="flex items-center gap-8 mb-auto text-white/20 border-t border-white/10 pt-8">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-brand-gold/40" />
                                            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">{tour.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Users className="w-4 h-4 text-brand-gold/40" />
                                            <span className="text-[11px] font-bold uppercase tracking-[0.2em]">VIP Priority</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-10">
                                        <div>
                                            <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] mb-1 font-bold">{t("tours_section.from")}</p>
                                            <p className="text-4xl font-bold text-white tracking-tighter">{tour.price}€</p>
                                        </div>
                                        <Link
                                            href={`/book?tour=${tour.id}`}
                                            className="w-16 h-16 rounded-full bg-brand-gold text-black flex items-center justify-center hover:scale-110 transition-all duration-500 shadow-glow"
                                        >
                                            <ArrowRight className="w-6 h-6" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Custom Tour CTA */}
                <section className="nx-container pb-40">
                    <motion.div
                        whileInView={{ opacity: 1, scale: 1 }}
                        initial={{ opacity: 0, scale: 0.98 }}
                        className="glass-bento-premium rounded-[64px] p-12 md:p-32 text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-brand-gold/5 blur-[150px] rounded-full pointer-events-none animate-glow-pulse" />

                        <span className="text-brand-gold text-[10px] uppercase tracking-[0.5em] font-medium mb-10 block">Bespoke Journeys</span>
                        <h2 className="text-5xl md:text-8xl font-bold text-white tracking-tight mb-10 leading-[1.1]">
                            {t("tours_section.customTitle").split("?")[0]}<br />
                            <span className="text-serif italic font-medium text-white/30">{t("tours_section.customTitle").includes("?") ? "?" : ""}</span>
                        </h2>
                        <p className="text-white/40 max-w-2xl mx-auto mb-16 text-xl leading-relaxed font-light italic font-serif">
                            {t("tours_section.customDesc")}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-8 justify-center relative z-10">
                            <Link href="/book" className="bg-brand-gold text-black h-18 px-16 rounded-full font-bold uppercase text-[11px] tracking-[0.3em] hover:scale-105 transition-all flex items-center justify-center gap-4 shadow-xl">
                                {t("tours_section.bookNow")} <ChevronRight className="w-5 h-5" />
                            </Link>
                            <a href="tel:+351210000000" className="h-18 px-12 rounded-full font-bold uppercase text-[11px] tracking-[0.2em] border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all group">
                                <span className="group-hover:text-brand-gold transition-colors">{t("cta.callNow")}</span>
                            </a>
                        </div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
