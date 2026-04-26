"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Calendar, Clock, CreditCard,
  Star, Bell, Settings, LogOut, User, ChevronRight, Plus,
  ShieldCheck, Activity, Menu, X
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import { RoleGuard } from "@/components/auth/RoleGuard";

const NAV = [
    { href: "/dashboard", label: "Painel Principal", icon: LayoutDashboard },
    { href: "/dashboard/bookings", label: "Minhas Reservas", icon: Calendar },
    { href: "/dashboard/history", label: "Histórico", icon: Clock },
    { href: "/dashboard/payment", label: "Pagamentos", icon: CreditCard },
    { href: "/dashboard/profile", label: "Perfil", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const user = useAuthStore(s => s.user);
    const logout = useAuthStore(s => s.logout);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <RoleGuard allowedRoles={['PASSENGER']}>
            <div className="min-h-screen bg-[#030303] text-white selection:bg-brand-gold/20 selection:text-brand-gold overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-brand-gold/5 rounded-full blur-[120px] opacity-10" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-white/5 rounded-full blur-[100px] opacity-5" />
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 bg-[#07070A]/80 backdrop-blur-3xl fixed top-0 bottom-0 left-0 z-50">
        {/* Branding */}
        <div className="p-8 border-b border-white/5">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="relative">
              <img 
                src="/logo-mark2.svg" 
                alt="NexRice" 
                className="w-10 h-10 grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-brand-gold/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-black text-xl tracking-[0.25em] uppercase leading-none font-sans">
                NEXRICE
              </span>
              <span className="text-[7px] font-black text-brand-gold uppercase tracking-[0.6em] mt-1.5 opacity-60">
                Elite · Chauffeur
              </span>
            </div>
          </Link>
        </div>

        {/* User Intel */}
        {user && (
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold flex items-center justify-center text-black font-black text-lg shadow-xl shrink-0 group-hover:rotate-3 transition-transform">
                {user.name.substring(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-white/20 uppercase tracking-widest font-black truncate">{user.role}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Protocol */}
        <nav className="flex-1 p-6 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-black text-white/10 uppercase tracking-[0.4em] mb-6 px-4">Navegação</div>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-200 relative group",
                  active
                    ? "bg-brand-gold text-black shadow-[0_8px_24px_-8px_rgba(212,175,55,0.5)]"
                    : "text-white/30 hover:text-white hover:bg-white/[0.05]"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200",
                  active
                    ? "bg-black/10 text-black"
                    : "bg-white/5 text-white/20 group-hover:bg-brand-gold/10 group-hover:text-brand-gold"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{label}</span>
                {active && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-black/30" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-6 border-t border-white/5 space-y-4">
          <LanguageSwitcher variant="navbar" />
          <Link href="/book" className="flex items-center justify-center gap-3 w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-all duration-300 group">
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" /> Nova Reserva
          </Link>
          <button 
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-red-400 hover:bg-red-500/5 transition-all group"
          >
            <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content Arena */}
      <div className="flex-1 lg:ml-72 min-h-screen relative z-10">
        
        {/* Mobile Nav HUD */}
        <header className="lg:hidden flex items-center justify-between px-6 h-20 border-b border-white/5 bg-[#07070A]/90 backdrop-blur-xl sticky top-0 z-[60]">
          <Link href="/" className="flex items-center gap-3">
            <img 
              src="/logo-mark2.svg" 
              alt="NexRice" 
              className="w-8 h-8 grayscale" 
            />
            <span className="text-white font-black text-sm tracking-widest uppercase">
              NEXRICE
            </span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-50 bg-[#07070A] p-8 pt-24 lg:hidden"
            >
              <div className="space-y-4">
                {NAV.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-6 p-6 rounded-[32px] text-lg font-light italic tracking-tight transition-all",
                      pathname === href ? "bg-brand-gold text-black" : "text-white/40 border border-white/5"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    {label}
                  </Link>
                ))}
              </div>
              <div className="mt-12 pt-12 border-t border-white/5 space-y-6">
                <Link href="/book" className="w-full py-6 bg-brand-gold text-black text-[11px] font-black uppercase tracking-[0.4em] rounded-[24px] flex items-center justify-center gap-4">
                  <Plus className="w-5 h-5" /> Reservar Agora
                </Link>
                <div className="flex justify-center">
                  <LanguageSwitcher variant="navbar" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="p-6 md:p-10 lg:p-16">
          {children}
        </main>
      </div>
    </div>
  </RoleGuard>
  );
}
