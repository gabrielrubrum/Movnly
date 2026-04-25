"use client";

import { useAuthStore } from "@/lib/auth-store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Calendar, Map, Plane, UserCheck, Car, Users,
  Building2, CreditCard, Tag, Zap, BarChart3, MessageSquare, Shield,
  Settings, LogOut, ChevronRight, Menu, X, ShieldCheck, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RoleGuard } from "@/components/auth/RoleGuard";

const NAV_GROUPS = [
    {
        label: "Gestão Geral",
        items: [
            { href: "/admin", label: "Resumo Geral", icon: LayoutDashboard },
            { href: "/admin/bookings", label: "Lista de Reservas", icon: Calendar },
            { href: "/admin/map", label: "Mapa de Viagens", icon: Map },
        ],
    },
    {
        label: "Gestão de Recursos",
        items: [
            { href: "/admin/drivers", label: "Motoristas", icon: UserCheck },
            { href: "/admin/fleet", label: "Frota", icon: Car },
            { href: "/admin/customers", label: "Clientes", icon: Users },
            { href: "/admin/staff", label: "Equipa & Cargos", icon: Building2 },
        ],
    },
    {
        label: "Área Financeira",
        items: [
            { href: "/admin/payments", label: "Transações", icon: CreditCard },
            { href: "/admin/pricing", label: "Tarifário", icon: Tag },
        ],
    },
    {
        label: "Relatórios",
        items: [
            { href: "/admin/analytics", label: "Estatísticas", icon: BarChart3 },
            { href: "/admin/audit", label: "Auditoria", icon: Shield },
        ],
    },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const dashboardRoles = ['ADMIN', 'MANAGER', 'OPERATOR', 'ACCOUNTANT'];

    return (
        <RoleGuard allowedRoles={dashboardRoles}>
            <div className="min-h-screen bg-[#030303] text-white selection:bg-brand-gold/20 selection:text-brand-gold overflow-hidden">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-brand-gold/5 rounded-full blur-[150px] opacity-10" />
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px] opacity-5" />
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
              <span className="text-[7px] font-black text-brand-gold uppercase tracking-[0.5em] mt-1.5 opacity-60">
                Executive Command Hub
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Protocol */}
        <nav className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
               <div className="text-[9px] font-black text-white/10 uppercase tracking-[0.4em] mb-4 px-4">{group.label}</div>
               <div className="space-y-1">
                 {group.items.map(({ href, label, icon: Icon }) => {
                   const active = pathname === href || pathname.startsWith(href + "/");
                   return (
                     <Link
                       key={href}
                       href={href}
                       className={cn(
                         "flex items-center gap-4 px-5 py-3 rounded-2xl text-[10.5px] font-bold uppercase tracking-[0.1em] transition-all duration-300 relative group",
                         active
                           ? "bg-brand-gold text-black shadow-xl"
                           : "text-white/30 hover:text-white hover:bg-white/[0.03]"
                       )}
                     >
                       <Icon className={cn("w-3.5 h-3.5 transition-colors", active ? "text-black" : "text-white/20 group-hover:text-brand-gold")} />
                       {label}
                     </Link>
                   );
                 })}
               </div>
            </div>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-6 border-t border-white/5 space-y-4">
          <LanguageSwitcher variant="navbar" />
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-brand-gold/10 flex items-center justify-center text-brand-gold font-black text-xs">
                {user?.name?.[0]}
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-white truncate">{user?.name}</p>
                <p className="text-[8px] text-white/20 truncate font-sans">Super Administrator</p>
             </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 w-full px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white/20 hover:text-red-500 hover:bg-red-500/5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Main Content Arena */}
      <div className="flex-1 lg:ml-72 min-h-screen relative z-10">
        
        {/* HUD Top Bar */}
        <header className="flex items-center justify-between px-8 h-20 border-b border-white/5 bg-[#07070A]/80 backdrop-blur-xl sticky top-0 z-[60]">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10 hidden sm:flex">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Servidor Ativo
            </div>
          </div>

          <div className="flex items-center gap-6">
             <Link href="/book" className="px-6 py-2.5 bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-[0.3em] rounded-full hover:bg-brand-gold hover:text-black transition-all">
                Gestão de Reservas
             </Link>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-50 bg-[#07070A] p-8 pt-24 lg:hidden overflow-y-auto"
            >
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="mb-10">
                   <p className="text-[10px] font-black text-white/10 uppercase tracking-widest mb-6 px-4">{group.label}</p>
                   {group.items.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-6 p-6 rounded-[32px] text-lg font-light italic tracking-tight transition-all mb-2",
                        pathname === href ? "bg-brand-gold text-black" : "text-white/40 border border-white/5"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {label}
                    </Link>
                  ))}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <main className="p-8 lg:p-16">
          {children}
        </main>
        </div>
        </div>
    </RoleGuard>
    );
}

function Loader2(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  );
}
