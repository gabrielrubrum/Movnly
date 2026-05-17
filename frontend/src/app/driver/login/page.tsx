"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import {
  Eye, EyeOff, Lock, Mail, ArrowLeft,
  Loader2, User, ShieldCheck, ChevronRight,
  Fingerprint, Sparkles
} from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function DriverLoginForm() {
  const [showPw, setShowPw] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  const redirect = searchParams.get("redirect") || "/motorista";
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
  if (apiUrl.endsWith('/api')) apiUrl = apiUrl.substring(0, apiUrl.length - 4);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    honeypot: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = searchParams.get("token");
      const userStr = searchParams.get("user");
      if (token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          setAuth(user, token);
          toast.success("ACESSO CONCEDIDO.");
          router.push(redirect);
        } catch (e) {
          console.error("Failed to parse social user", e);
        }
      }
    }
  }, [searchParams, setAuth, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = tab === "login" ? "/auth/login" : "/auth/register-driver";
      const payload = tab === "login"
        ? { email: form.email, password: form.password, honeypot: form.honeypot, twoFactorCode: requires2FA ? twoFactorCode : undefined }
        : form;

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "AUTHENTICATION FAILED");

      if (tab === "login") {
        if (data.user?.role !== "DRIVER" && data.user?.role !== "ADMIN") {
          throw new Error("ESTA CONTA NÃO É DE MOTORISTA.");
        }
        if (data.requiresTwoFactor) {
          setRequires2FA(true);
          toast.info("SEGURANÇA ADICIONAL NECESSÁRIA.");
          return;
        }
        setAuth(data.user, data.access_token);
        toast.success("ACESSO CONCEDIDO.");
        router.push(redirect);
      } else {
        setTab("login");
        setForm({ ...form, password: "" });
        setSuccess("CADASTRO RECEBIDO. APROVAÇÃO PENDENTE.");
        toast.success("REGISTO CONCLUÍDO.");
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("já está em uso") || msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("in use")) {
        setError("CREDENCIAL JÁ CONSTA NO NOSSO HUB DE PARCEIROS. INICIE SESSÃO PARA ACEDER.");
        toast.info("Identificámos que este e-mail já pertence à nossa rede de parceiros operacionais. Por favor, efetue a sua autenticação.");
        setTab("login");
      } else if (msg.toLowerCase().includes("invalid credentials") || msg.toLowerCase().includes("credenciais")) {
        setError("CREDENCIAS INVÁLIDAS. VERIFIQUE O ACESSO.");
        toast.error("Não foi possível autenticar o parceiro. Verifique os dados inseridos.");
      } else {
        setError(msg.toUpperCase());
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    window.location.href = `${apiUrl}/auth/${provider.toLowerCase()}?role=DRIVER`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[420px] relative z-10"
    >
      {/* Branding HUD */}
      <div className="flex items-center justify-between mb-16">
        <Link href="/" className="lg:hidden">
          <img src="/logoMov.png" alt="Logo" className="h-8 w-auto" />
        </Link>
        <Link href="/" className="group flex items-center gap-3 text-[9px] font-medium text-white/40 hover:text-white uppercase tracking-[0.3em] transition-all">
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Voltar ao Início</span>
        </Link>
      </div>

      <div className="mb-12 space-y-4">
        <h2 className="text-4xl md:text-5xl font-light text-white tracking-tight leading-[1.1] uppercase font-sans">
          {tab === "login" ? (requires2FA ? "Segurança" : "Portal do") : "Novo"}<br />
          <span className="text-brand-gold font-medium">
            {tab === "login" ? (requires2FA ? "Adicional." : "Motorista.") : "Motorista."}
          </span>
        </h2>
        <div className="flex items-center gap-4">
          <div className="w-8 h-[1px] bg-brand-gold/40" />
          <p className="text-white/40 text-[9px] font-medium uppercase tracking-[0.4em] leading-none">
            {tab === "login"
              ? (requires2FA ? "Verificação necessária" : "Acesso Restrito")
              : "Registo de Parceiro"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-red-500 text-[9px] font-medium uppercase tracking-[0.2em] text-center"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-brand-gold/5 border border-brand-gold/20 rounded-xl text-brand-gold text-[9px] font-medium uppercase tracking-[0.2em] text-center"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-8">
          {!requires2FA ? (
            <div className="space-y-6">
              {tab === "register" && (
                <div className="space-y-2 group">
                  <label className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/30 group-focus-within:text-brand-gold transition-colors ml-1">Nome Completo</label>
                  <div className="relative">
                    <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-brand-gold transition-all duration-500" />
                    <input
                      type="text"
                      placeholder="O SEU NOME"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-transparent border-b border-white/10 py-3 pl-8 pr-0 text-white text-xs font-medium uppercase tracking-[0.1em] placeholder:text-white/10 focus:outline-none focus:border-brand-gold transition-all duration-500"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 group">
                <label className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/30 group-focus-within:text-brand-gold transition-colors ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-brand-gold transition-all duration-500" />
                  <input
                    type="email"
                    placeholder="MOTORISTA@EXEMPLO.COM"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-transparent border-b border-white/10 py-3 pl-8 pr-0 text-white text-xs font-medium uppercase tracking-[0.1em] placeholder:text-white/10 focus:outline-none focus:border-brand-gold transition-all duration-500"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[9px] font-medium uppercase tracking-[0.3em] text-white/30 group-focus-within:text-brand-gold transition-colors">Senha</label>
                  {tab === "login" && (
                    <Link href="/driver/forgot-password" title="Recuperar senha" className="text-[9px] font-medium uppercase tracking-[0.1em] text-brand-gold/50 hover:text-brand-gold transition-all">
                      Recuperar
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-brand-gold transition-all duration-500" />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-transparent border-b border-white/10 py-3 pl-8 pr-10 text-white text-xs font-medium tracking-[0.2em] placeholder:text-white/10 focus:outline-none focus:border-brand-gold transition-all duration-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-white/10 hover:text-brand-gold transition-all"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-8 py-8"
            >
              <div className="w-20 h-20 rounded-full bg-brand-gold/5 border border-brand-gold/10 flex items-center justify-center mx-auto relative group">
                <ShieldCheck className="w-8 h-8 text-brand-gold animate-pulse" />
                <div className="absolute inset-0 bg-brand-gold/20 blur-[30px] rounded-full opacity-20" />
              </div>
              <div className="space-y-4">
                <label className="text-[9px] font-medium uppercase tracking-[0.4em] text-brand-gold block">Código de Segurança</label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="w-full bg-transparent border-b border-white/10 py-4 text-center text-4xl font-medium tracking-[0.5em] text-white focus:outline-none focus:border-brand-gold transition-all"
                />
              </div>
              <button
                onClick={() => setRequires2FA(false)}
                className="text-[9px] font-medium text-white/30 uppercase tracking-[0.3em] hover:text-brand-gold transition-colors"
                type="button"
              >
                Cancelar
              </button>
            </motion.div>
          )}

          <div className="hidden">
            <input
              type="text"
              name="website"
              value={form.honeypot || ""}
              onChange={(e) => setForm({ ...form, honeypot: e.target.value })}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 bg-brand-gold text-black text-[10px] font-bold uppercase tracking-[0.4em] rounded-full hover:shadow-[0_20px_50px_-10px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-all duration-500 group relative overflow-hidden mt-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-[1000ms] ease-in-out z-0" />
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
          ) : (
             <span className="relative z-10 flex items-center justify-center gap-3">
              {requires2FA ? "Verificar" : (tab === "login" ? "Entrar" : "Candidatar-se")}
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </button>
      </form>

      <div className="mt-10 flex flex-col items-center gap-6">
        {!requires2FA && (
          <p className="text-[9px] text-white/30 uppercase tracking-[0.3em]">
            {tab === "login" ? "Quero ser parceiro" : "Já sou parceiro"}{" "}
            <button
              onClick={() => { setTab(tab === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
              className="text-brand-gold hover:text-white transition-colors ml-2 font-medium"
              type="button"
            >
              {tab === "login" ? "Criar Cadastro" : "Fazer Login"}
            </button>
          </p>
        )}

        <div className="flex w-full gap-4 pt-4 border-t border-white/5">
          <button 
            onClick={() => handleSocialAuth("Google")} 
            className="flex-1 flex items-center justify-center gap-3 h-12 rounded-full bg-white text-black hover:scale-[1.02] transition-all duration-300 shadow-lg" 
            type="button"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Google</span>
          </button>
          
          <Link
            href="/login" 
            className="flex-1 flex items-center justify-center gap-3 h-12 rounded-full border border-white/10 text-white/60 hover:bg-white hover:text-black hover:border-transparent transition-all duration-300"
          >
            <User className="w-4 h-4 text-brand-gold transition-colors" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Cliente</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function DriverLoginPage() {
  return (
    <div className="min-h-screen bg-[#020203] flex flex-col lg:flex-row overflow-hidden font-sans">
      {/* Editorial Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative items-end p-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-out scale-110 hover:scale-100"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=85&w=1400')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020203] via-[#020203]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020203]/30 via-transparent to-[#020203]/90" />
        
        {/* Cinematic Gold Glows / Light Leaks */}
        <div className="absolute top-[-15%] right-[-10%] w-[600px] h-[600px] bg-brand-gold/10 rounded-full blur-[140px] mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[10%] left-[-20%] w-[700px] h-[700px] bg-brand-gold/5 rounded-full blur-[160px] mix-blend-screen pointer-events-none animate-pulse" />
        
        <div className="absolute top-20 left-20 z-20">
          <Link href="/" className="inline-block hover:scale-105 transition-transform duration-700">
            <img src="/logoMov.png" alt="MOVNLY" className="h-20 w-auto" />
          </Link>
        </div>

        <div className="relative z-20 space-y-10 max-w-sm">
          <div className="h-px w-20 bg-brand-gold/60" />
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none uppercase">
            Parceiros de <br />
            <span className="text-brand-gold">Excelência.</span>
          </h1>
          <div className="flex items-center gap-12 pt-10 border-t border-white/5">
            <div>
              <p className="text-4xl font-black text-white tracking-tighter">4.9</p>
              <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Satisfação</p>
            </div>
            <div>
              <p className="text-4xl font-black text-white tracking-tighter">100%</p>
              <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Monitorizado</p>
            </div>
          </div>
          <p className="text-white/10 text-[9px] font-black uppercase tracking-[0.5em]">
            © 2024 MOVNLY · Operações Executivas
          </p>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex items-center justify-center relative bg-[#020203] lg:bg-transparent overflow-hidden">
        {/* Animated Background Glows */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/[0.04] rounded-full blur-[130px] pointer-events-none -translate-y-1/2 translate-x-1/3" 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-gold/[0.03] rounded-full blur-[150px] pointer-events-none translate-y-1/3 -translate-x-1/3" 
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-gold/[0.02] rounded-full blur-[120px] pointer-events-none" />
        
        <div className="w-full max-h-screen overflow-y-auto scrollbar-hide py-20 px-8 flex justify-center relative z-10">
          <Suspense fallback={<Loader2 className="w-10 h-10 animate-spin text-brand-gold/20" />}>
            <DriverLoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
