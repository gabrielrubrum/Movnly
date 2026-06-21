"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function NovaReservaParceiroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    from: "Aeroporto de Lisboa (LIS)",
    to: "",
    pickupTime: "",
    category: "comfort",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    passengers: 1,
    flightNumber: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/partners/bookings", form);
      toast.success("Reserva criada com sucesso");
      router.push("/parceiros/reservas");
    } catch {
      toast.error("Erro ao criar reserva");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href="/parceiros/reservas" className="text-xs text-white/40 hover:text-white flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3 h-3" /> Reservas
        </Link>
        <h1 className="text-2xl font-black text-white">Nova reserva para convidado</h1>
        <p className="text-white/40 text-sm mt-1">Crie uma viagem para um hóspede ou cliente VIP</p>
      </div>

      <form onSubmit={handleSubmit} className="nx-card p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Origem</label>
            <input className="nx-input w-full" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value })} required />
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Destino</label>
            <input className="nx-input w-full" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} required />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Data e hora</label>
            <input type="datetime-local" className="nx-input w-full" value={form.pickupTime} onChange={(e) => setForm({ ...form, pickupTime: e.target.value })} required />
          </div>
          <div>
            <label className="text-xs text-white/40 uppercase tracking-wider mb-1.5 block">Categoria</label>
            <select className="nx-input w-full" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="smart">Smart</option>
              <option value="comfort">Comfort</option>
              <option value="group">Group</option>
              <option value="executive">Executive</option>
            </select>
          </div>
        </div>

        <div className="border-t border-white/5 pt-4">
          <h3 className="text-sm font-bold text-white mb-3">Dados do convidado</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input className="nx-input" placeholder="Nome do convidado" value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} required />
            <input className="nx-input" type="email" placeholder="Email" value={form.guestEmail} onChange={(e) => setForm({ ...form, guestEmail: e.target.value })} required />
            <input className="nx-input" placeholder="Telefone" value={form.guestPhone} onChange={(e) => setForm({ ...form, guestPhone: e.target.value })} />
            <input className="nx-input" placeholder="Nº voo (opcional)" value={form.flightNumber} onChange={(e) => setForm({ ...form, flightNumber: e.target.value })} />
          </div>
        </div>

        <textarea className="nx-input w-full min-h-[80px]" placeholder="Notas adicionais" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />

        <button type="submit" disabled={loading} className="nx-btn nx-btn-primary w-full">
          {loading ? "A criar..." : "Criar reserva"}
        </button>
      </form>
    </div>
  );
}
