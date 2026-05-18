"use client";

import { useI18n } from "@/i18n/context";
import { MapPin, ArrowRight, Compass, Clock, Star } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export function RoutesSection() {
  const { t, tArray } = useI18n();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const images = [
    "https://images.pexels.com/photos/27832070/pexels-photo-27832070.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/36599721/pexels-photo-36599721.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/35510407/pexels-photo-35510407.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/18141984/pexels-photo-18141984.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  ];

  if (!isMounted) return <div className="h-[600px]" />; // Skeleton/Empty space for server

  return (
    <section className="nx-section bg-[#050507] py-32 relative overflow-hidden">
      <div className="nx-container">

        <div className="mb-20 flex flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-brand-gold text-[10px] uppercase tracking-[0.5em] font-medium mb-6"
          >
            {t("routes_section.badge")}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-bold mb-8 text-white tracking-tight leading-[1.05]"
          >
            {t("routes_section.title1")} <br />
            <span className="font-sans font-medium text-white/30">{t("routes_section.title2")}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-white/40 max-w-xl mx-auto leading-relaxed font-light"
          >
            {t("routes_section.sub")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tArray("routes_section.items").map((route: any, i: number) => {
            const isHovered = false; // We use CSS hover for this

            return (
              <motion.div
                key={`${route.from}-${route.to}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative h-[480px] md:h-[540px] rounded-[2rem] overflow-hidden border border-white/[0.05] bg-[#0A0A0F] shadow-2xl flex flex-col justify-between"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={images[i] || images[0]}
                    alt={`${route.from} to ${route.to}`}
                    className="w-full h-full object-cover opacity-50 group-hover:scale-110 group-hover:opacity-80 transition-all duration-[2s] ease-out grayscale-[0.3] group-hover:grayscale-0"
                  />
                  {/* Seamless Fade Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/60 to-transparent opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/50 via-transparent to-transparent opacity-80" />
                </div>

                {/* Top Section */}
                <div className="relative z-10 p-8">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
                    <Compass className="w-3 h-3 text-brand-gold" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/80">{t("routes_section.status")}</span>
                  </div>
                </div>

                {/* Bottom Content */}
                <div className="relative z-10 p-8 pt-0 flex flex-col gap-6">
                  <div className="space-y-4">
                    {/* Route Info */}
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 mb-1">Origem</p>
                      <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight group-hover:text-brand-gold transition-colors duration-500">
                        {route.from}
                      </h3>
                      
                      <div className="flex items-center gap-4 my-3">
                        <div className="h-px flex-1 bg-white/10 relative">
                          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-gold/50" />
                          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/50" />
                        </div>
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Destino</p>
                        <div className="h-px flex-1 bg-white/10" />
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight leading-tight">
                        {route.to}
                      </h3>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-white/40">
                      <div className="flex items-center gap-2 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                        <Clock className="w-3 h-3 text-brand-gold/60" />
                        <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white/80">{route.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                        <Star className="w-3 h-3 fill-brand-gold text-brand-gold" />
                        <span className="text-[9px] font-bold text-white/80">5.0</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer (Price & Button) */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/[0.06] mt-2">
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-brand-gold transition-colors duration-500">
                      Simular Rota
                    </span>

                    <Link
                      href={`/book?origin=${route.from}&destination=${route.to}`}
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 bg-white/5 border border-white/10 text-white hover:bg-brand-gold hover:text-black hover:border-brand-gold hover:scale-110"
                    >
                      <ArrowRight className="w-5 h-5 -rotate-45" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Professional Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 flex justify-center"
        >
          <Link href="/rotas" className="flex items-center gap-4 px-10 py-4 rounded-full border border-white/15 text-[10px] font-black uppercase tracking-[0.4em] text-white/50 hover:text-white hover:border-brand-gold/40 hover:bg-white/5 transition-all duration-500 group shadow-xl">
            {t("routes_section.exploreAll")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform text-brand-gold" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
