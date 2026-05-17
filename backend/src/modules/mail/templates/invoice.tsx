import * as React from 'react';
import { Text, Heading, Section, Hr } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { h1, colors } from './components/Styles';

interface InvoiceEmailProps {
  amount: string;
  reference: string;
  transactionId: string;
  date: string;
  language?: 'pt' | 'en' | 'fr';
}

const content = {
  pt: {
    title: 'RECIBO DE',
    accent: 'LIQUIDAÇÃO',
    subtitle: 'DOCUMENTO DE TRANSAÇÃO OFICIAL',
    amountLabel: 'Investimento Total Processado via Stripe',
    ref: 'Dossier de Referência',
    id: 'ID de Transação',
    date: 'Data da Operação',
    legal: 'Este documento eletrónico serve como comprovativo de liquidação financeira para o serviço de mobilidade executiva MOVNLY.',
    nif: 'MOVNLY — PRESTIGE MOBILITY | NIF: 512 000 000',
    preview: 'Recibo de Liquidação Oficial — MOVNLY',
  },
  en: {
    title: 'SETTLEMENT',
    accent: 'RECEIPT',
    subtitle: 'OFFICIAL TRANSACTION DOCUMENT',
    amountLabel: 'Total Investment Processed via Stripe',
    ref: 'Reference Number',
    id: 'Transaction ID',
    date: 'Operation Date',
    legal: 'This electronic document serves as proof of financial settlement for the MOVNLY executive mobility service.',
    nif: 'MOVNLY — PRESTIGE MOBILITY | VAT: 512 000 000',
    preview: 'Official Settlement Receipt — MOVNLY',
  },
  fr: {
    title: 'REÇU DE',
    accent: 'RÈGLEMENT',
    subtitle: 'DOCUMENT DE TRANSACTION OFFICIEL',
    amountLabel: 'Investissement Total Traité via Stripe',
    ref: 'Numéro de Référence',
    id: 'ID de Transaction',
    date: 'Date de l\'Opération',
    legal: 'Ce document électronique sert de preuve de règlement financier pour le service de mobilité exécutive MOVNLY.',
    nif: 'MOVNLY — PRESTIGE MOBILITY | NIF : 512 000 000',
    preview: 'Reçu de Règlement Officiel — MOVNLY',
  },
};

export const InvoiceEmail = ({ amount, reference, transactionId, date, language = 'pt' }: InvoiceEmailProps) => {
  const t = content[language] || content.en;

  return (
    <EmailLayout previewText={t.preview}>
      <Heading style={h1}>
        {t.title} <span style={{ color: colors.gold }}>{t.accent}</span>.
      </Heading>
      <Text style={{ 
        fontSize: '10px', 
        fontWeight: 800, 
        textTransform: 'uppercase', 
        color: colors.muted, 
        letterSpacing: '3px', 
        marginBottom: '40px' 
      }}>
        {t.subtitle}
      </Text>
      
      <Section style={{ 
        background: '#000', 
        padding: '40px', 
        border: `1px solid ${colors.border}`, 
        borderRadius: '20px',
        marginBottom: '40px' 
      }}>
        <Section style={{ paddingBottom: '30px' }}>
          <Text style={{ fontSize: '32px', fontWeight: 900, color: colors.white, margin: 0 }}>
            {amount}€
          </Text>
          <Text style={{ fontSize: '9px', textTransform: 'uppercase', color: colors.gold, letterSpacing: '2px', marginTop: '5px' }}>
            {t.amountLabel}
          </Text>
        </Section>
        
        <Hr style={{ borderColor: colors.border, margin: '20px 0' }} />
        
        <Section>
          <table width="100%">
            <tr>
              <td style={{ fontSize: '11px', color: colors.muted, paddingBottom: '10px' }}>{t.ref}</td>
              <td style={{ fontSize: '11px', color: colors.white, textAlign: 'right', fontWeight: 800, paddingBottom: '10px' }}>#{reference}</td>
            </tr>
            <tr>
              <td style={{ fontSize: '11px', color: colors.muted, paddingBottom: '10px' }}>{t.id}</td>
              <td style={{ fontSize: '11px', color: colors.white, textAlign: 'right', fontWeight: 200, paddingBottom: '10px' }}>{transactionId}</td>
            </tr>
            <tr>
              <td style={{ fontSize: '11px', color: colors.muted }}>{t.date}</td>
              <td style={{ fontSize: '11px', color: colors.white, textAlign: 'right', fontWeight: 200 }}>{date}</td>
            </tr>
          </table>
        </Section>
      </Section>

      <Text style={{ fontSize: '12px', fontWeight: 400, lineHeight: '1.6', color: 'rgba(255,255,255,0.4)', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {t.legal}
      </Text>
      <Section style={{ borderTop: `1px solid ${colors.border}`, paddingTop: '20px' }}>
        <Text style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '2px' }}>
          {t.nif}
        </Text>
      </Section>
    </EmailLayout>
  );
};

export default InvoiceEmail;
