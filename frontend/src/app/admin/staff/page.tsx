"use client";

import { useEffect, useState } from "react";
import { Search, Shield, Mail, Calendar, Loader2, Users, Plus, X } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const ROLES: Record<string, { label: string; color: string }> = {
  ADMIN: { label: "Admin", color: "bg-brand-gold text-black" },
  MANAGER: { label: "Gestor", color: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
  ACCOUNTANT: { label: "Financeiro", color: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" },
  OPERATOR: { label: "Operador", color: "bg-white/10 text-white/50 border border-white/15" },
};

export default function StaffPage() {
  const { token } = useAuthStore();
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "OPERATOR" });
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStaff(await res.json());
    } catch { setStaff([]); }
    finally { setLoading(false); }
  };

  const createStaff = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Preenche todos os campos obrigatórios.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/admin/staff/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao criar membro.");
      }
      toast.success("Membro da equipa criado com sucesso.");
      setShowForm(false);
      setForm({ name: "", email: "", password: "", role: "OPERATOR" });
      fetchStaff();
    } catch (e: any) {
      toast.error(e.message || "Erro ao criar membro.");
    } finally {
      setCreating(false);
    }
  };

  const updateRole = async (userId: string, role: string) => {
    await fetch(`${API_URL}/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ role })
    });
    fetchStaff();
  };

  useEffect(() => { if (token) fetchStaff(); }, [token]);

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Equipa</h1>
          <p className="text-white/30 text-sm mt-1">{staff.length} membros da equipa</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gold text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Novo Membro
        </button>
      </div>

      {/* Modal criar membro */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-2xl p-6 space-y-4" style={{ background: "#0A0A0F", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Novo Membro da Equipa</h3>
              <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Nome completo *", key: "name", placeholder: "João Silva" },
                { label: "Email *", key: "email", placeholder: "joao@nexrice.com", type: "email" },
                { label: "Password *", key: "password", placeholder: "Mínimo 8 caracteres", type: "password" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">{label}</label>
                  <input
                    type={type || "text"}
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-colors"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  />
                </div>
              ))}
              <div>
                <label className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-1">Cargo *</label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-colors"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  {Object.entries(ROLES).filter(([r]) => r !== "ADMIN").map(([r, cfg]) => (
                    <option key={r} value={r} className="bg-[#0A0A0F]">{cfg.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                Cancelar
              </button>
              <button onClick={createStaff} disabled={creating}
                className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-black disabled:opacity-50 transition-all"
                style={{ background: "#D4AF37" }}>
                {creating ? "A criar..." : "Criar Membro"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(ROLES).map(([role, cfg]) => {
          const count = staff.filter(s => s.role === role).length;
          return (
            <div key={role} className="px-4 py-3.5 rounded-2xl" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-md", cfg.color)}>{cfg.label}</span>
                <span className="text-lg font-light text-white">{count}</span>
              </div>
              <p className="text-[9px] text-white/25">membros</p>
            </div>
          );
        })}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none" />
        <input
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand-gold/30 transition-colors"
          placeholder="Pesquisar membro..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="hidden lg:grid grid-cols-[1fr_1.5fr_140px_120px] gap-4 px-6 py-3 text-[9px] font-black text-white/25 uppercase tracking-widest" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div>Membro</div>
          <div>Email</div>
          <div>Cargo</div>
          <div>Desde</div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-7 h-7 text-brand-gold animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <Users className="w-10 h-10 text-white/5" />
            <p className="text-white/20 text-sm italic">Sem membros.</p>
          </div>
        ) : filtered.map((m, i) => (
          <div key={m.id}
            className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr_140px_120px] items-center gap-4 px-6 py-4 hover:bg-white/[0.025] transition-all"
            style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-brand-gold font-black text-sm flex-shrink-0"
                style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.15)" }}>
                {m.name?.[0]?.toUpperCase()}
              </div>
              <p className="text-sm font-semibold text-white/85">{m.name}</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/45">
              <Mail className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
              <span className="truncate">{m.email}</span>
            </div>
            <div>
              <select
                value={m.role}
                onChange={e => updateRole(m.id, e.target.value)}
                className={cn("text-[9px] font-black uppercase px-2.5 py-1.5 rounded-xl outline-none cursor-pointer transition-all", ROLES[m.role]?.color || "bg-white/5 text-white/30")}
              >
                {Object.entries(ROLES).map(([r, cfg]) => (
                  <option key={r} value={r} className="bg-[#0A0A0F] text-white">{cfg.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-white/30">
              <Calendar className="w-3 h-3" />
              {new Date(m.createdAt).toLocaleDateString("pt-PT")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
