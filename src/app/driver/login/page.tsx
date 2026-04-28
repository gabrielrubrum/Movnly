"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, Loader2, Car } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useI18n } from "@/i18n/context";

function DriverLoginContent() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const router = useRouter();
  const { t } = useI18n();
  const dp = (k: string) => t(`driver_portal.login.${k}`) as string;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Credenciais inválidas.");
      if (data.user?.role !== "DRIVER" && data.user?.role !== "ADMIN") {
        throw new Error("Esta conta não é de motorista.");
      }
      setAuth(data.user, data.access_token);
      toast.success(`Bem-vindo, ${data.user.name?.split(" ")[0]}`);
      router.push("/motorista");
    } catch (err: any) {
      toast.error(err.message || "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-[#07070A] flex flex-col lg:flex-row">

      {/* Left — branding */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] p-14 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0E0B05 0%, #07070A 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-gold/8 blur-[140px] rounded-full -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-gold/4 blur-[100px] rounded-full translate-y-1/3 -translate-x-1/3" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <img src="/logo-mark2.svg" alt="NexRice" className="w-9 h-9" />
            <span className="text-white font-black text-base tracking-[0.25em] uppercase">NEXRICE</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/20">
            <Car className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-[10px] font-black text-brand-gold uppercase tracking-widest">{dp("badge")}</span>
          </div>
          <div>
            <h1 className="text-5xl font-bold text-white tracking-tight leading-tight mb-4">
              {dp("tagline1")}
              <span className="block text-brand-gold">{dp("tagline2")}</span>
            </h1>
            <p className="text-white/40 text-base leading-relaxed max-w-xs">
              Gerencie viagens, acompanhe ganhos e receba notificações em tempo real.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { v: "24/7", l: dp("stat1") },
              { v: "20d", l: dp("stat2") },
              { v: "100%", l: dp("stat3") },
            ].map((s) => (
              <div key={s.l} className="rounded-2xl p-4 text-center"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-lg font-bold text-brand-gold">{s.v}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] text-white/20">nexrice.com &copy; {new Date().getFullYear()}</p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="flex items-center justify-between mb-10 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-mark2.svg" alt="NexRice" className="w-8 h-8" />
              <span className="text-white font-black text-sm tracking-[0.2em] uppercase">NEXRICE</span>
            </Link>
            <Link href="/" className="flex items-center gap-1.5 text-white/30 hover:text-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Voltar</span>
            </Link>
          </div>

          {/* Desktop back */}
          <Link href="/" className="hidden lg:flex items-center gap-2 text-white/30 hover:text-white transition-colors mb-10 w-fit">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Voltar</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-1.5">{dp("title")}</h2>
            <p className="text-white/35 text-sm">{dp("subtitle")}</p>
          </div>

          {/* Google button — premium */}
          <button onClick={handleGoogle}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl font-semibold text-sm text-white/70 hover:text-white transition-all mb-5 group"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}>
            <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <span>{dp("google")}</span>
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span className="text-[10px] text-white/20 uppercase tracking-widest">{dp("or")}</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-white/35 uppercase tracking-widest block mb-1.5">{dp("email")}</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="motorista@nexrice.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all placeholder-white/15"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                onFocus={e => e.target.style.borderColor = "rgba(212,175,55,0.4)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-white/35 uppercase tracking-widest block mb-1.5">{dp("password")}</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none transition-all placeholder-white/15 pr-12"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onFocus={e => e.target.style.borderColor = "rgba(212,175,55,0.4)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-[11px] text-white/25 hover:text-brand-gold transition-colors">
                {dp("forgot")}
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest text-black transition-all hover:bg-white disabled:opacity-50"
              style={{ background: "#D4AF37" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : dp("submit")}
            </button>
          </form>

          <p className="text-center text-[11px] text-white/20 mt-8">
            {dp("noAccount")}{" "}
            <Link href="/login" className="text-brand-gold hover:underline">
              {dp("register")}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function DriverLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07070A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-gold animate-spin" />
      </div>
    }>
      <DriverLoginContent />
    </Suspense>
  );
}
