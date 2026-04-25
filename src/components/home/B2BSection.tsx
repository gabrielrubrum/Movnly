"use client";

import { useI18n } from "@/i18n/context";
import { Briefcase, Building2, Globe2, ShieldCheck, ArrowRight, Zap, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export function B2BSection() {
  const { t, tArray } = useI18n();
  const icons = [Building2, Globe2, Trophy, Users];

  return (
    <section className="nx-section bg-luxury-mesh py-32 relative overflow-hidden border-t border-white/5">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-gold/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none animate-glow-pulse" />

      <div className="nx-container">
        <div className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">

          <div className="order-2 lg:order-1 space-y-12">
            <div className="space-y-6">
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="text-brand-gold text-[10px] uppercase tracking-[0.5em] font-medium"
              >
                {t("b2b.badge_pill")}
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1]"
              >
                {t("b2b.headline1")} <br />
                <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-gold via-brand-gold/90 to-white/50 drop-shadow-[0_0_30px_rgba(212,175,55,0.2)]">{t("b2b.headline2")}</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg text-white/50 leading-relaxed max-w-xl font-light"
              >
                {t("b2b.subtitle")}
              </motion.p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 md:gap-8">
              {tArray("b2b.features").map((f: any, i: number) => {
                const Icon = icons[i] || Zap;
                return (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group p-8 rounded-[40px] glass-bento-premium border-white/10 hover:border-brand-gold/20 transition-all duration-700 shadow-2xl relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-brand-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mb-6 text-brand-gold transition-all group-hover:scale-110 shadow-glow">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-brand-gold transition-colors">{f.title}</h4>
                    <p className="text-sm font-light text-white/50 leading-relaxed font-sans">{f.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="pt-8"
            >
              <Link href="/parceiros/empresas" className="bg-brand-gold text-black px-12 py-5 rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 transition-all flex items-center justify-center gap-2 group w-full sm:w-auto shadow-xl">
                {t("b2b.cta_link")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>

          {/* Executive Narrative Visual */}
          <div className="order-1 lg:order-2 relative">
            <motion.div
              whileInView={{ opacity: 1, x: 0 }}
              initial={{ opacity: 0, x: 30 }}
              className="relative aspect-[4/5] rounded-[48px] overflow-hidden border border-white/10 shadow-luxury group/img"
            >
              <img
                src="https://images.pexels.com/photos/19169811/pexels-photo-19169811.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                className="w-full h-full object-cover grayscale-[30%] group-hover/img:grayscale-0 group-hover/img:scale-110 transition-all duration-1000 ease-out"
                alt="Serviço Executivo NexRice"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              {/* Floating Corporate Badge V2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="absolute bottom-8 left-8 right-8 p-10 bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[40px] shadow-luxury"
              >
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20 shadow-glow">
                    <Building2 className="w-7 h-7 text-brand-gold" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-white tracking-tight">{t("b2b.corp_badge")}</h4>
                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-brand-gold/60">{t("b2b.corp_exclusive")}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-white/50 font-light font-sans">
                  {t("b2b.corp_desc")}
                </p>
              </motion.div>
            </motion.div>

            {/* Side Pillar Accent V2 */}
            <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-1 h-[40%] bg-brand-gold opacity-10 rounded-full blur-[2px] hidden md:block" />
          </div>

        </div>
      </div>
    </section>
  );
}
