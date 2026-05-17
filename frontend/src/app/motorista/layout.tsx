"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Calendar, Clock, Star,
  DollarSign, LogOut, Menu, X, MessageSquare, Settings
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { motion, AnimatePresence } from "framer-motion";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { BookingChat } from "@/components/chat/BookingChat";

const navItems = [
  { href: "/motorista", label: "Painel Principal", icon: LayoutDashboard },
  { href: "/motorista/viagens", label: "Minhas Viagens", icon: Calendar },
  { href: "/motorista/historico", label: "Arquivo", icon: Clock },
  { href: "/motorista/ganhos", label: "Rendimentos", icon: DollarSign },
  { href: "/motorista/avaliacoes", label: "Avaliações", icon: Star },
  { href: "/motorista/configuracoes", label: "Minha Conta", icon: Settings },
];

export default function MotoristaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <RoleGuard allowedRoles={['DRIVER', 'ADMIN']}>
      <div className="min-h-screen bg-[#050507] text-white selection:bg-brand-gold/20 selection:text-brand-gold overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-brand-gold/5 rounded-full blur-[150px] opacity-10" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px] opacity-5" />
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 bg-[#07070A]/80 backdrop-blur-3xl fixed top-0 bottom-0 left-0 z-50">
        
        <div className="p-8 border-b border-white/5">
          <Link href="/" className="flex items-center group">
            <div className="relative">
              <img 
                src="/logoMov.png" 
                alt="MOVNLY" 
                className="h-16 md:h-20 w-auto transition-all duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-brand-gold/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
          </Link>
        </div>

        {/* User Intel */}
        {user && (
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center gap-4 p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center text-brand-gold font-black text-lg shadow-xl shrink-0">
                {user.name.substring(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Ativo</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Core */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-8 px-4 flex items-center gap-4">
            Navegação
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/motorista'
              ? pathname === '/motorista'
              : pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 relative group overflow-hidden",
                  active
                    ? "bg-brand-gold text-black shadow-[0_0_30px_-5px_rgba(212,175,55,0.4)]"
                    : "bg-transparent border border-transparent text-white/40 hover:text-white hover:bg-white/[0.04] hover:translate-x-1"
                )}
              >
                {active && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-30 pointer-events-none" />
                )}
                <div className={cn(
                  "w-9 h-9 rounded-[12px] flex items-center justify-center flex-shrink-0 transition-all duration-300 relative z-10",
                  active
                    ? "bg-black/10 text-black shadow-inner"
                    : "bg-white/5 text-white/30 group-hover:bg-brand-gold/10 group-hover:text-brand-gold group-hover:scale-110"
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="relative z-10 flex-1 whitespace-nowrap">{label}</span>
                {active && <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-black/40 relative z-10" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-6 border-t border-white/5 space-y-3">
          <LanguageSwitcher variant="sidebar" />

          {/* Suporte Operacional WhatsApp */}
          <a
            href="https://wa.me/351924851105"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 w-full px-4 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-[#25D366]/80 hover:text-[#25D366] bg-[#25D366]/5 border border-[#25D366]/10 hover:bg-[#25D366]/10 hover:border-[#25D366]/30 transition-all shadow-[0_0_15px_-5px_rgba(37,211,102,0.2)]"
          >
            <div className="w-8 h-8 rounded-xl bg-[#25D366]/10 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            Central de Operações
          </a>
          <button
            onClick={() => useAuthStore.getState().logout()}
            className="flex items-center gap-3 w-full px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-red-400 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sair da Conta
          </button>
        </div>
      </aside>

      {/* Chat global — acessível de qualquer página do motorista */}
      {showChat && (
        <BookingChat
          bookingId="support"
          isOpen={showChat}
          onClose={() => setShowChat(false)}
          title="Chat com Passageiro"
        />
      )}

      {/* Main Content Arena */}
      <div className="flex-1 lg:ml-72 min-h-screen relative z-10">
        
        {/* Mobile Nav HUD */}
        <header className="lg:hidden flex items-center justify-between px-6 h-20 border-b border-white/5 bg-[#07070A]/90 backdrop-blur-xl sticky top-0 z-[60]">
          <Link href="/" className="flex items-center">
            <img 
              src="/logoMov.png" 
              alt="MOVNLY" 
              className="h-12 md:h-14 w-auto grayscale-0" 
            />
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
                {navItems.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex items-center gap-6 p-6 rounded-[32px] text-lg font-light tracking-tight transition-all",
                      pathname === href ? "bg-brand-gold text-black" : "text-white/40 border border-white/5"
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    {label}
                  </Link>
                ))}
              </div>
              <div className="mt-12 pt-12 border-t border-white/5 space-y-6">
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
