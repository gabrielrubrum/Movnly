"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useI18n } from "@/i18n/context";
import { Sparkles, ArrowRight, Plane, Building2, Calendar, Map, CheckCircle2, ChevronRight, Star, ShieldCheck, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ServicesPage() {
    const { t } = useI18n();

    const serviceIds = ["airport", "corporate", "hotels", "citytour"];
    const serviceIcons = [Plane, Building2, Calendar, Map];
    const serviceImages = [
        "/assets/images/services/airport-vip.png",
        "/assets/images/services/corporate-exec.png",
        "/assets/images/services/premium-events.png",
        "/assets/images/services/coastal-route.png"
    ];

    const services = serviceIds.map((id, idx) => {
        const serviceData = t(`services_list.${id}`) as any;
        return {
            id,
            title: serviceData.label,
            desc: serviceData.full_desc || serviceData.desc,
            icon: serviceIcons[idx],
            image: serviceImages[idx],
            size: id === "airport" ? "large" : id === "citytour" ? "wide" : "medium",
            features: serviceData.features || []
        };
    });

    return (
        <div className="min-h-screen bg-luxury-mesh text-white selection:bg-brand-gold/30">
            <Navbar />

            <main className="pt-32 pb-20 overflow-hidden">
                <div className="nx-container">
                    {/* Header Section */}
                    <div className="max-w-4xl mb-16 md:mb-24">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <span className="w-12 h-[1px] bg-brand-gold"></span>
                            <span className="text-brand-gold text-xs uppercase tracking-[0.4em] font-medium">Nossos Serviços</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="text-5xl md:text-7xl font-bold leading-[1.1] mb-8"
                        >
                            Transporte privado com <br />
                            <span className="text-serif italic font-medium text-white/90">motoristas de confiança.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-lg md:text-xl text-white/60 max-w-2xl leading-relaxed"
                        >
                            Seja para uma viagem rápida até ao aeroporto ou necessidades de transporte para a sua empresa, oferecemos um serviço seguro e pontual apoiado por profissionais qualificados.
                        </motion.p>
                    </div>

                    {/* Bento Grid V2 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[900px]">
                        {services.map((service, idx) => (
                            <motion.div
                                key={service.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.7, delay: idx * 0.1 }}
                                className={`group relative luxury-card overflow-hidden flex flex-col ${service.size === "large" ? "md:col-span-2 md:row-span-2" :
                                    service.size === "wide" ? "md:col-span-2 md:row-span-1" :
                                        "md:col-span-1 md:row-span-1"
                                    }`}
                            >
                                {/* Image Backdrop with overlay */}
                                <div className="absolute inset-0 z-0">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover grayscale-[30%] opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-1000 ease-out"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                </div>

                                {/* Content */}
                                <div className="relative z-10 p-8 md:p-10 flex flex-col h-full mt-auto">
                                    <div className="w-12 h-12 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-6 backdrop-blur-sm">
                                        <service.icon className="w-6 h-6 text-brand-gold" />
                                    </div>

                                    <h3 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-brand-gold transition-colors duration-300">
                                        {service.title}
                                    </h3>

                                    <p className="text-white/60 text-sm md:text-base leading-relaxed mb-8 max-w-md">
                                        {service.desc}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-white/5 grid grid-cols-2 gap-y-3">
                                        {service.features.map((feature: string) => (
                                            <div key={feature} className="flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest text-white/40">
                                                <div className="w-1 h-1 rounded-full bg-brand-gold/50" />
                                                {feature}
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        href="/book"
                                        className="mt-8 flex items-center gap-3 text-brand-gold text-xs uppercase tracking-[.3em] font-bold group/btn"
                                    >
                                        Reservar Agora
                                        <div className="w-8 h-8 rounded-full border border-brand-gold/30 flex items-center justify-center group-hover/btn:bg-brand-gold group-hover/btn:text-black transition-all">
                                            <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Trust/Stats Banner */}
                    <div className="mt-32 pt-20 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="space-y-4">
                            <span className="text-brand-gold text-[10px] uppercase tracking-[0.4em] font-medium">Qualidade Garantida</span>
                            <h2 className="text-3xl font-bold">A nossa própria frota com <span className="text-serif font-light italic text-white/60">motoristas profissionais.</span></h2>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { val: "99.9%", label: "Pontualidade", icon: Clock },
                                { val: "24/7", label: "Disponibilidade", icon: Star },
                                { val: "50k+", label: "Viagens/Ano", icon: ShieldCheck }
                            ].map((stat, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-6 glass-bento-premium border-white/5"
                                >
                                    <stat.icon className="w-5 h-5 text-brand-gold mb-4 opacity-50" />
                                    <div className="text-4xl font-bold mb-1 tracking-tighter">{stat.val}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-white/40">{stat.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* The Concierge Ledger - Elegant Newsletter/CTA section */}
                <div className="mt-32 px-4">
                    <div className="nx-container">
                        <motion.div
                            whileInView={{ opacity: 1, scale: 1 }}
                            initial={{ opacity: 0, scale: 0.98 }}
                            className="relative overflow-hidden rounded-[40px] px-8 py-20 md:py-32 flex flex-col items-center text-center glass-bento-premium border-white/10"
                        >
                            {/* Decorative elements */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
                            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-gold/5 blur-[120px] rounded-full animate-glow-pulse" />

                            <span className="text-brand-gold text-[10px] uppercase tracking-[0.4em] font-medium mb-8">{t("footer.newsletter.badge")}</span>
                            <h2 className="text-4xl md:text-6xl font-bold mb-8 max-w-3xl leading-[1.1]">{t("footer.newsletter.title").replace("<gold>", "").replace("</gold>", "")}</h2>
                            <p className="text-white/50 text-lg max-w-xl mb-12">{t("footer.newsletter.sub")}</p>

                            <div className="flex flex-col md:flex-row gap-4 w-full max-w-lg relative z-10">
                                <input
                                    type="email"
                                    placeholder={t("footer.newsletter.placeholder")}
                                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-8 py-4 focus:outline-none focus:border-brand-gold/50 transition-all"
                                />
                                <button className="bg-brand-gold text-black px-10 py-4 rounded-full font-bold uppercase text-[10px] tracking-widest hover:bg-white hover:scale-105 transition-all">
                                    {t("footer.newsletter.button")}
                                </button>
                            </div>
                            <p className="mt-8 text-[10px] uppercase tracking-widest text-white/30">🔒 {t("footer.newsletter.privacy")}</p>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
