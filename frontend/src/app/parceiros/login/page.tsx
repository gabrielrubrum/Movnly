"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { toast } from "sonner";
import { Building2 } from "lucide-react";

export default function ParceiroLoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.user.role !== "PARTNER" && data.user.role !== "ADMIN") {
        toast.error("Esta conta não tem acesso ao painel de parceiros.");
        return;
      }
      setAuth(data.user, data.access_token);
      router.push("/parceiros");
    } catch {
      toast.error("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7 text-brand-gold" />
          </div>
          <h1 className="text-2xl font-black text-white">Portal de Parceiros</h1>
          <p className="text-white/40 text-sm mt-2">Hotéis, agências e empresas MOVNLY</p>
        </div>

        <form onSubmit={handleLogin} className="nx-card p-6 space-y-4">
          <input className="nx-input w-full" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="nx-input w-full" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading} className="nx-btn nx-btn-primary w-full">
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-white/30 mt-6">
          <Link href="/parceiros/hoteis" className="hover:text-white">Saber mais sobre parcerias</Link>
          {" · "}
          <Link href="/" className="hover:text-white">Voltar ao site</Link>
        </p>
      </div>
    </div>
  );
}
