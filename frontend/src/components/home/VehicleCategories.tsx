"use client";

import { VEHICLE_CATEGORIES, LISBON_PRICES, CASCAIS_PRICES } from "@/lib/constants";
import { useI18n } from "@/i18n/context";
import { Users, Briefcase, ChevronRight, Star, ShieldCheck, Wifi, Shield, Zap, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ACCENTS: Record<string, { glow: string; ring: string; label: string }> = {
  smart: { glow: "rgba(100,116,139,0.25)", ring: "rgba(100,116,139,0.4)", label: "bg-slate-700 text-slate-200" },
  comfort: { glow: "rgba(59,130,246,0.2)", ring: "rgba(59,130,246,0.4)", label: "bg-blue-900 text-blue-200" },
  group: { glow: "rgba(245,158,11,0.2)", ring: "rgba(245,158,11,0.4)", label: "bg-amber-900 text-amber-200" },
  executive: { glow: "rgba(212,175,55,0.3)", ring: "rgba(212,175,55,0.5)", label: "bg-brand-gold text-black font-black" },
};

const CAT_ICONS: Record<string, React.ReactNode> = {
  smart: <Wifi className="w-3.5 h-3.5" />,
  comfort: <Star className="w-3.5 h-3.5" />,
  group: <Users className="w-3.5 h-3.5" />,
  executive: <Shield className="w-3.5 h-3.5" />,
};

export function VehicleCategories() {
  const { t } = useI18n();
  const [hovered, setHovered] = useState<string | null>(null);
  const [location, setLocation] = useState<"lisboa" | "cascais">("lisboa");

  return (
    <section id="categories" className="nx-section bg-luxury-mesh py-32 overflow-hidden relative">

      {/* Subtle top border gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="nx-container">

        {/* Section Header */}
        <div className="mb-24 flex flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-brand-gold text-[10px] uppercase tracking-[0.5em] font-medium mb-6 font-sans"
          >
            {t("categories.sectionBadge")}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-bold mb-8 text-white tracking-tight leading-[1.05]"
          >
            {t("categories.title1")} <br />
            <span className="font-sans font-medium text-white/30">{t("categories.title2")}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-white/40 max-w-xl mx-auto leading-relaxed font-light"
          >
            {t("categories.sub")}
          </motion.p>

          {/* Location Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-10 flex items-center p-1.5 bg-white/5 border border-white/10 rounded-full backdrop-blur-md shadow-2xl relative z-20"
          >
            <button
              onClick={() => setLocation("lisboa")}
              className={cn(
                "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500",
                location === "lisboa"
                  ? "bg-brand-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                  : "text-white/40 hover:text-white"
              )}
            >
              Lisboa
            </button>
            <button
              onClick={() => setLocation("cascais")}
              className={cn(
                "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.25em] transition-all duration-500",
                location === "cascais"
                  ? "bg-brand-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                  : "text-white/40 hover:text-white"
              )}
            >
              Cascais
            </button>
          </motion.div>
        </div>

        {/* Vehicle Cards - 4 col on lg, 2 col on md */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {VEHICLE_CATEGORIES.map((vehicle, idx) => {
            const isHovered = hovered === vehicle.id;
            const isExec = vehicle.id === "executive";

            return (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => setHovered(vehicle.id)}
                onMouseLeave={() => setHovered(null)}
                className="relative group h-full"
              >
                <div
                  className={cn(
                    "relative h-full flex flex-col rounded-[32px] border transition-all duration-700 overflow-hidden group/card",
                    isExec
                      ? "border-brand-gold/30 bg-[#0A0A0F] shadow-[0_20px_80px_-20px_rgba(212,175,55,0.15)]"
                      : "border-white/[0.05] bg-[#0A0A0F] hover:border-white/15 hover:shadow-[0_20px_80px_-20px_rgba(255,255,255,0.05)]"
                  )}
                >
                  {/* Ambient glow layer for hover */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-700 z-0"
                    style={{
                      background: isExec ? `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(212,175,55,0.1) 0%, transparent 70%)` : `radial-gradient(ellipse 80% 50% at 50% -10%, rgba(255,255,255,0.03) 0%, transparent 70%)`,
                      opacity: isHovered || isExec ? 1 : 0,
                    }}
                  />

                  {/* Cinematic Image Header */}
                  <div className="relative h-[260px] md:h-[280px] w-full shrink-0 overflow-hidden">
                    <motion.img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover/card:scale-105",
                        !isHovered && !isExec && "grayscale-[0.4]"
                      )}
                    />
                    
                    {/* Gradient Fade to Black */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/60 via-transparent to-transparent opacity-80" />

                    {/* Top Badges */}
                    <div className="absolute top-6 w-full px-6 flex justify-between items-start z-20">
                       <div className={cn(
                         "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.25em] backdrop-blur-md",
                         isExec ? "bg-brand-gold text-black shadow-lg" : "bg-black/60 text-white/80 border border-white/10"
                       )}>
                         {CAT_ICONS[vehicle.id]}
                         {t(`categories_list.${vehicle.id}.badge`)}
                       </div>
                       
                       {isExec && (
                         <div className="px-3 py-1.5 rounded-full bg-white text-black text-[8px] font-black uppercase tracking-[0.4em] shadow-xl">
                           VIP
                         </div>
                       )}
                    </div>
                  </div>

                  {/* Content Body */}
                  <div className="flex flex-col flex-1 px-8 pb-8 pt-0 relative z-10">
                    <h3 className="text-3xl font-bold text-white tracking-tight mb-2">
                      {t(`categories_list.${vehicle.id}.name`)}
                    </h3>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 font-sans mb-8">
                      {t(`categories_list.${vehicle.id}.tagline`)}
                    </p>

                    {/* Features */}
                    <div className="space-y-4 flex-1 mb-8">
                      {(vehicle.features || []).slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-500",
                            isExec || isHovered ? "bg-brand-gold" : "bg-white/15"
                          )} />
                          <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.15em] font-sans leading-snug">{f}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px] text-white/20 font-sans leading-relaxed mb-6 h-12">
                      <span className="font-bold text-white/40">Ex:</span> {t(`categories_list.${vehicle.id}.examples`)}
                    </p>

                    {/* Footer */}
                    <div className="pt-6 border-t border-white/[0.06] flex items-end justify-between mt-auto">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mb-1 font-sans">Desde</p>
                        <span className={cn(
                          "text-3xl font-bold tracking-tighter leading-none transition-colors duration-500",
                          isExec || isHovered ? "text-brand-gold" : "text-white"
                        )}>
                          {location === "lisboa" ? LISBON_PRICES[vehicle.id] : CASCAIS_PRICES[vehicle.id]}€
                        </span>
                      </div>

                      <Link
                        href={`/book?category=${vehicle.id}`}
                        className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                          isExec
                            ? "bg-brand-gold text-black hover:scale-110 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                            : "bg-white/5 border border-white/10 text-white hover:bg-brand-gold hover:text-black hover:border-brand-gold hover:scale-110"
                        )}
                      >
                        <ArrowRight className="w-5 h-5 -rotate-45" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <motion.div
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 30 }}
          viewport={{ once: true }}
          className="mt-20 p-8 md:p-14 rounded-[2rem] relative overflow-hidden border border-white/[0.06] bg-white/[0.02] flex flex-col md:flex-row items-center justify-between gap-10"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
          <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-60 h-60 rounded-full bg-brand-gold/5 blur-3xl pointer-events-none" />

          <div className="flex items-center gap-7 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20">
              <ShieldCheck className="w-8 h-8 text-brand-gold" />
            </div>
            <div>
              <h4 className="text-xl md:text-2xl font-bold text-white mb-1">{t("categories.guarantee")}</h4>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/30">{t("categories.guaranteeDesc")}</p>
            </div>
          </div>

          <Link
            href="/rotas"
            className="relative z-10 flex items-center gap-3 px-10 py-4 rounded-full border border-white/15 text-[9px] font-black uppercase tracking-[0.4em] text-white/50 hover:text-white hover:border-brand-gold/40 transition-all duration-500 group whitespace-nowrap"
          >
            {t("categories.compare")}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-brand-gold" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
