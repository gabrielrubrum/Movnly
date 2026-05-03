"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useI18n } from "@/i18n/context";
import { MapPin, ArrowRight, Clock, Compass, Star, ChevronRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface RouteItem {
    from: string;
    to: string;
    duration: string;
    price: string;
}

export default function RotasPage() {
    const { t, tArray } = useI18n();

    const routes = tArray("routes_section.items") as RouteItem[];
    const routeImages = [
        "/assets/images/services/coastal-route.png",
        "https://images.pexels.com/photos/27832070/pexels-photo-27832070.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/36599721/pexels-photo-36599721.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        "https://images.pexels.com/photos/35510407/pexels-photo-35510407.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
    ];

    return (
        <div className="min-h-screen bg-luxury-mesh text-white">
            <Navbar />

            <main className="overflow-hidden">
                {/* Immersive Hero */}
                <section className="relative min-h-[90vh] flex items-center pt-32 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/assets/images/services/coastal-route.png"
                            className="w-full h-full object-cover saturate-[0.6] scale-105 opacity-40 animate-float"
                            alt="Luxury Route"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    </div>

                    <div className="nx-container relative z-10">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="max-w-3xl"
                        >
                            <motion.span
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="inline-flex items-center gap-2 text-brand-gold text-[10px] uppercase tracking-[0.5em] font-medium mb-8"
                            >
                                <Compass className="w-3 h-3 animate-spin-slow" /> {t("routes_section.badge")}
                            </motion.span>

                            <h1 className="text-6xl md:text-8xl font-bold leading-[1.1] mb-8">
                                {t("routes_section.title1")}<br />
                                <span className="text-serif italic font-medium text-white/40">{t("routes_section.title2")}</span>
                            </h1>

                            <p className="text-lg md:text-xl text-white/50 mb-12 max-w-xl leading-relaxed font-light">
                                {t("routes_section.desc")}
                            </p>

                            <div className="flex flex-wrap gap-8 items-center">
                                <Link
                                    href="/book"
                                    className="bg-brand-gold text-black px-12 py-5 rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 hover:shadow-glow transition-all shadow-xl"
                                >
                                    {t("nav.bookNow")}
                                </Link>
                                <div className="flex items-center gap-4 text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <ShieldCheck className="w-5 h-5 text-brand-gold/50" /> {t("booking.safety_badge")}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
                    >
                        <span className="text-[9px] uppercase tracking-[0.5em] text-brand-gold/40">Scroll</span>
                        <div className="w-[1px] h-12 bg-gradient-to-b from-brand-gold/40 to-transparent" />
                    </motion.div>
                </section>

                {/* Routes Grid */}
                <section className="nx-container py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                        {routes.map((route, i) => (
                            <motion.div
                                key={`${route.from}-${route.to}`}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                className="group relative h-[600px] rounded-[48px] overflow-hidden luxury-card border-white/5"
                            >
                                <img
                                    src={routeImages[i] || routeImages[0]}
                                    className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 opacity-40 group-hover:opacity-70"
                                    alt={`${route.from} to ${route.to}`}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                                <div className="absolute inset-x-10 bottom-12 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3 text-brand-gold">
                                                <MapPin className="w-4 h-4" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t("routes_section.transfer")}</span>
                                            </div>
                                            <h3 className="text-4xl font-bold text-white tracking-tighter">
                                                {route.from} <span className="text-white/20 mx-2 font-serif font-light">/</span> {route.to}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 justify-end text-brand-gold mb-1">
                                                {[...Array(5)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                                            </div>
                                            <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-bold">5.0 Rating</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-12 pt-8 border-t border-white/10">
                                        <div className="flex items-center gap-3 text-white/50">
                                            <Clock className="w-4 h-4" />
                                            <span className="text-[11px] font-bold uppercase tracking-widest">{route.duration}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] text-white/20 uppercase tracking-widest">{t("tours_section.from")}</span>
                                            <span className="text-3xl font-bold text-white">{route.price}€</span>
                                        </div>

                                        <Link
                                            href={`/book?origin=${route.from}&destination=${route.to}`}
                                            className="ml-auto w-14 h-14 rounded-full bg-white text-black flex items-center justify-center hover:bg-brand-gold transition-all duration-500 transform group-hover:rotate-[-45deg]"
                                        >
                                            <ArrowRight className="w-6 h-6" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Call to Action V2 */}
                <section className="nx-container pb-32">
                    <motion.div
                        whileInView={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 30 }}
                        className="glass-bento-premium rounded-[64px] p-20 text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-gold/5 blur-[120px] rounded-full pointer-events-none animate-glow-pulse" />

                        <span className="text-brand-gold text-[10px] uppercase tracking-[0.4em] font-medium mb-8 block font-sans">{t("tours_section.badge")}</span>
                        <h2 className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1]">{t("tours_section.customTitle").split("?")[0]}<br /><span className="text-serif italic font-medium text-white/80">{t("tours_section.customTitle").includes("?") ? "?" : ""}</span></h2>
                        <p className="text-white/50 max-w-xl mx-auto mb-12 text-lg leading-relaxed font-light">{t("tours_section.customDesc")}</p>

                        <Link href="/book" className="bg-brand-gold text-black h-16 px-16 rounded-full inline-flex items-center justify-center gap-4 font-bold uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl">
                            {t("nav.bookNow")} <ChevronRight className="w-5 h-5" />
                        </Link>
                    </motion.div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
