"use client";

import { useAuthStore } from "@/lib/auth-store";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, CalendarDays, Map, UserCheck, Car,
  Users, CreditCard, BarChart3, Shield, LogOut,
  Menu, X, Plane, Tag, Building2, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RoleGuard } from "@/components/auth/RoleGuard";

const NAV = [
  {
    section: "Principal",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/bookings", label: "Reservas", icon: CalendarDays },
      { href: "/admin/flights", label: "Voos", icon: Plane },
    ],
  },
  {
    section: "Pessoas",
    items: [
      { href: "/admin/drivers", label: "Motoristas", icon: UserCheck },
      { href: "/admin/customers", label: "Clientes", icon: Users },
      { href: "/admin/staff", label: "Equipa", icon: Building2 },
    ],
  },
  {
    section: "Financeiro",
    items: [
      { href: "/admin/payments", label: "Pagamentos", icon: CreditCard },
      { href: "/admin/analytics", label: "Relatórios", icon: BarChart3 },
      { href: "/admin/audit", label: "Auditoria", icon: Shield },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <RoleGuard allowedRoles={['ADMIN', 'MANAGER', 'OPERATOR', 'ACCOUNTANT']}>
      <div className="min-h-screen bg-[#050507] text-white">

        {/* Ambient */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-[120px] opacity-20" />
        </div>

        {/* ── Sidebar Desktop ─────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 left-0 z-50 bg-[#0A0A0F] border-r border-white/[0.08]">

          {/* Logo */}
          <div className="flex items-center gap-3 px-6 h-16 border-b border-white/[0.06]">
            <img src="/logo-mark2.svg" alt="NexRice" className="w-8 h-8" />
            <div>
              <p className="text-white font-black text-sm tracking-[0.2em] uppercase leading-none">NEXRICE</p>
              <p className="text-[8px] text-brand-gold/60 uppercase tracking-widest font-black mt-0.5">Admin</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
            {NAV.map((group) => (
              <div key={group.section}>
                <p className="text-[9px] font-black text-white/35 uppercase tracking-[0.4em] px-3 mb-2">{group.section}</p>
                <div className="space-y-0.5">
                  {group.items.map(({ href, label, icon: Icon, exact }) => {
                    const active = isActive(href, exact);
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.1em] transition-all duration-150 group",
                          active
                            ? "bg-brand-gold text-black shadow-[0_4px_12px_rgba(212,175,55,0.3)]"
                            : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                        )}
                      >
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-150",
                          active
                            ? "bg-black/15 text-black"
                            : "bg-white/8 text-white/40 group-hover:bg-brand-gold/10 group-hover:text-brand-gold"
                        )}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        {label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User + Logout */}
          <div className="px-3 py-4 border-t border-white/[0.06] space-y-1">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.02]">
              <div className="w-7 h-7 rounded-lg bg-brand-gold flex items-center justify-center text-black font-black text-xs flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-white truncate">{user?.name}</p>
                <p className="text-[8px] text-white/20 uppercase tracking-widest">Admin</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-[0.1em] text-white/25 hover:text-red-400 hover:bg-red-500/5 transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-red-500/10 transition-all">
                <LogOut className="w-3.5 h-3.5" />
              </div>
              Sair
            </button>
          </div>
        </aside>

        {/* ── Main ────────────────────────────────────────────── */}
        <div className="lg:ml-64 min-h-screen relative z-10">

          {/* Top bar */}
          <header className="sticky top-0 z-40 flex items-center justify-between px-6 h-16 bg-[#07070A]/90 backdrop-blur-xl border-b border-white/[0.06]">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center"
              >
                {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                <span>Admin</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-white/60">
                  {NAV.flatMap(g => g.items).find(i => isActive(i.href, i.exact))?.label || 'Dashboard'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/5 px-3 py-1.5 rounded-full border border-emerald-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </div>
          </header>

          {/* Mobile menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ opacity: 0, x: "-100%" }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-50 bg-[#07070A] p-6 pt-20 lg:hidden overflow-y-auto"
              >
                {NAV.map((group) => (
                  <div key={group.section} className="mb-8">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-3 px-2">{group.section}</p>
                    {group.items.map(({ href, label, icon: Icon, exact }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-2xl mb-1 text-sm font-bold uppercase tracking-wide transition-all",
                          isActive(href, exact) ? "bg-brand-gold text-black" : "text-white/40 hover:bg-white/5"
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

          <main className="p-6 lg:p-10">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  );
}
