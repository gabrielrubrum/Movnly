"use client";

import Link from "next/link";
import { useI18n } from "@/i18n/context";
import { useState } from "react";
import {
  ShieldCheck, Globe, Users, MessageSquare, Shield,
  ArrowRight, Mail,
  MapPin, Phone, MessageCircle, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer() {
  const { t, tArray } = useI18n();
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setStatus("loading");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setStatus(data.success ? "success" : "error");
      if (data.success) setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <footer className="relative bg-[#050507] pt-32 pb-12 border-t border-white/[0.03] overflow-hidden">

      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[500px] bg-brand-gold/[0.02] blur-[160px] -z-10 rounded-full" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] bg-blue-500/[0.02] blur-[140px] -z-10 rounded-full" />

      {/* Subtle Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none -z-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

      <div className="nx-container relative z-10">

        {/* Upper Footer: Concierge Newsletter */}
        <div className="mb-24 p-12 rounded-[2.5rem] bg-[#0A0A0F] border border-white/[0.05] backdrop-blur-3xl overflow-hidden relative group shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
            <div className="w-24 h-24 border border-brand-gold/10 rounded-full animate-spin-slow flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-brand-gold/20" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-gold mb-4 block">
                {t("footer.newsletter.badge")}
              </span>
              <h3
                className="text-4xl font-bold text-white uppercase tracking-tight mb-6"
                dangerouslySetInnerHTML={{ __html: t("footer.newsletter.title").replace(/<gold>(.*?)<\/gold>/, '<span class="text-brand-gold">$1</span>') }}
              />
              <p className="text-white/40 text-sm max-w-md leading-relaxed font-medium">
                {t("footer.newsletter.sub")}
              </p>
            </div>
            <div className="relative">
              {status === "success" ? (
                <div className="flex items-center gap-3 p-5 rounded-2xl" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <p className="text-sm font-bold text-emerald-400">Subscrito com sucesso! Vai receber as nossas novidades.</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe}>
                  <div className="flex bg-black/40 rounded-2xl border border-white/5 p-2 focus-within:border-brand-gold/30 transition-all shadow-inner">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t("footer.newsletter.placeholder")}
                      className="bg-transparent border-none focus:ring-0 text-white text-sm px-6 flex-1 font-medium outline-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="bg-brand-gold hover:bg-white text-black px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_10px_20px_-5px_rgba(212,175,55,0.3)] disabled:opacity-60"
                    >
                      {status === "loading" ? "..." : t("footer.newsletter.button")}
                    </button>
                  </div>
                  {status === "error" && <p className="mt-2 text-xs text-red-400">Erro ao subscrever. Tenta novamente.</p>}
                </form>
              )}
              <p className="mt-4 text-[9px] text-white/10 uppercase tracking-[0.2em] font-black w-full text-center lg:text-left">
                🔒 {t("footer.newsletter.privacy")}
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-32">

          {/* Brand & Social Identity */}
          <div className="lg:col-span-5">
            <Link href="/" className="inline-block mb-10 group">
              <div className="relative">
                <img src="/logoMov.png" alt="MOVNLY" className="h-14 md:h-[65px] w-auto transition-all duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-brand-gold/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
            </Link>
            <p className="text-xl font-medium text-white/50 mb-12 leading-relaxed max-w-md">
              {t("footer.tagline")}
            </p>
            <div className="flex items-center gap-4">
              {[Globe, Users, MessageSquare, Shield].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="w-12 h-12 rounded-full bg-white/[0.02] border border-white/[0.08] flex items-center justify-center hover:bg-brand-gold hover:border-brand-gold hover:scale-110 transition-all duration-500 group shadow-lg"
                >
                  <Icon className="w-5 h-5 text-white/30 group-hover:text-black transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Matrix */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-12 lg:pl-12">
            {[
              { key: "services", icon: MapPin },
              { key: "company", icon: Users },
              { key: "support", icon: MessageCircle }
            ].map((col) => (
              <div key={col.key}>
                <div className="flex items-center gap-3 mb-10">
                  <col.icon className="w-3.5 h-3.5 text-brand-gold/30" />
                  <h4 className="text-[10px] font-black text-brand-gold/40 uppercase tracking-[0.4em]">
                    {t(`footer.cols.${col.key}.title`)}
                  </h4>
                </div>
                <ul className="flex flex-col gap-6">
                  {tArray(`footer.cols.${col.key}.links`).map((link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-[12px] font-bold text-white/30 hover:text-white transition-all flex items-center gap-4 group/item"
                      >
                        <span className="w-1.5 h-1.5 rounded-full border border-white/10 group-hover/item:bg-brand-gold group-hover/item:border-brand-gold transition-all duration-500" />
                        <span className="tracking-widest">{link}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Legal & Global Recognition */}
        <div className="pt-12 border-t border-white/[0.03] flex flex-col lg:flex-row items-center justify-between gap-12">

          <div className="flex flex-col md:flex-row items-center gap-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/15">
              {t("footer.copyright", { year })}
            </span>
            <div className="hidden md:block w-px h-4 bg-white/5" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
              {t("footer.developedBy")} <span className="text-brand-gold">VERV</span>
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-10">
            {tArray("footer.legal").map((item: string, i: number) => {
              const legalHrefs: Record<number, string> = {
                0: "/privacidade",
                1: "/termos",
                2: "/como-funciona",
              };
              return (
                <Link
                  key={item}
                  href={legalHrefs[i] ?? "#"}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-brand-gold transition-all duration-500 hover:-translate-y-0.5"
                >
                  {item}
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </footer>
  );
}