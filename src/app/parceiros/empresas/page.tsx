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

      <Footer />
    </div>
  );
}
