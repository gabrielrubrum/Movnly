"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, DollarSign, Users, BarChart3, Settings, LogOut, Building2, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { cn } from "@/lib/utils";
import api from "@/lib/api";

const navItems = [
  { href: "/parceiros", label: "Dashboard", icon: LayoutDashboard },
  { href: "/parceiros/reservas", label: "Reservas", icon: Calendar },
  { href: "/parceiros/clientes", label: "Clientes", icon: Users },
  { href: "/parceiros/comissoes", label: "Comissões", icon: DollarSign },
  { href: "/parceiros/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/parceiros/configuracoes", label: "Configurações", icon: Settings },
];

export default function ParceirosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [org, setOrg] = useState("Parceiro MOVNLY");
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    api.get("/partners/profile").then(({ data }) => {
      setOrg(data.organization || "Parceiro MOVNLY");
    }).catch(() => {});
  }, []);

  return (
    <RoleGuard allowedRoles={["PARTNER", "ADMIN"]} redirectTo="/login">
      <div className="min-h-screen bg-surface-0 flex">
        <aside className="hidden lg:flex flex-col w-60 border-r border-white/06 bg-surface-1 fixed top-0 bottom-0 left-0 z-30">
          <div className="p-6 border-b border-white/06">
            <Link href="/">
              <img src="/logoMov.png" alt="MOVNLY" className="h-12 w-auto" />
            </Link>
          </div>

          <div className="p-4 border-b border-white/06">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/04">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{org}</p>
                <Badge>Parceiro</Badge>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-3 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.href !== "/parceiros" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
                    active ? "text-brand-gold bg-brand-gold/10" : "text-slate-400 hover:text-white hover:bg-white/06"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-white/06">
            <button onClick={logout} className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/08 transition-all text-sm">
              <LogOut className="w-4 h-4" />
              Terminar sessão
            </button>
          </div>
        </aside>

        <div className="flex-1 lg:ml-60">
          <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between p-4 border-b border-white/06 bg-surface-0/95 backdrop-blur-xl">
            <img src="/logoMov.png" alt="MOVNLY" className="h-8" />
            <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 text-white/60">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </header>

          {mobileOpen && (
            <nav className="lg:hidden fixed inset-x-0 top-14 z-30 bg-surface-1 border-b border-white/06 p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/06">
                    <Icon className="w-4 h-4" /> {item.label}
                  </Link>
                );
              })}
              <button onClick={logout} className="flex items-center gap-2 px-3 py-2.5 w-full text-sm text-red-400">
                <LogOut className="w-4 h-4" /> Sair ({user?.name})
              </button>
            </nav>
          )}

          <div className="p-5 lg:p-8">{children}</div>
        </div>
      </div>
    </RoleGuard>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-semibold uppercase tracking-wide bg-purple-500/15 text-purple-300 border border-purple-500/20">
      {children}
    </span>
  );
}
