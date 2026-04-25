import Link from "next/link";
import { LayoutDashboard, Calendar, DollarSign, Users, BarChart3, Settings, LogOut, Building2 } from "lucide-react";

const navItems = [
  { href: "/parceiros", label: "Dashboard", icon: LayoutDashboard },
  { href: "/parceiros/reservas", label: "Reservas", icon: Calendar },
  { href: "/parceiros/clientes", label: "Clientes", icon: Users },
  { href: "/parceiros/comissoes", label: "Comissões", icon: DollarSign },
  { href: "/parceiros/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/parceiros/configuracoes", label: "Configurações", icon: Settings },
];

export default function ParceirosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-obsidian-950 flex">
      <aside className="hidden lg:flex flex-col w-60 border-r border-white/06 bg-obsidian-900/60 fixed top-0 bottom-0 left-0 z-30">
        <div className="p-5 border-b border-white/06">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
              <span className="text-white font-black text-xs">NX</span>
            </div>
            <div>
              <span className="text-white font-black text-base tracking-[-0.04em]">NEX<span className="text-gradient-gold">RIDE</span></span>
              <p className="text-[0.6rem] text-slate-600 uppercase tracking-widest">Parceiro</p>
            </div>
          </Link>
        </div>

        <div className="p-4 border-b border-white/06">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/04">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Hotel Bairro Alto</p>
              <Badge variant="purple" size="sm">Hotel</Badge>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/06 transition-all text-sm font-medium">
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/06">
          <button className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/08 transition-all text-sm">
            <LogOut className="w-4 h-4" />
            Terminar sessão
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-60">
        <div className="p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}

// Inline Badge for this file
function Badge({ variant, size, children }: { variant: string; size?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-semibold uppercase tracking-wide bg-purple-500/15 text-purple-300 border border-purple-500/20`}>
      {children}
    </span>
  );
}
