"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/context";
import { Phone, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function CTASection() {
  const { t, tArray } = useI18n();

  return (
    <section className="relative min-h-[700px] py-32 flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0F] border-t border-white/[0.05]">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5927?q=80&w=2070&auto=format&fit=crop"
          alt="Luxury Experience Lisbon"
          className="w-full h-full object-cover opacity-10 scale-105 saturate-0 group-hover:scale-100 transition-all duration-[10s]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
        <div className="absolute inset-0 bg-brand-gold/5 blur-[150px] rounded-full animate-glow-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10 nx-container text-center flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="text-brand-gold text-[10px] uppercase tracking-[0.5em] font-medium mb-10"
        >
          {t("cta.pill")}
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-6xl md:text-8xl font-black mb-10 text-white tracking-tighter leading-[1]"
        >
          {t("cta.headline1")} <br />
          <span className="font-sans font-medium text-white/50">{t("cta.headline2")}</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto mb-16 leading-relaxed font-light"
        >
          {t("cta.sub")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center gap-8"
        >
          <Link href="/book" className="bg-brand-gold text-black px-16 py-6 rounded-full text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-4 group w-full sm:w-auto shadow-2xl hover:scale-105 transition-all">
            {t("cta.bookNow")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link href="tel:+351924851105" className="px-16 py-6 rounded-full border border-white/10 text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-4 group w-full sm:w-auto text-white/60 hover:text-white hover:bg-white/5 transition-all">
            <Phone className="w-5 h-5 text-brand-gold/60" />
            {t("cta.callNow")}
          </Link>
        </motion.div>

        {/* Global Micro-trust Matrix V2 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-32 flex flex-col items-center gap-10 md:flex-row md:justify-center md:gap-20"
        >
          {tArray("cta.microcopy").map((item: string, i: number) => (
            <div key={item} className="flex items-center gap-10 group/item">
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.4em] text-white/20 group-hover/item:text-brand-gold/60 transition-all duration-700 whitespace-nowrap italic">
                {item}
              </span>
              {i < tArray("cta.microcopy").length - 1 && (
                <div className="hidden md:block w-px h-6 bg-white/5 rotate-12" />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
