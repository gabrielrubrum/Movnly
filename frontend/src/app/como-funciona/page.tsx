"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/Badge";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TrustSection } from "@/components/home/TrustSection";
import { CTASection } from "@/components/home/CTASection";
import { Shield, Plane, Clock, Star, Check } from "lucide-react";
import type { Metadata } from "next";

// Removido metadata pois este é agora um Client Component.
// Para SEO, considere usar um layout.tsx separado ou o RootLayout.

const faqs = [
  { q: "Quanto tempo antes devo reservar?", a: "Pode reservar com até 12 meses de antecedência ou com apenas 2 horas de antecedência. Para garantir disponibilidade, recomendamos reservar com pelo menos 24h." },
  { q: "O que acontece se o meu voo atrasar?", a: "Monitorizamos o seu voo em tempo real. Se houver atraso, ajustamos automaticamente o horário do motorista sem custo adicional." },
  { q: "Posso cancelar a reserva?", a: "Sim. Cancelamento gratuito até 24h antes da viagem. Entre 24h e 2h, cobramos 50% do valor. Menos de 2h ou no-show, cobramos 100%." },
  { q: "Como é feito o pagamento?", a: "Aceitamos cartão de crédito/débito, MB Way e faturação mensal para empresas. O pagamento é processado de forma segura com encriptação SSL." },
  { q: "Os motoristas são verificados?", a: "Todos os motoristas passam por verificação de antecedentes criminais, validação de licença profissional e formação em atendimento ao cliente." },
  { q: "Posso fazer reservas para grupos grandes?", a: "Sim. A categoria Group acomoda até 7 passageiros. Para grupos maiores, contacte-nos para soluções personalizadas com múltiplos veículos." },
];

export default function ComoFuncionaPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 bg-obsidian-950 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-blue-600/06 blur-[100px]" />
          <div className="relative container-premium text-center">
            <Badge variant="blue" className="mb-4">Processo Transparente</Badge>
            <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-black tracking-tight text-white mb-4">
              Como funciona o Serviço MOVNLY
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Do planeamento à chegada ao destino, cada detalhe é gerido com o máximo rigor para a sua total tranquilidade.
            </p>
          </div>
        </section>

        <HowItWorks />

        {/* Flight Monitoring Detail */}
        <section className="section-padding bg-obsidian-950">
          <div className="container-premium">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="blue" className="mb-4">Acompanhamento de Voo</Badge>
                <h2 className="text-3xl font-black text-white mb-4">A Tranquilidade de um Serviço Monitorizado</h2>
                <p className="text-slate-400 mb-6 leading-relaxed">
                  Contamos com sistemas integrados que acompanham o estado do seu voo em tempo real. Se houver imprevistos, a nossa operação ajusta-se automaticamente.
                </p>
                <div className="space-y-3">
                  {[
                    "Monitorização ativa do estado do voo",
                    "Sincronização imediata com o motorista",
                    "Notificações automáticas via Push/SMS",
                    "Sem taxas por atrasos de voo confirmados",
                    "Suporte prioritário 24/7",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-premium p-6 space-y-3">
                {[
                  { time: "10:15", event: "Voo TP1234 descolou de Londres", icon: Plane, color: "text-blue-400" },
                  { time: "12:30", event: "Atraso detectado: +45 minutos", icon: Clock, color: "text-amber-400" },
                  { time: "12:31", event: "Motorista notificado automaticamente", icon: Shield, color: "text-emerald-400" },
                  { time: "13:45", event: "Voo aterrou em Lisboa", icon: Plane, color: "text-emerald-400" },
                  { time: "13:50", event: "Motorista a caminho do terminal", icon: Star, color: "text-blue-400" },
                ].map((event) => {
                  const Icon = event.icon;
                  return (
                    <div key={event.time} className="flex items-center gap-3">
                      <span className="text-xs font-mono text-slate-600 w-10 flex-shrink-0">{event.time}</span>
                      <div className="w-px h-6 bg-white/08 flex-shrink-0" />
                      <Icon className={`w-4 h-4 flex-shrink-0 ${event.color}`} />
                      <span className="text-sm text-slate-300">{event.event}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <TrustSection />

        {/* FAQ */}
        <section className="section-padding bg-obsidian-950">
          <div className="container-premium max-w-3xl">
            <div className="text-center mb-12">
              <Badge variant="slate" className="mb-4">FAQ</Badge>
              <h2 className="text-3xl font-black text-white">Perguntas frequentes</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <div key={faq.q} className="card-premium p-5">
                  <h3 className="font-bold text-white mb-2">{faq.q}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </>
  );
}
