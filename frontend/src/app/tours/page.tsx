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
                                        <span className="text-[10px] text-brand-gold/60 group-hover:text-brand-gold transition-colors uppercase tracking-[0.4em] font-black">
                                            Simular Valor
                                        </span>
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
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.8 }}
                        className="relative rounded-[48px] overflow-hidden"
                        style={{ background: "linear-gradient(135deg, #0D0B06 0%, #0A0A0F 60%, #060A0D 100%)", border: "1px solid rgba(212,175,55,0.15)" }}
                    >
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/8 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
                            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-gold/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4" />
                        </div>

                        <div className="relative z-10 p-12 md:p-20 text-center">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] font-black uppercase tracking-[0.4em] mb-8">
                                Roteiro Personalizado
                            </span>
                            <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 leading-tight">
                                Criamos a viagem
                                <span className="block text-brand-gold">perfeita para si</span>
                            </h2>
                            <p className="text-white/45 max-w-xl mx-auto mb-12 text-lg leading-relaxed font-sans">
                                Grupos, celebrações, eventos corporativos ou simplesmente uma experiência diferente. Diga-nos o que precisa.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/reservar"
                                    className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-bold uppercase text-[11px] tracking-[0.3em] text-black transition-all hover:scale-105 hover:bg-white"
                                    style={{ background: "#D4AF37" }}>
                                    Reservar Agora <ChevronRight className="w-4 h-4" />
                                </Link>
                                <a href="tel:+351924851105"
                                    className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-bold uppercase text-[11px] tracking-[0.3em] text-white/50 hover:text-white transition-all"
                                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                                    +351 924 851 105
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
