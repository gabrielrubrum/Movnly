"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Briefcase, BarChart3, Globe, Zap, Phone, Building2, CheckCircle2, ArrowRight, Clock, Shield, Users, X, Send } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

const BENEFITS = [
  {
    icon: BarChart3,
    title: "Faturação Centralizada",
    desc: "Uma única fatura mensal para todas as viagens da empresa. Relatórios detalhados por departamento, colaborador ou projeto.",
  },
  {
    icon: Zap,
    title: "Reserva em 60 Segundos",
    desc: "Portal dedicado para gestores. Reserva imediata ou agendada, com confirmação instantânea e PIN de segurança.",
  },
  {
    icon: Globe,
    title: "Cobertura Nacional",
    desc: "Aeroportos, hotéis, reuniões e eventos em todo o território português. Frota executiva sempre disponível.",
  },
  {
    icon: Shield,
    title: "Motoristas Verificados",
    desc: "Todos os motoristas têm alvará TVDE, seguro profissional e formação em protocolo executivo.",
  },
  {
    icon: Clock,
    title: "Disponível 24/7",
    desc: "Serviço disponível a qualquer hora, incluindo fins de semana e feriados. Suporte dedicado para empresas.",
  },
  {
    icon: Users,
    title: "Gestão de Equipa",
    desc: "Adicione colaboradores, defina limites de despesa e aprove viagens diretamente no painel de gestão.",
  },
];

const STATS = [
  { value: "< 2min", label: "Tempo de resposta" },
  { value: "100%", label: "Motoristas certificados" },
  { value: "24/7", label: "Suporte dedicado" },
  { value: "0€", label: "Taxa de adesão" },
];

export default function EmpresasPage() {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nome: "", empresa: "", email: "", telefone: "", mensagem: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002"}/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: `PROPOSTA EMPRESA\nNome: ${form.nome}\nEmpresa: ${form.empresa}\nEmail: ${form.email}\nTelefone: ${form.telefone}\nMensagem: ${form.mensagem}`
        }),
      });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setSending(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#07070A] text-white">
      <Navbar />

      <main className="overflow-hidden">

        {/* Hero */}
        <section className="relative pt-40 pb-24 overflow-hidden">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-brand-gold/6 blur-[140px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-gold/4 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] font-black uppercase tracking-[0.4em] mb-8">
                  <Building2 className="w-3.5 h-3.5" /> Soluções para Empresas
                </div>

                <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
                  Transporte executivo
                  <span className="block text-brand-gold">para a sua empresa</span>
                </h1>

                <p className="text-lg text-white/45 mb-10 max-w-lg leading-relaxed">
                  Frota premium, motoristas profissionais e faturação simplificada. Tudo o que a sua empresa precisa para gerir deslocações executivas.
                </p>

                <div className="flex flex-wrap gap-4">
                  <button onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest text-black transition-all hover:scale-105 hover:bg-white"
                    style={{ background: "#D4AF37" }}>
                    Solicitar Proposta <ArrowRight className="w-4 h-4" />
                  </button>
                  <a href="tel:+351210000000"
                    className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest text-white/50 hover:text-white transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <Phone className="w-4 h-4" /> +351 21 000 0000
                  </a>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}
                className="grid grid-cols-2 gap-4">
                {STATS.map((s, i) => (
                  <div key={i} className="rounded-2xl p-6 text-center"
                    style={{ background: i === 0 ? "linear-gradient(135deg, #110E05, #0A0A0F)" : "rgba(255,255,255,0.025)", border: i === 0 ? "1px solid rgba(212,175,55,0.2)" : "1px solid rgba(255,255,255,0.06)" }}>
                    <p className={`text-3xl font-bold mb-1 ${i === 0 ? "text-brand-gold" : "text-white"}`}>{s.value}</p>
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="mb-16">
            <span className="text-[9px] font-black text-brand-gold/50 uppercase tracking-[0.4em] block mb-3">O que incluímos</span>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Tudo o que a sua empresa precisa
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BENEFITS.map((b, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-6 transition-all hover:border-white/10 group"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-11 h-11 rounded-xl bg-brand-gold/10 border border-brand-gold/15 flex items-center justify-center mb-5 group-hover:bg-brand-gold/15 transition-all">
                  <b.icon className="w-5 h-5 text-brand-gold" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{b.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Como funciona */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="rounded-3xl p-10 md:p-16 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #0D0B06 0%, #0A0A0F 60%, #060A0D 100%)", border: "1px solid rgba(212,175,55,0.15)" }}>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-gold/8 blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-[9px] font-black text-brand-gold/50 uppercase tracking-[0.4em] block mb-4">Como funciona</span>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">
                  Simples de implementar,
                  <span className="block text-brand-gold">fácil de gerir</span>
                </h2>
                <div className="space-y-4">
                  {[
                    "Criamos a conta da sua empresa em 24 horas",
                    "Adicionamos os colaboradores autorizados",
                    "Reservas imediatas via portal ou app",
                    "Fatura mensal consolidada com relatório",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-brand-gold flex-shrink-0" />
                      <span className="text-sm text-white/60">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-sm font-bold text-white mb-1">Pronto para começar?</p>
                  <p className="text-xs text-white/40 mb-5">Fale connosco e receba uma proposta personalizada para a sua empresa.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowModal(true)}
                      className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-black text-center transition-all hover:bg-white"
                      style={{ background: "#D4AF37" }}>
                      Solicitar Proposta
                    </button>
                    <a href="tel:+351210000000"
                      className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white text-center transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      Ligar Agora
                    </a>
                  </div>
                </div>
                <p className="text-[10px] text-white/25 text-center">Sem compromisso. Resposta em menos de 2 horas.</p>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Modal — Solicitar Proposta */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25 }}
            className="w-full max-w-lg rounded-3xl p-8 relative"
            style={{ background: "#0D0B06", border: "1px solid rgba(212,175,55,0.2)" }}>
            <button onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-white/25 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>

            {sent ? (
              <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-brand-gold mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Proposta enviada</h3>
                <p className="text-sm text-white/40">Vamos entrar em contacto em menos de 2 horas.</p>
                <button onClick={() => { setShowModal(false); setSent(false); setForm({ nome: "", empresa: "", email: "", telefone: "", mensagem: "" }); }}
                  className="mt-6 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-black"
                  style={{ background: "#D4AF37" }}>
                  Fechar
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <span className="text-[9px] font-black text-brand-gold/50 uppercase tracking-[0.4em] block mb-2">Empresas</span>
                  <h3 className="text-2xl font-bold text-white">Solicitar Proposta</h3>
                  <p className="text-sm text-white/35 mt-1">Preencha os dados e recebe uma proposta personalizada.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1.5">Nome</label>
                      <input required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                        placeholder="João Silva"
                        className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none placeholder-white/15"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1.5">Empresa</label>
                      <input required value={form.empresa} onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))}
                        placeholder="Empresa Lda."
                        className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none placeholder-white/15"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1.5">Email</label>
                    <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="joao@empresa.pt"
                      className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none placeholder-white/15"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1.5">Telefone</label>
                    <input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                      placeholder="+351 9XX XXX XXX"
                      className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none placeholder-white/15"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-white/30 uppercase tracking-widest block mb-1.5">Mensagem (opcional)</label>
                    <textarea rows={3} value={form.mensagem} onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))}
                      placeholder="Descreva as necessidades da sua empresa..."
                      className="w-full px-4 py-3 rounded-xl text-sm text-white outline-none placeholder-white/15 resize-none"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }} />
                  </div>
                  <button type="submit" disabled={sending}
                    className="w-full py-3.5 rounded-xl font-bold text-[11px] uppercase tracking-widest text-black transition-all hover:bg-white disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: "#D4AF37" }}>
                    {sending ? <span className="animate-pulse">A enviar...</span> : <><Send className="w-4 h-4" /> Enviar Proposta</>}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
