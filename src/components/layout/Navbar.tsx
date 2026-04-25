"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Menu, X, ArrowRight, ShieldCheck } from "lucide-react";
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useAuthStore } from "@/lib/auth-store";

export function Navbar() {
  const { t, locale, setLocale } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { user, logout } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Map local keys to JSON 'nav' keys
  const navItems = [
    { key: "services", label: t("nav.services"), href: "/services" },
    { key: "categories", label: t("nav.categories"), href: "/#categories" },
    { key: "routes", label: t("nav.routes"), href: "/tours" },
    { key: "forCompanies", label: t("nav.forCompanies"), href: "/parceiros/empresas" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-all duration-1000 h-[110px] flex items-center",
        scrolled
          ? "bg-black/40 backdrop-blur-2xl border-b border-white/[0.05] h-[85px] shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
          : "bg-transparent h-[110px]"
      )}
    >
      {/* Dynamic Glow Line */}
      <div className={cn(
        "absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent transition-all duration-1000",
        scrolled ? "opacity-100 w-full" : "opacity-0 w-0"
      )} />
      <div className="nx-container flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-4 group shrink-0 mr-8">
          <div className="relative">
            <img src="/logo-mark2.svg" alt="NexRice" className="w-10 h-10 grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-brand-gold/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          </div>
          <span className="text-xl font-bold text-white tracking-[0.3em] group-hover:tracking-[0.35em] transition-all duration-700 font-sans">
            NEXRICE
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-[11px] font-black uppercase tracking-[0.15em] text-white/60 hover:text-white transition-all whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Action Group */}
        <div className="flex items-center gap-8">
          <LanguageSwitcher variant="navbar" />

          {hasHydrated && user ? (
            <Link href="/dashboard" className="hidden md:flex items-center gap-4 group">
              <div className="w-8 h-8 rounded-full bg-brand-gold/10 flex items-center justify-center border border-brand-gold/20">
                <User className="w-4 h-4 text-brand-gold" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-brand-gold font-sans group-hover:text-white transition-colors">
                {user.name.split(' ')[0]}
              </span>
            </Link>
          ) : (
            <Link href="/login" className="hidden md:flex items-center gap-4 group">
              <User className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
              <span className="text-xs font-black uppercase tracking-widest text-white/60 group-hover:text-white transition-colors font-sans">
                {t("nav.signIn")}
              </span>
            </Link>
          )}

          <Link
            href="/book"
            className="hidden md:flex btn-editorial btn-editorial-primary !py-2.5 !px-8 !text-[10px]"
          >
            {t("nav.bookNow")}
          </Link>

          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#07070A]/95 backdrop-blur-2xl z-[90] lg:hidden animate-luxury-reveal flex flex-col pt-32 px-10">
          <div className="flex flex-col gap-8">
            {navItems.map((item, i) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-2xl font-bold uppercase tracking-[0.2em] text-white/50 hover:text-white transition-all animate-luxury-reveal"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {item.label}
              </Link>
            ))}
            <div className="h-px w-full bg-white/5 my-4" />
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-black uppercase tracking-widest text-brand-gold/60 flex items-center gap-4"
            >
              <User className="w-4 h-4" />
              {t("nav.signIn")}
            </Link>
            <Link
              href="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-editorial btn-editorial-primary w-full py-6 mt-4 text-xs"
            >
              {t("nav.bookNow")}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
