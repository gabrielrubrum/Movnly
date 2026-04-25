"use client";

import { useI18n } from "@/i18n/context";
import { BookingEngine } from "@/components/booking/BookingEngine";
import { ChevronRight, ShieldCheck, Star, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  const { t, tArray } = useI18n();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 md:pt-32 pb-16 px-4 md:px-6 overflow-hidden bg-luxury-mesh">

      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-30 scale-105 saturate-[0.6] contrast-[1.1] animate-float"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-luxury-car-driving-through-the-city-at-night-42273-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        <div className="absolute inset-0 bg-brand-gold/5 blur-[120px] rounded-full animate-glow-pulse" />
      </div>

      {/* Hero Content */}
      <div className="nx-container relative z-10 w-full text-center flex flex-col items-center">

        {/* Massive Headline */}
        <div className="max-w-7xl mx-auto mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl md:text-8xl lg:text-9xl font-bold mb-8 leading-[1.05] tracking-tight"
          >
            {t("hero.headline1")} <br />
            <span className="font-sans font-bold text-white/70">{t("hero.headline2")}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-lg md:text-2xl text-white/50 max-w-3xl mx-auto px-4 leading-relaxed font-light"
          >
            {t("hero.sub")}
          </motion.p>
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 mb-20"
        >
          {[
            { icon: ShieldCheck, text: t("hero.trust.drivers") },
            { icon: Star, text: t("hero.trust.rating") },
            { icon: CheckCircle2, text: t("hero.trust.instant") }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 text-white/30 group">
              <item.icon className="w-4 h-4 text-brand-gold/40 group-hover:text-brand-gold transition-colors" />
              <span className="text-[11px] font-medium tracking-[.2em] uppercase font-sans">{item.text}</span>
            </div>
          ))}
        </motion.div>

        {/* Global Concierge Entry */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="w-full max-w-5xl mx-auto relative group"
        >
          <div className="absolute -inset-4 bg-brand-gold/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <BookingEngine />
        </motion.div>

        {/* Popular Connections Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 md:mt-20 w-full"
        >
          <div className="flex flex-col items-center gap-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4 w-full">
              <div className="h-[1px] flex-1 bg-brand-gold/10" />
              <h3 className="text-white/30 text-[10px] font-bold uppercase tracking-[0.4em] font-sans whitespace-nowrap">
                {t("hero.popularRoutes")}
              </h3>
              <div className="h-[1px] flex-1 bg-brand-gold/10" />
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 px-4">
              {tArray("hero.routes").map((route: string) => (
                <button
                  key={route}
                  className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 hover:text-brand-gold transition-all font-sans"
                >
                  <span className="w-1 h-1 rounded-full bg-brand-gold/20 group-hover:bg-brand-gold transition-colors" />
                  {route}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator - Now part of content flow with spacing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 mb-8 flex flex-col items-center gap-4 opacity-40"
        >
          <div className="text-[9px] font-bold uppercase tracking-[0.5em] font-sans text-brand-gold/60">{t("hero.discover")}</div>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-[1px] h-12 bg-gradient-to-b from-brand-gold to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
