"use client";

import { useI18n } from "@/i18n/context";
import { BookingEngine } from "@/components/booking/BookingEngine";
import { ShieldCheck, Star, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function HeroSection() {
  const { t } = useI18n();

  return (
    <section className="relative min-h-screen flex flex-col pt-32 pb-16 px-4 md:px-6 bg-[#050507]">
      
      {/* Modern Asymmetrical Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute right-0 top-0 w-full lg:w-[65%] h-[60vh] lg:h-[85vh]">
          {/* Gradients for perfect blending */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050507] via-[#050507]/80 lg:via-transparent to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/40 to-transparent z-10" />
          
          <img
            src="https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=2000"
            alt="Mercedes Sedan Portugal"
            className="w-full h-full object-cover object-center opacity-70"
          />
        </div>
        
        {/* Ambient brand glow */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-brand-gold/10 blur-[150px] mix-blend-overlay rounded-full pointer-events-none" />
      </div>

      <div className="nx-container relative z-10 w-full flex-1 flex flex-col">
        
        {/* Creative Typographic Hero */}
        <div className="flex-1 grid lg:grid-cols-12 gap-8 items-center mb-12">
          <div className="text-left relative lg:col-span-8 xl:col-span-7">
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-brand-gold animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">
                {t("hero.pill")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl lg:text-[4.5rem] font-bold mb-6 leading-[1.1] tracking-tight"
            >
              <span className="text-white drop-shadow-xl">{t("hero.headline1")}</span>{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-[#F0D680] to-brand-gold drop-shadow-2xl">
                {t("hero.headline2")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-base md:text-lg lg:text-xl text-white/80 max-w-xl leading-relaxed font-light mb-10"
            >
              {t("hero.sub")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center gap-8"
            >
              {[
                { icon: ShieldCheck, text: t("hero.trust.drivers") },
                { icon: Star, text: t("hero.trust.rating") }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 group cursor-default">
                  <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center group-hover:bg-brand-gold group-hover:scale-110 transition-all duration-500">
                    <item.icon className="w-4 h-4 text-brand-gold group-hover:text-black transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60 group-hover:text-white transition-colors">
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
