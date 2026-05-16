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
import { useI18n } from "@/i18n/context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function LoginForm() {
  const [showPw, setShowPw] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const setAuth = useAuthStore((state) => state.setAuth);

  const redirect = searchParams.get("redirect") || "/dashboard";
  let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
  
  // Strip trailing /api if present as core auth routes are at root in this version
  if (apiUrl.endsWith('/api')) apiUrl = apiUrl.substring(0, apiUrl.length - 4);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    honeypot: "",
  });

  // [PRODUCTION_LAUNCH]: Capture OAuth Token from Redirect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = searchParams.get("token");
      const userStr = searchParams.get("user");
      if (token && userStr) {
        try {
          const user = JSON.parse(decodeURIComponent(userStr));
          setAuth(user, token);
          toast.success("Login efetuado via Google.");
          
          // Role-based redirection
          const roleRedirect = user.role === 'DRIVER' ? '/motorista'
            : (user.role === 'ADMIN' || user.role === 'MANAGER') ? '/admin'
            : redirect;
            
          router.push(roleRedirect);
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
      const endpoint = tab === "login" ? "/auth/login" : "/auth/register";
      const payload = tab === "login"
        ? { email: form.email, password: form.password, honeypot: form.honeypot, twoFactorCode: requires2FA ? twoFactorCode : undefined }
        : form;

      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Authentication failed");

      if (tab === "login") {
        if (data.requiresTwoFactor) {
          setRequires2FA(true);
          toast.info("Código de segurança necessário.");
          return;
        }
        setAuth(data.user, data.access_token);
        toast.success("Login efetuado com sucesso.");
        // Redirecionar baseado no role
        const roleRedirect = data.user?.role === 'DRIVER' ? '/motorista'
          : data.user?.role === 'ADMIN' || data.user?.role === 'MANAGER' ? '/admin'
          : redirect;
        router.push(roleRedirect);
      } else {
        setTab("login");
        setForm({ ...form, password: "" });
        setSuccess("Conta registada. Por favor, verifique o seu e-mail para confirmar a conta.");
        toast.success("Registo efetuado. Verifique o seu e-mail.");
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSocialAuth = async (provider: string) => {
    // [PRODUCTION_LAUNCH]: Standard OAuth Redirect to Real Backend
    window.location.href = `${apiUrl}/auth/${provider.toLowerCase()}`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-[440px] relative z-10"
    >
      {/* Upper Navigation */}
      {/* Branding HUD */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="lg:hidden group flex items-center">
          <img 
            src="/logoMov.png" 
            alt="Logo" 
            className="h-10 md:h-12 w-auto transition-all duration-700" 
          />
        </Link>
        
        <Link href="/" className="group flex items-center gap-3 text-[10px] font-bold text-white/20 hover:text-white uppercase tracking-[0.3em] transition-all">
          <span>Início</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="mb-8 space-y-3">
        <h2 className="text-5xl md:text-6xl font-bold mt-8 text-white tracking-tight leading-[1.1] mb-8">
          {tab === "login" ? (requires2FA ? "Segurança" : "Iniciar") : "Criar"}{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-gold via-brand-gold/90 to-white/50 drop-shadow-[0_0_30px_rgba(212,175,55,0.2)]">
            {tab === "login" ? (requires2FA ? "da Conta." : "Sessão.") : "Perfil."}
          </span>
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-brand-gold" />
            <div className="h-[1px] w-8 bg-gradient-to-r from-brand-gold/60 to-transparent" />
          </div>
          <p className="text-brand-gold/50 text-[9px] font-black uppercase tracking-[0.6em] leading-relaxed">
            {tab === "login"
              ? (requires2FA ? "Introduza o código de verificação" : "Área de Cliente MOVNLY")
              : "Preencha os dados para o registo"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-red-400 text-[9px] font-black uppercase tracking-[0.3em] text-center"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 bg-brand-gold/5 border border-brand-gold/10 rounded-xl text-brand-gold text-[9px] font-black uppercase tracking-[0.3em] text-center"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {!requires2FA ? (
            <>
              {tab === "register" && (
                <div className="space-y-3">
                  <label className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 ml-1">Nome Completo</label>
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-brand-gold transition-all duration-500" />
                    <input
                      type="text"
                      placeholder="Introduza o seu nome"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-[#0A0A0F] border border-white/[0.05] py-5 pl-14 pr-6 rounded-[20px] text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-brand-gold/30 focus:bg-brand-gold/[0.02] transition-all duration-700 shadow-2xl"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20 ml-1">Endereço de E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-brand-gold transition-all duration-500" />
                  <input
                    type="email"
                    placeholder="ex: nome@empresa.com"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#0A0A0F] border border-white/[0.05] py-5 pl-14 pr-6 rounded-[20px] text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-brand-gold/30 focus:bg-brand-gold/[0.02] transition-all duration-700 shadow-2xl"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20">Palavra-passe</label>
                  {tab === "login" && (
                    <Link href="/forgot-password" title="Recuperar senha" className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-gold/40 hover:text-brand-gold transition-all">
                      Esqueceu-se da senha?
                    </Link>
                  )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-brand-gold transition-all duration-500" />
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-[#0A0A0F] border border-white/[0.05] py-5 pl-14 pr-14 rounded-[20px] text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-brand-gold/30 focus:bg-brand-gold/[0.02] transition-all duration-700 shadow-2xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl text-white/10 hover:text-white transition-all hover:bg-white/5"
                  >
                    {showPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-8 text-center py-4"
            >
              <div className="w-20 h-20 rounded-3xl bg-brand-gold/5 border border-brand-gold/10 flex items-center justify-center mx-auto mb-6 relative">
                <ShieldCheck className="w-10 h-10 text-brand-gold" />
                <div className="absolute inset-0 bg-brand-gold/20 blur-2xl rounded-full opacity-30" />
              </div>
              <div className="space-y-4">
                <label className="text-[9px] font-black uppercase tracking-[0.6em] text-brand-gold mb-2 block">Código de Verificação</label>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="w-full bg-white/[0.01] border border-white/5 py-6 text-center text-3xl font-extralight tracking-[0.8em] text-brand-gold rounded-2xl focus:outline-none focus:border-brand-gold/40 focus:bg-brand-gold/5 transition-all shadow-2xl"
                />
              </div>
              <button
                onClick={() => setRequires2FA(false)}
                className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] hover:text-white transition-colors"
                type="button"
              >
                Tentar outro método
              </button>
            </motion.div>
          )}

          {/* Institutional Honeypot - Bot Neutralization Field */}
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
          className="w-full h-16 bg-gradient-to-r from-brand-gold to-[#B8860B] text-black text-[10px] font-black uppercase tracking-[0.8em] rounded-2xl hover:scale-[1.01] hover:brightness-110 transition-all shadow-[0_20px_50px_-15px_rgba(212,175,55,0.4)] group flex items-center justify-center gap-4 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out opacity-20" />
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <span className="relative z-10 flex items-center gap-4 ml-[0.8em]">
              {requires2FA ? "AUTENTICAR" : (tab === "login" ? "ENTRAR" : "CONFIRMAR")}
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-white/5 flex flex-col items-center gap-5">
        {!requires2FA && (
          <p className="text-[10px] text-white/20 uppercase tracking-widest">
            {tab === "login" ? "Ainda não tem conta?" : "Já possui conta?"}{" "}
            <button
              onClick={() => { setTab(tab === "login" ? "register" : "login"); setError(""); setSuccess(""); }}
              className="text-brand-gold hover:text-white transition-colors ml-2 font-bold"
              type="button"
            >
              {tab === "login" ? "Registar" : "Entrar"}
            </button>
          </p>
        )}

        <div className="flex items-center gap-4 p-2 bg-[#0A0A0F] border border-white/[0.05] rounded-[24px] backdrop-blur-sm shadow-2xl">
          <button 
            onClick={() => handleSocialAuth("Google")} 
            className="flex items-center gap-3 px-6 py-4 rounded-[16px] hover:bg-white transition-all duration-500 group/social" 
            type="button"
            title="Continuar com Google"
          >
            <svg className="w-4 h-4 fill-white group-hover/social:fill-black transition-colors" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 group-hover/social:text-black transition-colors">Google</span>
          </button>
          
          <div className="w-px h-6 bg-white/10" />

          <Link
            href="/driver/login" 
            className="flex items-center gap-3 px-6 py-4 rounded-[16px] hover:bg-brand-gold transition-all duration-500 group/driver"
          >
            <Fingerprint className="w-4 h-4 text-white/20 group-hover/driver:text-black transition-colors" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 group-hover/driver:text-black transition-colors">Motorista</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  return (
    <div
      className="font-sans bg-[#050507]"
      style={{ display: 'grid', gridTemplateColumns: '45% 55%', height: '100vh', overflow: 'hidden' }}
    >
      {/* ─── LEFT: Editorial Panel ─────────────────────────── */}
      <div className="hidden lg:block relative overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1563720360172-67b8f3dce741?auto=format&fit=crop&q=85&w=1400')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Gradient layers */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/40 to-[#050507]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#050507]" />

        {/* Logo — top left */}
        <div className="absolute top-10 left-10 z-10">
          <Link href="/" className="inline-flex items-center group">
            <img src="/logoMov.png" alt="MOVNLY" className="h-16 md:h-[70px] w-auto transition-transform duration-700 group-hover:scale-105" />
          </Link>
        </div>

        {/* Content — bottom left */}
        <div className="absolute bottom-10 left-10 right-10 z-10 space-y-5">
          <p className="text-white text-2xl font-light leading-snug">
            Transporte executivo <br />
            <span className="text-brand-gold font-semibold">em Lisboa.</span>
          </p>
          <div className="flex items-center gap-8 pt-5 border-t border-white/10">
            <div>
              <p className="text-white text-3xl font-black tracking-tighter">4.98</p>
              <p className="text-white/30 text-[8px] font-bold uppercase tracking-[0.5em] mt-1">Avaliação</p>
            </div>
            <div className="w-px h-8 bg-white/15" />
            <div>
              <p className="text-white text-3xl font-black tracking-tighter">24h</p>
              <p className="text-white/30 text-[8px] font-bold uppercase tracking-[0.5em] mt-1">Disponível</p>
            </div>
          </div>
          <p className="text-white/15 text-[8px] font-bold uppercase tracking-[0.3em]">
            © 2024 MOVNLY · <Link href="/privacidade" className="hover:text-white/40 transition-colors">Privacidade</Link> · <Link href="/termos" className="hover:text-white/40 transition-colors">Termos</Link>
          </p>
        </div>
      </div>

      {/* ─── RIGHT: Form Panel ─────────────────────────────── */}
      <div className="flex items-center justify-center overflow-y-auto py-8 px-8 md:px-16">
        <Suspense fallback={<Loader2 className="w-6 h-6 animate-spin text-brand-gold opacity-20" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
