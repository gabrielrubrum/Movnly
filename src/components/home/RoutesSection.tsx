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
    <section className="nx-section bg-luxury-mesh py-32 relative overflow-hidden border-t border-white/5">
      <div className="nx-container">

        <div className="mb-24 flex flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-brand-gold text-[10px] uppercase tracking-[0.5em] font-medium mb-6"
          >
            {t("routes_section.badge")}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-8 text-white tracking-tight leading-[1.1]"
          >
            {t("routes_section.title1")} <br />
            <span className="font-sans font-medium text-white/40">{t("routes_section.title2")}</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/50 max-w-xl mx-auto leading-relaxed font-light"
          >
            {t("routes_section.sub")}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {tArray("routes_section.items").map((route: any, i: number) => (
            <motion.div
              key={`${route.from}-${route.to}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative h-[500px] md:h-[580px] rounded-[48px] overflow-hidden luxury-card border-white/5 shadow-2xl"
            >
              <img
                src={images[i] || images[0]}
                alt={`${route.from} to ${route.to}`}
                className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-90 transition-all duration-1000 ease-out grayscale-[20%] group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

              <div className="absolute inset-x-8 bottom-10 flex flex-col gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Compass className="w-3.5 h-3.5 text-brand-gold/60" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/80">{t("routes_section.status")}</span>
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-none">
                    {route.from} <br />
                    <span className="text-white/20 font-sans text-xs uppercase tracking-widest font-bold">para</span> <br />
                    {route.to}
                  </h3>
                  <div className="flex items-center gap-4 text-white/40 border-t border-white/10 pt-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase">{route.duration}</p>
                    </div>
                    <div className="flex items-center gap-1 text-brand-gold">
                      <Star className="w-3 h-3 fill-current" />
                      <span className="text-[10px] font-bold">5.0</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <span className="text-3xl font-bold text-white tracking-tight">{route.price}€</span>
                  <Link
                    href={`/book?origin=${route.from}&destination=${route.to}`}
                    className="w-12 h-12 rounded-full bg-brand-gold text-black flex items-center justify-center hover:bg-white transition-all duration-500 active:scale-95 group/btn"
                  >
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Professional Footer CTA V2 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24 flex justify-center"
        >
          <Link href="/rotas" className="flex items-center gap-6 px-16 py-5 rounded-full border border-white/10 text-[11px] font-bold uppercase tracking-[0.4em] text-white/60 hover:text-white hover:border-brand-gold/40 transition-all duration-500 group shadow-xl">
            {t("routes_section.exploreAll")}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-3 transition-transform text-brand-gold" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
