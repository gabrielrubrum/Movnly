"use client";

import { VEHICLE_CATEGORIES } from "@/lib/constants";
import { useI18n } from "@/i18n/context";
import { Users, Briefcase, ChevronRight, Star, ShieldCheck, Wifi, Shield, Zap } from "lucide-react";
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
        </div>

        {/* Vehicle Cards - 4 col on lg, 2 col on sm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VEHICLE_CATEGORIES.map((vehicle, idx) => {
            const accent = ACCENTS[vehicle.id] || ACCENTS.smart;
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
                className="relative group"
              >
                <div
                  className={cn(
                    "relative h-full flex flex-col rounded-[2rem] border transition-all duration-700 overflow-hidden",
                    isExec
                      ? "border-brand-gold/30 bg-[#0e0c04]"
                      : "border-white/[0.07] bg-[#0a0a0f] hover:border-white/15"
                  )}
                  style={isHovered ? {
                    boxShadow: `0 0 80px -20px ${accent.glow}, 0 0 0 1px ${accent.ring}20`,
                  } : {}}
                >
                  {/* Ambient glow layer */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-700"
                    style={{
                      background: `radial-gradient(ellipse 80% 50% at 50% -10%, ${accent.glow} 0%, transparent 70%)`,
                      opacity: isHovered || isExec ? 1 : 0,
                    }}
                  />

                  {/* EXECUTIVE badge corner ribbon */}
                  {isExec && (
                    <div className="absolute top-5 right-5 z-20">
                      <div className="px-3 py-1 rounded-full bg-brand-gold text-black text-[8px] font-black uppercase tracking-[0.4em]">
                        Top
                      </div>
                    </div>
                  )}

                  {/* Car Visual */}
                  <div className="relative h-[200px] md:h-[220px] flex items-center justify-center p-6 overflow-hidden">
                    {/* Floor shadow */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/5 h-6 blur-xl rounded-full bg-black/60 opacity-70" />

                    {/* Star rating */}
                    <div className="absolute bottom-5 left-6 flex items-center gap-0.5 opacity-30 group-hover:opacity-80 transition-opacity duration-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 text-brand-gold fill-brand-gold" />
                      ))}
                    </div>

                    <motion.img
                      src={vehicle.image}
                      alt={vehicle.name}
                      animate={isHovered
                        ? { scale: 1.18, y: -10, rotate: -1.5 }
                        : { scale: 1.0, y: 0, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 80, damping: 18 }}
                      className={cn(
                        "relative z-10 w-full max-w-[220px] h-auto object-contain drop-shadow-[0_15px_40px_rgba(0,0,0,0.9)] transition-all duration-700",
                        !isHovered && "grayscale-[0.3] opacity-70"
                      )}
                    />
                  </div>

                  {/* Divider */}
                  <div className="h-px mx-6 bg-gradient-to-r from-transparent via-white/8 to-transparent" />

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-7 gap-5">

                    {/* Badge + Name */}
                    <div className="space-y-3">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.35em]",
                        accent.label
                      )}>
                        {CAT_ICONS[vehicle.id]}
                        {t(`categories_list.${vehicle.id}.badge`)}
                      </div>

                      <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight leading-none mb-1">
                          {t(`categories_list.${vehicle.id}.name`)}
                        </h3>
                        <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/30 font-sans">
                          {t(`categories_list.${vehicle.id}.tagline`)}
                        </p>
                      </div>
                    </div>

                    {/* Models */}
                    <p className="text-[10px] text-white/25 font-sans leading-relaxed">
                      {t(`categories_list.${vehicle.id}.examples`)}
                    </p>

                    {/* Features */}
                    <div className="space-y-2 flex-1">
                      {(vehicle.features || []).slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-500",
                            isHovered || isExec ? "bg-brand-gold" : "bg-white/15"
                          )} />
                          <span className="text-[9px] font-bold text-white/40 uppercase tracking-[0.25em] font-sans">{f}</span>
                        </div>
                      ))}
                    </div>

                    {/* Price + CTA */}
                    <div className="pt-5 border-t border-white/[0.06] flex items-end justify-between">
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mb-1 font-sans">Desde</p>
                        <span className={cn(
                          "text-2xl font-bold tracking-tighter leading-none transition-colors duration-500",
                          isHovered || isExec ? "text-brand-gold" : "text-white/60"
                        )}>
                          {t(`categories_list.${vehicle.id}.price`)}€
                        </span>
                      </div>

                      <Link
                        href={`/book?category=${vehicle.id}`}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-full border text-[8px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 font-sans",
                          isExec
                            ? "border-brand-gold/50 text-brand-gold hover:bg-brand-gold hover:text-black"
                            : "border-white/10 text-white/30 hover:border-brand-gold/50 hover:text-brand-gold"
                        )}
                      >
                        {t("nav.bookNow")}
                        <ChevronRight className="w-3 h-3 shrink-0" />
                      </Link>
                    </div>
                  </div>

                  {/* Bottom gold strip on exec or hover */}
                  <div className={cn(
                    "absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent transition-opacity duration-700",
                    isHovered || isExec ? "opacity-100" : "opacity-0"
                  )} />
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
