import * as React from 'react';
import { Text, Heading, Section } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { h1, colors, p } from './components/Styles';

interface CancellationEmailProps {
  reference: string;
  reason?: string;
  language?: 'pt' | 'en' | 'fr';
}

const content = {
  pt: {
    title: 'RESERVA',
    accent: 'CANCELADA',
    subtitle: 'ATUALIZAÇÃO DE STATUS DE OPERAÇÃO',
    body: 'Lamentamos informar que a reserva abaixo foi cancelada no sistema.',
    ref: 'Referência',
    reasonLabel: 'Motivo do Cancelamento',
    footer: 'Caso tenha dúvidas sobre reembolsos ou políticas de cancelamento, entre em contacto com o suporte.',
    preview: 'Confirmação de cancelamento de reserva MOVNLY',
  },
  en: {
    title: 'BOOKING',
    accent: 'CANCELLED',
    subtitle: 'OPERATION STATUS UPDATE',
    body: 'We regret to inform you that the following booking has been cancelled in the system.',
    ref: 'Reference',
    reasonLabel: 'Reason for Cancellation',
    footer: 'If you have questions about refunds or cancellation policies, please contact support.',
    preview: 'MOVNLY booking cancellation confirmation',
  },
  fr: {
    title: 'RÉSERVATION',
    accent: 'ANNULÉE',
    subtitle: 'MISE À JOUR DU STATUT DE L\'OPÉRATION',
    body: 'Nous avons le regret de vous informer que la réservation suivante a été annulée dans le système.',
    ref: 'Référence',
    reasonLabel: 'Motif de l\'annulation',
    footer: 'Si vous avez des questions sur les remboursements ou les politiques d\'annulation, veuillez contacter le support.',
    preview: 'Confirmation d\'annulation de réservation MOVNLY',
  },
};

export const CancellationEmail = ({ reference, reason, language = 'pt' }: CancellationEmailProps) => {
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
        <Text style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', color: colors.muted }}>{t.ref}</Text>
        <Text style={{ fontSize: '18px', color: colors.white, fontWeight: 800, margin: '5px 0 20px 0' }}>#{reference}</Text>
        
        {reason && (
          <>
            <Text style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', color: colors.muted }}>{t.reasonLabel}</Text>
            <Text style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '5px 0 0 0' }}>{reason}</Text>
          </>
        )}
      </Section>

      <Text style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', lineHeight: '1.6' }}>
        {t.footer}
      </Text>
    </EmailLayout>
  );
};

export default CancellationEmail;
