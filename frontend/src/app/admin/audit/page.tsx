"use client";

import { useEffect, useState } from "react";
import { Shield, Search, Loader2, AlertTriangle, Zap, User } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

interface AuditLog {
  id: string;
  action: string;
  resource?: string;
  ipAddress?: string;
  createdAt: string;
  user?: { name: string; email: string };
}

export default function AuditPage() {
  const { token } = useAuthStore();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"}/audit?take=100`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setLogs(Array.isArray(d) ? d : d?.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = Array.isArray(logs) ? logs.filter(l =>
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.ipAddress?.includes(search)
  ) : [];

  const getSeverity = (action: string) => {
    if (action?.includes("FAILED") || action?.includes("ERROR") || action?.includes("HONEYPOT")) return "warn";
    if (action?.includes("SUCCESS") || action?.includes("REGISTER")) return "ok";
    return "info";
  };

  const total = logs.length;
  const warnings = logs.filter(l => getSeverity(l.action) === "warn").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Auditoria</h1>
          <p className="text-white/30 text-sm mt-1">{total} eventos registados</p>
        </div>
        {warnings > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/8 border border-amber-500/20 w-fit">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{warnings} alertas</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: total, color: "text-white" },
          { label: "Alertas", value: warnings, color: "text-amber-400" },
          { label: "Hoje", value: logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length, color: "text-brand-gold" },
        ].map(({ label, value, color }) => (
          <div key={label} className="px-4 py-3.5 rounded-2xl text-center" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <p className={cn("text-2xl font-light", color)}>{value}</p>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
        <input
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-gold/30 transition-colors"
          placeholder="Pesquisar evento, utilizador, IP..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="hidden lg:grid grid-cols-[140px_1fr_1fr_120px_80px] gap-4 px-6 py-3 text-[9px] font-black text-white/25 uppercase tracking-widest" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div>Timestamp</div>
          <div>Utilizador</div>
          <div>Ação</div>
          <div>IP</div>
          <div className="text-center">Nível</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 text-brand-gold animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Shield className="w-10 h-10 text-white/5" />
            <p className="text-white/20 text-sm italic">Sem eventos.</p>
          </div>
        ) : filtered.map((log, i) => {
          const sev = getSeverity(log.action);
          const dotColor = sev === "warn" ? "#F87171" : sev === "ok" ? "#34D399" : "#D4AF37";
          return (
            <div key={log.id}
              className="grid grid-cols-1 lg:grid-cols-[140px_1fr_1fr_120px_80px] items-center gap-4 px-6 py-3.5 hover:bg-white/[0.025] transition-all"
              style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
            >
              <div>
                <p className="text-[10px] font-mono text-white/50">{new Date(log.createdAt).toLocaleDateString("pt-PT")}</p>
                <p className="text-[9px] font-mono text-white/25">{new Date(log.createdAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  {log.user ? <User className="w-3 h-3 text-white/25" /> : <Shield className="w-3 h-3 text-white/25" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white/70 truncate">{log.user?.name || "Sistema"}</p>
                  <p className="text-[8px] text-white/25 truncate">{log.user?.email || "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0",
                  sev === "warn" ? "bg-red-500/10 text-red-400" : sev === "ok" ? "bg-emerald-500/10 text-emerald-400" : "bg-brand-gold/10 text-brand-gold"
                )}>
                  {sev === "warn" ? <AlertTriangle className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                </div>
                <p className="text-xs font-semibold text-white/65 truncate">{log.action?.replace(/_/g, " ")}</p>
              </div>
              <div>
                <span className="text-[9px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded-lg">{log.ipAddress || "—"}</span>
              </div>
              <div className="flex justify-center">
                <div className="w-2 h-2 rounded-full" style={{ background: dotColor, boxShadow: `0 0 6px ${dotColor}` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
