import * as React from 'react';
import { Text, Heading } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { CTAButton } from './components/CTAButton';
import { SecurityNotice } from './components/Specialized';
import { h1, p, colors } from './components/Styles';

interface VerifyEmailProps {
  token: string;
  url: string;
  language?: 'pt' | 'en' | 'fr';
}

const content = {
  pt: {
    title: 'ATIVAÇÃO DE PROTOCOLO',
    subtitle: 'A sua credencial no Portal Private MOVNLY foi emitida. É necessário validar a sua identidade para ativar os privilégios de reserva prioritária.',
    button: 'VALIDAR IDENTIDADE',
    notice: 'AVISO DE SEGURANÇA: Este canal é monitorizado. Caso não tenha solicitado este acesso, ignore este comunicado.',
    preview: 'Ativação de Acesso Institucional — MOVNLY',
  },
  en: {
    title: 'PROTOCOL ACTIVATION',
    subtitle: 'Your credentials for the MOVNLY Private Portal have been issued. Identity validation is required to activate priority booking privileges.',
    button: 'VALIDATE IDENTITY',
    notice: 'SECURITY NOTICE: This channel is monitored. If you did not request this access, please ignore this communication.',
    preview: 'Institutional Access Activation — MOVNLY',
  },
  fr: {
    title: 'ACTIVATION DE PROTOCOLE',
    subtitle: 'Vos identifiants pour le Portail Private MOVNLY ont été émis. Une validation d\'identité est requise pour activer les privilèges de réservation prioritaire.',
    button: 'VALIDER L\'IDENTITÉ',
    notice: 'AVIS DE SÉCURITÉ : Ce canal est surveillé. Si vous n\'avez pas demandé cet accès, veuillez ignorer cette communication.',
    preview: 'Activation d\'Accès Institutionnel — MOVNLY',
  },
};

export const VerifyEmail = ({ url, language = 'pt' }: VerifyEmailProps) => {
  const t = content[language] || content.en;

  return (
    <EmailLayout previewText={t.preview}>
      <Heading style={h1}>
        {t.title.split(' ')[0]} <span style={{ color: colors.gold }}>{t.title.split(' ')[1]}</span>.
      </Heading>
      <Text style={p}>
        {t.subtitle}
      </Text>
      <CTAButton href={url}>
        {t.button}
      </CTAButton>
      <SecurityNotice>
        {t.notice}
      </SecurityNotice>
    </EmailLayout>
  );
};

export default VerifyEmail;
