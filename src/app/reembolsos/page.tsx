"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, XCircle, Clock, AlertTriangle, CreditCard, Phone } from "lucide-react";
import Link from "next/link";

const RULES = [
  {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    title: "Cancelamento gratuito",
    subtitle: "Mais de 24 horas antes",
    desc: "Reembolso total do valor pago. O montante é devolvido ao método de pagamento original em 5 a 10 dias úteis.",
  },
  {
    icon: Clock,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "Reembolso parcial",
    subtitle: "Entre 2 e 24 horas antes",
    desc: "Reembolso de 50% do valor da reserva. A outra metade cobre os custos de disponibilidade do motorista.",
  },
  {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    title: "Sem reembolso",
    subtitle: "Menos de 2 horas ou não comparência",
    desc: "O valor total é retido. O motorista já se encontra a caminho ou no local de pickup.",
  },
  {
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    title: "Falha do motorista",
    subtitle: "Motorista não compareceu",
    desc: "Reembolso total e imediato. Adicionalmente, oferecemos um voucher de desconto na próxima reserva.",
  },
];

const PROCESS = [
  { step: "01", title: "Cancela a reserva", desc: "No painel da sua conta ou por email para suporte@nexrice.com" },
  { step: "02", title: "Confirmação", desc: "Recebe email de confirmação do cancelamento em até 1 hora" },
  { step: "03", title: "Processamento", desc: "O reembolso é iniciado automaticamente pelo nosso sistema" },
  { step: "04", title: "Devolução", desc: "O valor aparece na sua conta em 5 a 10 dias úteis (depende do banco)" },
];

export default function ReembolsosPage() {
  return (
    <main className="min-h-screen bg-[#07070A] pt-40 pb-32 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-gold/5 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>

          <Link href="/" className="flex items-center gap-3 text-white/40 hover:text-brand-gold transition-all group w-fit mb-16">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand-gold/40">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Voltar</span>
          </Link>

          <div className="mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] font-black uppercase tracking-[0.4em] mb-6">
              Política de Reembolso
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
              Cancelamentos
              <span className="block text-brand-gold">e Reembolsos</span>
            </h1>
            <p className="text-white/40 text-base max-w-xl leading-relaxed">
              Última atualização: 27 de Abril de 2026
            </p>
          </div>

          {/* Regras */}
          <div className="grid md:grid-cols-2 gap-4 mb-16">
            {RULES.map((r, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`p-6 rounded-2xl border ${r.bg}`}>
                <div className="flex items-start gap-4">
                  <r.icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${r.color}`} />
                  <div>
                    <p className="text-white font-bold text-base">{r.title}</p>
                    <p className={`text-[11px] font-black uppercase tracking-widest mb-3 ${r.color}`}>{r.subtitle}</p>
                    <p className="text-white/50 text-sm leading-relaxed">{r.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Processo */}
          <div className="rounded-2xl p-8 mb-12" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <h2 className="text-xl font-bold text-white mb-8">Como funciona o processo</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {PROCESS.map((p, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <span className="text-3xl font-black text-brand-gold/30">{p.step}</span>
                  <p className="text-sm font-bold text-white">{p.title}</p>
                  <p className="text-[11px] text-white/40 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Casos especiais */}
          <div className="rounded-2xl p-6 mb-12" style={{ background: "rgba(212,175,55,0.04)", border: "1px solid rgba(212,175,55,0.12)" }}>
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-5 h-5 text-brand-gold flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-bold mb-2">Casos especiais</p>
                <ul className="space-y-2 text-sm text-white/50">
                  <li>Atrasos de voo documentados — o motorista aguarda sem custo adicional até 60 minutos</li>
                  <li>Condições meteorológicas extremas — reembolso total ou reagendamento gratuito</li>
                  <li>Problemas médicos com documentação — reembolso total independente do prazo</li>
                  <li>Erros de reserva da nossa parte — reembolso total e imediato</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="mailto:suporte@nexrice.com"
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-brand-gold text-black font-bold text-sm hover:bg-white transition-all">
              <CreditCard className="w-4 h-4" />
              suporte@nexrice.com
            </a>
            <div className="flex items-center gap-3 px-6 py-4 rounded-2xl text-white/40 text-sm"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Phone className="w-4 h-4" />
              Resposta em até 24 horas
            </div>
          </div>

        </motion.div>
      </div>
    </main>
  );
}
