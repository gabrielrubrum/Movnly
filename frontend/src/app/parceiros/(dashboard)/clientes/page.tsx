"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowLeft, Users } from "lucide-react";

interface PartnerClient {
  name: string;
  email: string;
  phone?: string;
  totalBookings: number;
  totalSpent: number;
  lastBooking: string;
}

export default function ParceiroClientesPage() {
  const [clients, setClients] = useState<PartnerClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/partners/clients")
      .then(({ data }) => setClients(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/parceiros" className="text-xs text-white/40 hover:text-white flex items-center gap-1 mb-2">
          <ArrowLeft className="w-3 h-3" /> Dashboard
        </Link>
        <h1 className="text-2xl font-black text-white">Clientes</h1>
        <p className="text-white/40 text-sm mt-1">Convidados que utilizaram o serviço através do seu parceiro</p>
      </div>

      {loading ? (
        <p className="text-white/40 text-sm">A carregar clientes...</p>
      ) : clients.length === 0 ? (
        <div className="nx-card p-12 text-center">
          <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">Ainda não há clientes registados.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {clients.map((c) => (
            <div key={c.email} className="nx-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-white">{c.name}</p>
                  <p className="text-xs text-white/40">{c.email}</p>
                  {c.phone && <p className="text-xs text-white/30 mt-0.5">{c.phone}</p>}
                </div>
                <span className="nx-badge nx-badge-purple">{c.totalBookings} viagens</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Total gasto</span>
                <span className="font-semibold text-white">{formatCurrency(c.totalSpent)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-white/40">Última viagem</span>
                <span className="text-white/60">{formatDate(c.lastBooking)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
