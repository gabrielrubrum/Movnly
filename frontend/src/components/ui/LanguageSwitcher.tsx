"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/context";
import { locales, localeNames, localeFlags, type Locale } from "@/i18n/config";
import { Globe, Check, ChevronDown } from "lucide-react";

interface LanguageSwitcherProps {
  variant?: "navbar" | "footer" | "minimal" | "sidebar";
}

export function LanguageSwitcher({ variant = "navbar" }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  if (variant === "sidebar") {
    return (
      <div className="relative w-full">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-between w-full px-4 py-3.5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-all duration-300 group"
        >
          <div className="flex items-center gap-3">
            <img 
              src={`https://flagcdn.com/w40/${localeFlags[locale]}.png`} 
              alt={locale} 
              className="w-5 h-3.5 rounded-[3px] object-cover shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
            />
            <span className="font-black uppercase tracking-[0.2em]">{localeNames[locale]}</span>
          </div>
          <ChevronDown className={cn("w-3.5 h-3.5 text-white/20 group-hover:text-white transition-transform duration-300", open && "rotate-180")} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeMenu} />
            <div className="absolute bottom-full left-0 mb-2.5 w-full bg-[#0A0A0F]/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-1.5 z-50">
              <p className="text-[8px] font-black text-brand-gold/60 uppercase tracking-[0.2em] px-3 py-2 border-b border-white/5 mb-1.5">
                Selecione o Idioma
              </p>
              <div className="space-y-0.5">
                {locales.map((l) => (
                  <button key={l} onClick={() => { setLocale(l); closeMenu(); }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      l === locale 
                        ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/20" 
                        : "text-white/40 hover:text-white hover:bg-white/[0.04] border border-transparent"
                    )}
                  >
                    <img src={`https://flagcdn.com/w40/${localeFlags[l]}.png`} alt={l} className="w-5 h-3.5 rounded-[3px] object-cover" />
                    <span>{localeNames[l]}</span>
                    {l === locale && <Check className="w-3.5 h-3.5 ml-auto text-brand-gold" />}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors font-medium"
        >
          <img src={`https://flagcdn.com/w40/${localeFlags[locale]}.png`} alt={locale} className="w-4 h-3 rounded-[2px] object-cover" />
          <span>{localeNames[locale]}</span>
          <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeMenu} />
            <div className="absolute bottom-full left-0 mb-2 w-40 glass-dark rounded-xl border border-white/[0.08] shadow-nx-lg p-1.5 z-50 animate-scale-in">
              {locales.map((l) => (
                <button key={l} onClick={() => { setLocale(l); closeMenu(); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all",
                    l === locale ? "bg-brand-500/15 text-brand-300" : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                  )}
                >
                  <img src={`https://flagcdn.com/w40/${localeFlags[l]}.png`} alt={l} className="w-5 h-auto rounded-[2px] object-cover" />
                  <span className="font-medium">{localeNames[l]}</span>
                  {l === locale && <Check className="w-3.5 h-3.5 ml-auto text-brand-400" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.07] bg-white/[0.03] text-sm text-white/40 hover:text-white/70 hover:border-white/[0.12] transition-all"
        >
          <Globe className="w-3.5 h-3.5" />
          <img src={`https://flagcdn.com/w40/${localeFlags[locale]}.png`} alt={locale} className="w-4 h-3 rounded-[2px] object-cover" />
          <span>{localeNames[locale]}</span>
          <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={closeMenu} />
            <div className="absolute bottom-full left-0 mb-2 w-44 glass-dark rounded-xl border border-white/[0.08] shadow-nx-lg p-1.5 z-50 animate-scale-in">
              {locales.map((l) => (
                <button key={l} onClick={() => { setLocale(l); closeMenu(); }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all",
                    l === locale ? "bg-brand-500/15 text-brand-300" : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                  )}
                >
                  <img src={`https://flagcdn.com/w40/${localeFlags[l]}.png`} alt={l} className="w-5 h-auto rounded-[2px] object-cover" />
                  <span className="font-medium">{localeNames[l]}</span>
                  {l === locale && <Check className="w-3.5 h-3.5 ml-auto text-brand-400" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // navbar variant
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-all"
        aria-label={t("languageSwitcher.label")}
      >
        <img src={`https://flagcdn.com/w40/${localeFlags[locale]}.png`} alt={locale} className="w-5 h-3.5 rounded-[2px] object-cover shadow-sm shrink-0" />
        <span className="font-semibold uppercase tracking-wide text-xs ml-0.5">{locale}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200 shrink-0 opacity-40", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} />
          <div className="absolute top-full right-0 mt-2 w-48 glass-dark rounded-2xl border border-white/[0.08] shadow-nx-xl p-2 z-50 animate-scale-in">
            <p className="text-[0.6rem] font-bold text-white/25 uppercase tracking-[0.1em] px-3 py-1.5">
              {t("languageSwitcher.label")}
            </p>
            {locales.map((l) => (
              <button key={l} onClick={() => { setLocale(l); closeMenu(); }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  l === locale
                    ? "bg-brand-500/15 text-brand-300 border border-brand-500/20"
                    : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                <img src={`https://flagcdn.com/w40/${localeFlags[l]}.png`} alt={l} className="w-5 h-auto rounded-[2px] object-cover shadow-sm" />
                <span>{localeNames[l]}</span>
                {l === locale && <Check className="w-3.5 h-3.5 ml-auto text-brand-400" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
