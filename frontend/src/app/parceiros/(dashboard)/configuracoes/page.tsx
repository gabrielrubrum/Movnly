"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export default function ParceiroConfiguracoesPage() {
  const logout = useAuthStore((s) => s.logout);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    organization: "",
    type: "hotel",
    address: "",
    city: "Lisboa",
    contactPhone: "",
  });

  useEffect(() => {
    api.get("/partners/profile").then(({ data }) => {
      setForm({
        organization: data.organization || "",
        type: data.type || "hotel",
        address: data.address || "",
        city: data.city || "Lisboa",
        contactPhone: data.contactPhone || "",
      });
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/partners/profile", form);
      toast.success("Perfil atualizado");
    } catch {
      toast.error("Erro ao guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <Link href="/parceiros" className="text-xs text-white/40 hover:text-white flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3 h-3" /> Dashboard
        </Link>
        <h1 className="text-2xl font-black text-white">Configurações</h1>
        <p className="text-white/40 text-sm mt-1">Dados do seu estabelecimento parceiro</p>
      </div>

      <form onSubmit={handleSave} className="nx-card p-6 space-y-4">
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Organização</label>
          <input className="nx-input w-full" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Tipo</label>
          <select className="nx-input w-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="hotel">Hotel</option>
            <option value="agency">Agência</option>
            <option value="corporate">Empresa</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Morada</label>
          <input className="nx-input w-full" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Cidade</label>
          <input className="nx-input w-full" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Telefone de contacto</label>
          <input className="nx-input w-full" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
        </div>
        <button type="submit" disabled={loading} className="nx-btn nx-btn-primary w-full">
          {loading ? "A guardar..." : "Guardar alterações"}
        </button>
      </form>

      <button onClick={logout} className="nx-btn w-full text-red-400 border border-red-500/20 hover:bg-red-500/10">
        Terminar sessão
      </button>
    </div>
  );
}
