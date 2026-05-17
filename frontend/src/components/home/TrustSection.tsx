"use client";

import { useI18n } from "@/i18n/context";
import { Shield, Lock, Clock, UserCheck, Star, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function TrustSection() {
  const { t, tArray } = useI18n();
  const [ratingStr, setRatingStr] = useState("4.9");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002'}/ratings/stats/public`)
      .then(res => res.json())
      .then(data => {
        if (data.avg) {
          setRatingStr(data.avg.toFixed(1));
        }
      })
      .catch(console.error);
  }, []);

  return (
    <section className="nx-section bg-[#050507] py-32 relative overflow-hidden border-t border-white/5">
      {/* Decorative Aura */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-gold/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/2 pointer-events-none animate-glow-pulse" />

      <div className="nx-container relative z-10">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-16 md:gap-24 items-center">

          <div className="space-y-12">
            <div>
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="text-brand-gold text-[10px] uppercase tracking-[0.5em] font-medium"
              >
                {t("trust.badge")}
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-bold mt-8 mb-8 text-white tracking-tight leading-[1.1]"
              >
                {t("trust.headline1")} <br />
                <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold via-brand-gold/90 to-white/50 drop-shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                  {t("trust.headline2")}
                </span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-lg text-white/50 max-w-xl leading-relaxed font-light"
              >
                {t("trust.sub")}
              </motion.p>
            </div>

            {/* Pillar Mosaic V2 (Balanced) */}
            <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className={`group p-10 rounded-[40px] bg-[#0A0A0F] border border-white/[0.05] hover:border-brand-gold/30 hover:bg-brand-gold/[0.02] transition-all duration-700 shadow-2xl relative overflow-hidden backdrop-blur-2xl ${
                    i === 2 ? "sm:col-span-2 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10 sm:p-12" : "flex flex-col"
                  }`}
                >
                  <div className="absolute inset-0 bg-brand-gold/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-3xl pointer-events-none" />
                  <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 border border-brand-gold/30 flex items-center justify-center text-brand-gold transition-all duration-700 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(212,175,55,0.4)] group-hover:bg-brand-gold group-hover:text-black">
                    {i === 0 && <Shield className="w-7 h-7" strokeWidth={1.5} />}
                    {i === 1 && <Lock className="w-7 h-7" strokeWidth={1.5} />}
                    {i === 2 && <Clock className="w-7 h-7" strokeWidth={1.5} />}
                  </div>
                  <div>
                    <h4 className="text-2xl font-semibold text-white/90 mb-3 tracking-tight group-hover:text-brand-gold transition-colors duration-500">{t(`trust.pillars.${i}.title`)}</h4>
                    <p className="text-sm font-light text-white/40 leading-relaxed font-sans">{t(`trust.pillars.${i}.desc`)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-12">
            <div className="grid grid-cols-2 gap-6 md:gap-8">
              {[
                { label: t("trust.stats.trips.label"), val: t("trust.stats.trips.value") },
                { label: t("trust.stats.rating.label"), val: `${ratingStr}★` },
                { label: t("trust.stats.punctual.label"), val: t("trust.stats.punctual.value") },
                { label: t("trust.stats.drivers.label"), val: t("trust.stats.drivers.value") }
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="p-6 md:p-8 lg:p-10 rounded-[40px] bg-[#0A0A0F] border border-white/[0.05] text-center shadow-2xl group/stat relative overflow-hidden flex flex-col justify-center min-h-[180px] hover:border-brand-gold/30 hover:bg-white/[0.02] transition-all duration-700"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.08)_0%,transparent_70%)] opacity-0 group-hover/stat:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                  <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60 mb-3 tracking-tight group-hover/stat:from-brand-gold group-hover/stat:to-yellow-200 transition-all duration-700 drop-shadow-sm whitespace-nowrap">{s.val}</div>
                  <div className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 group-hover/stat:text-white/60 transition-colors font-sans">{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Compliance Matrix V2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="p-10 md:p-12 rounded-[40px] bg-[#0A0A0F] border border-white/[0.05] shadow-2xl relative overflow-hidden backdrop-blur-3xl group/matrix hover:border-brand-gold/20 transition-all duration-700"
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent opacity-50 group-hover/matrix:opacity-100 transition-opacity duration-700" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-brand-gold/5 rounded-full blur-[80px] pointer-events-none group-hover/matrix:bg-brand-gold/10 transition-colors duration-1000" />
              
              <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30 mb-10 text-center font-sans">{t("trust.regulatoryTitle")}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 relative z-10">
                {tArray("trust.compliance").map((item: string, i: number) => (
                  <div key={item} className="flex items-center gap-4 text-white/40 group/badge hover:text-white transition-colors duration-500">
                    <div className="w-10 h-10 shrink-0 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/10 group-hover/badge:bg-brand-gold group-hover/badge:border-brand-gold group-hover/badge:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-500">
                      <CheckCircle2 className="w-5 h-5 text-white/30 group-hover/badge:text-black transition-colors" strokeWidth={2} />
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] leading-relaxed font-sans">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
