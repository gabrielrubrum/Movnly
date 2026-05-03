"use client";

import { useI18n } from "@/i18n/context";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export function TestimonialsSection() {
  const { t, tArray } = useI18n();

  return (
    <section className="nx-section bg-luxury-mesh py-32 relative overflow-hidden border-t border-white/5">

      {/* Atmospheric Branding Sub-layer */}
      <div className="absolute top-12 left-8 text-[15vw] font-bold text-white/[0.01] select-none pointer-events-none uppercase tracking-tighter leading-none animate-float">
        NexRice
      </div>

      <div className="nx-container relative z-10">

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-24">
          <div className="max-w-3xl">
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="text-brand-gold text-[10px] uppercase tracking-[0.5em] font-medium"
            >
              {t("testimonials.sectionBadge")}
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-5xl md:text-7xl font-bold mt-8 text-white tracking-tight leading-[1.1]"
            >
              {t("testimonials.title1")} <br />
              <span className="text-serif italic font-medium text-white/40">{t("testimonials.title2")}</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-lg text-white/50 max-w-sm leading-relaxed font-light"
          >
            {t("testimonials.sub")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tArray("testimonials.items").map((item: any, i: number) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group p-10 md:p-14 rounded-[48px] glass-bento-premium border-white/10 hover:border-brand-gold/20 transition-all duration-700 flex flex-col shadow-luxury relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-30 transition-opacity">
                <Quote className="w-12 h-12 text-brand-gold" />
              </div>

              <div className="flex gap-1 mb-8">
                {[...Array(5)].map((_, starI) => (
                  <Star key={starI} className="w-3.5 h-3.5 text-brand-gold fill-current" />
                ))}
              </div>

              <p className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-14 flex-1 tracking-tight italic font-serif">
                "{item.text}"
              </p>

              <div className="pt-10 border-t border-white/10 flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 text-brand-gold flex items-center justify-center font-bold text-2xl border border-brand-gold/20 shadow-glow">
                  {item.avatar}
                </div>
                <div>
                  <h4 className="text-white font-bold uppercase tracking-[0.2em] text-xs mb-1">{item.name}</h4>
                  <p className="text-brand-gold/40 text-[10px] uppercase font-bold tracking-widest">{item.role} • <span className="text-white/20">{item.country}</span></p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Social proof Strip V2 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-32 pt-16 border-t border-white/10 flex flex-wrap justify-center items-center gap-x-16 gap-y-10"
        >
          {tArray("testimonials.socialProof").map((badge: string, i: number) => (
            <div key={badge} className="flex items-center gap-16 group/badge">
              <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.5em] text-white/20 group-hover/badge:text-brand-gold transition-all duration-700 text-center whitespace-nowrap italic">
                {badge}
              </span>
              {i < tArray("testimonials.socialProof").length - 1 && (
                <div className="hidden md:block w-px h-6 bg-white/5 rotate-12" />
              )}
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
