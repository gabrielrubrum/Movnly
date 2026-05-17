import * as React from 'react';
import { Text, Heading, Section } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { CTAButton } from './components/CTAButton';
import { h1, colors, p } from './components/Styles';

interface PaymentFailedEmailProps {
  reference: string;
  amount: string;
  language?: 'pt' | 'en' | 'fr';
}

const content = {
  pt: {
    title: 'PAGAMENTO',
    accent: 'PENDENTE',
    subtitle: 'ERRO NO PROCESSAMENTO FINANCEIRO',
    body: 'O protocolo de pagamento para a sua reserva não pôde ser concluído. Verifique o seu método de pagamento para garantir a sua viagem.',
    button: 'Resolver Pagamento',
    preview: 'Atenção: Falha no pagamento da reserva MOVNLY',
  },
  en: {
    title: 'PAYMENT',
    accent: 'PENDING',
    subtitle: 'FINANCIAL PROCESSING ERROR',
    body: 'The payment protocol for your booking could not be completed. Please check your payment method to secure your trip.',
    button: 'Resolve Payment',
    preview: 'Attention: Payment failed for MOVNLY booking',
  },
  fr: {
    title: 'PAIEMENT',
    accent: 'EN ATTENTE',
    subtitle: 'ERREUR DE TRAITEMENT FINANCIER',
    body: 'Le protocole de paiement pour votre réservation n\'a pas pu être complété. Veuillez vérifier votre mode de paiement pour sécuriser votre voyage.',
    button: 'Résoudre le paiement',
    preview: 'Attention : Échec du paiement pour la réservation MOVNLY',
  },
};

export const PaymentFailedEmail = ({ reference, amount, language = 'pt' }: PaymentFailedEmailProps) => {
  const t = content[language] || content.en;

  return (
    <EmailLayout previewText={t.preview}>
      <Heading style={h1}>
        {t.title} <span style={{ color: '#ef4444' }}>{t.accent}</span>.
      </Heading>
      <Text style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: colors.muted, letterSpacing: '4px', marginBottom: '40px' }}>
        {t.subtitle}
      </Text>
      
      <Text style={p}>
        {t.body}
      </Text>

      <Section style={{ background: colors.card, padding: '30px', borderLeft: `2px solid #ef4444`, marginBottom: '40px' }}>
        <Text style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', color: colors.muted }}>Valor em Dívida</Text>
        <Text style={{ fontSize: '24px', color: colors.white, fontWeight: 800, margin: '5px 0 0 0' }}>{amount}€</Text>
        <Text style={{ fontSize: '11px', color: colors.muted, marginTop: '15px' }}>Referência: #{reference}</Text>
      </Section>

      <CTAButton href="https://movnly.com/checkout">
        {t.button}
      </CTAButton>
    </EmailLayout>
  );
};

export default PaymentFailedEmail;
