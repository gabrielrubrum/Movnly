"use client";

import { motion } from "framer-motion";
import { Eye, Lock, Database, Globe, ArrowLeft, UserCheck, Trash2, Mail } from "lucide-react";
import Link from "next/link";

const SECTIONS = [
  {
    icon: Database,
    title: "Dados que Recolhemos",
    content: "Recolhemos o nome completo, endereço de email, número de telefone e dados de pagamento para processar as suas reservas. Os dados de localização são usados exclusivamente durante a viagem para coordenação com o motorista e são eliminados após a conclusão do serviço.",
  },
  {
    icon: Lock,
    title: "Pagamentos e Segurança",
    content: "Todos os pagamentos são processados pela Stripe, certificada PCI DSS nível 1. Os dados do seu cartão nunca são armazenados nos nossos servidores. A MOVNLY utiliza encriptação SSL/TLS em todas as comunicações entre o seu dispositivo e os nossos servidores.",
  },
  {
    icon: Eye,
    title: "Partilha de Dados",
    content: "Os seus dados pessoais não são vendidos nem partilhados com terceiros para fins comerciais. Partilhamos apenas o nome e contacto com o motorista atribuído à sua viagem, exclusivamente para coordenação do serviço. Podemos partilhar dados com autoridades quando legalmente obrigados.",
  },
  {
    icon: Globe,
    title: "Cookies e Rastreamento",
    content: "Utilizamos cookies essenciais para o funcionamento do site, cookies de sessão para manter o seu login ativo e cookies analíticos para melhorar o serviço. Não utilizamos cookies de publicidade de terceiros. Pode gerir as suas preferências de cookies a qualquer momento.",
  },
  {
    icon: UserCheck,
    title: "Os Seus Direitos (RGPD)",
    content: "Tem direito a aceder, corrigir ou eliminar os seus dados a qualquer momento. Pode solicitar a portabilidade dos seus dados ou opor-se ao seu tratamento. Para exercer estes direitos, contacte-nos em privacidade@movnly.com. Respondemos em até 72 horas.",
  },
  {
    icon: Trash2,
    title: "Retenção de Dados",
    content: "Os dados de reservas são mantidos por 5 anos para fins fiscais e legais. Os dados de conta são eliminados 30 dias após o pedido de eliminação. Dados de localização são eliminados imediatamente após a conclusão da viagem. Logs de segurança são mantidos por 90 dias.",
  },
];

export default function PrivacidadePage() {
  return (
    <main className="min-h-screen bg-[#07070A] pt-40 pb-32 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[160px] rounded-full -translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>

          <Link href="/" className="flex items-center gap-3 text-white/40 hover:text-brand-gold transition-all group w-fit mb-16">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-brand-gold/40">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Voltar</span>
          </Link>

          <div className="mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em] mb-6">
              Proteção de Dados
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
              Política de Privacidade
            </h1>
            <p className="text-white/40 text-sm">
              Última atualização: 27 de Abril de 2026 &nbsp;·&nbsp; Conforme RGPD (UE) 2016/679
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {SECTIONS.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="rounded-2xl p-6 transition-all hover:border-white/10"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center mb-4">
                  <s.icon className="w-4.5 h-4.5 text-emerald-400" />
                </div>
                <h2 className="text-base font-bold text-white mb-2">{s.title}</h2>
                <p className="text-white/50 text-sm leading-relaxed">{s.content}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl p-6" style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.12)" }}>
            <div className="flex items-start gap-4">
              <Mail className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-bold text-sm mb-1">Encarregado de Proteção de Dados</p>
                <p className="text-white/50 text-sm">Para questões sobre privacidade ou para exercer os seus direitos RGPD, contacte: <span className="text-emerald-400">privacidade@movnly.com</span></p>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/[0.06] text-center">
            <p className="text-white/25 text-xs">
              MOVNLY Elite &nbsp;·&nbsp; NIF: 517 842 930 &nbsp;·&nbsp; privacidade@movnly.com &nbsp;·&nbsp; movnly.com
            </p>
          </div>

        </motion.div>
      </div>
    </main>
  );
}
