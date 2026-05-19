"use client";

import { useI18n } from "@/i18n/context";
import { BookingEngine } from "@/components/booking/BookingEngine";
import { ShieldCheck, Star, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

import api from "@/lib/api";

export function HeroSection() {
  const { t } = useI18n();
  const [ratingStr, setRatingStr] = useState("4.9");

  useEffect(() => {
    api.get("/ratings/stats/public")
      .then(res => {
        if (res.data && res.data.avg) {
          setRatingStr(res.data.avg.toFixed(1));
        }
      })
      .catch(err => {
        console.warn("Ratings stats not available, using fallback:", err.message);
      });
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col pt-32 pb-16 px-4 md:px-6 bg-[#050507]">
      
      {/* Modern Cinematic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#050507]">
        <div className="absolute inset-0">
          <motion.img
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=2000"
            alt="Mercedes Sedan Portugal"
            className="w-full h-full object-cover object-right opacity-80"
          />
          {/* Strong gradients for perfect blending without hard edges */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-[#050507] md:via-[#050507]/90 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/60 to-transparent z-10" />
          <div className="absolute inset-0 bg-black/20 z-10" />
        </div>
        
        {/* Subtle cinematic glow on the car */}
        <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] bg-brand-gold/15 blur-[120px] mix-blend-overlay rounded-full pointer-events-none" />
      </div>

      <div className="nx-container relative z-10 w-full flex-1 flex flex-col">
        
        {/* Creative Typographic Hero */}
        <div className="flex-1 grid lg:grid-cols-12 gap-8 items-center mb-12">
          <div className="text-left relative lg:col-span-8 xl:col-span-7">
            {/* Subtle glow specifically behind the text */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[80%] h-[120%] bg-brand-gold/5 blur-[100px] pointer-events-none -z-10 rounded-full" />
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-md mb-8 relative"
            >
              {/* Very subtle glow behind the pill */}
              <div className="absolute inset-0 bg-brand-gold/10 blur-md rounded-full -z-10 opacity-50" />
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
              <span className="text-[9px] font-medium uppercase tracking-[0.4em] text-white/70">
                {t("hero.pill")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl lg:text-[3.5rem] mb-6 leading-[1.25] tracking-tight relative"
            >
              <span className="text-white font-light drop-shadow-xl">{t("hero.headline1")}</span>{" "}
              <br className="hidden lg:block" />
              <span className="text-transparent font-medium bg-clip-text bg-gradient-to-r from-brand-gold via-[#F0D680] to-brand-gold drop-shadow-2xl">
                {t("hero.headline2")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-sm md:text-base lg:text-lg text-white/60 max-w-xl leading-relaxed font-light mb-12 relative"
            >
              {t("hero.sub")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-8 relative"
            >
              {[
                { icon: ShieldCheck, text: t("hero.trust.drivers") },
                { icon: Star, text: `${ratingStr} · ${t("hero.trust.rating")}` }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 group cursor-default">
                  <div className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center group-hover:border-brand-gold/30 group-hover:shadow-[0_0_15px_rgba(212,175,55,0.15)] transition-all duration-500">
                    <item.icon className="w-3.5 h-3.5 text-brand-gold/70 group-hover:text-brand-gold transition-colors" />
                  </div>
                  <span className="text-[9px] font-medium tracking-[0.2em] uppercase text-white/50 group-hover:text-white/80 transition-colors">
                    {item.text}
                  </span>
                </div>
              ))}
            </motion.div>
            
          </div>
        </div>

        {/* Floating Booking Engine across the bottom */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full relative mt-auto z-20"
        >
          {/* Subtle Glow beneath the booking engine */}
          <div className="absolute -inset-10 bg-brand-gold/10 blur-[100px] rounded-[100px] opacity-40 pointer-events-none" />
          
          <BookingEngine />
        </motion.div>

      </div>
    </section>
  );
}
