"use client";

import { motion } from "framer-motion";
import { Shield, Scale, ScrollText, AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const SECTIONS = [
  {
    icon: Shield,
    title: "O Serviço NexRice",
    content: "A NexRice é uma plataforma de transfers e transporte executivo em Portugal. Todos os motoristas são profissionais licenciados com alvará TVDE/RNAAT válido. Ao reservar, está a contratar um serviço de transporte privado com preço fixo, sem surpresas no final da viagem.",
  },
  {
    icon: Scale,
    title: "Reservas e Pagamentos",
    content: "As reservas são confirmadas após o pagamento. O preço apresentado é final e inclui todas as taxas. Para transferes de aeroporto, o motorista aguarda até 60 minutos após o horário de aterragem previsto sem custo adicional. Atrasos de voo são monitorizados automaticamente.",
  },
  {
    icon: ScrollText,
    title: "Cancelamentos e Reembolsos",
    content: "Cancelamento gratuito até 24 horas antes da viagem com reembolso total. Entre 2 e 24 horas, reembolso de 50%. Com menos de 2 horas ou não comparência, sem reembolso. Em caso de falha do motorista, o reembolso é total e imediato.",
  },
  {
    icon: AlertTriangle,
    title: "Responsabilidades",
    content: "A NexRice não se responsabiliza por atrasos causados por condições de tráfego imprevisíveis, condições meteorológicas extremas ou greves. O passageiro é responsável por fornecer dados de voo corretos. Bagagem danificada durante o transporte deve ser reportada no prazo de 24 horas.",
  },
  {
    icon: CheckCircle2,
    title: "Conduta e Utilização",
    content: "O utilizador compromete-se a manter uma conduta respeitosa com os motoristas e a não utilizar o serviço para fins ilegais. A NexRice reserva-se o direito de suspender contas que violem estas condições. Qualquer disputa será resolvida pelos tribunais portugueses.",
  },
  {
    icon: Scale,
    title: "Alterações aos Termos",
    content: "A NexRice pode atualizar estes termos a qualquer momento. As alterações entram em vigor 30 dias após publicação no site. A continuação do uso do serviço após esse prazo implica a aceitação dos novos termos. Para questões, contacte termos@nexrice.com.",
  },
];

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-[#07070A] pt-40 pb-32 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-gold/5 blur-[160px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>

          <Link href="/" className="flex items-center gap-3 text-white/40 hover:text-brand-gold transition-all group w-fit mb-16">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand-gold/40">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Voltar</span>
          </Link>

          <div className="mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-[10px] font-black uppercase tracking-[0.4em] mb-6">
              Condições de Uso
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
              Termos e Condições
            </h1>
            <p className="text-white/40 text-sm">
              Última atualização: 27 de Abril de 2026 &nbsp;·&nbsp; NexRice, Lda. &nbsp;·&nbsp; Lisboa, Portugal
            </p>
          </div>

          <div className="space-y-4">
            {SECTIONS.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-6 transition-all hover:border-white/10"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <s.icon className="w-4.5 h-4.5 text-brand-gold" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white mb-2">{s.title}</h2>
                    <p className="text-white/50 text-sm leading-relaxed">{s.content}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 pt-8 border-t border-white/[0.06] text-center">
            <p className="text-white/25 text-xs">
              NexRice, Lda. &nbsp;·&nbsp; NIF: PT000000000 &nbsp;·&nbsp; termos@nexrice.com &nbsp;·&nbsp; nexrice.com
            </p>
          </div>

        </motion.div>
      </div>
    </main>
  );
}
