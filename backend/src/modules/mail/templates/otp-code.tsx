import * as React from 'react';
import { Text, Heading, Section } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { SecurityNotice } from './components/Specialized';
import { h1, p, colors } from './components/Styles';

interface OTPCodeProps {
  code: string;
  language?: 'pt' | 'en' | 'fr';
}

const content = {
  pt: {
    title: 'CÓDIGO DE ACESSO',
    subtitle: 'Um protocolo de verificação foi solicitado. Utilize o código de alta precisão abaixo para validar a sua operação:',
    notice: 'Este código expira em 10 minutos. Protocolo de segurança nível 4 ativo.',
    preview: 'O seu código de verificação MOVNLY',
  },
  en: {
    title: 'ACCESS CODE',
    subtitle: 'A verification protocol has been requested. Use the high-precision code below to validate your operation:',
    notice: 'This code expires in 10 minutes. Level 4 security protocol active.',
    preview: 'Your MOVNLY verification code',
  },
  fr: {
    title: 'CODE D\'ACCÈS',
    subtitle: 'Un protocole de vérification a été demandé. Utilisez le code de haute précision ci-dessous pour valider votre opération :',
    notice: 'Ce code expire dans 10 minutes. Protocole de sécurité de niveau 4 actif.',
    preview: 'Votre code de vérification MOVNLY',
  },
};

export const OTPCode = ({ code, language = 'pt' }: OTPCodeProps) => {
  const t = content[language] || content.en;

  return (
    <EmailLayout previewText={t.preview}>
      <Heading style={h1}>
        {t.title.split(' ')[0]} <span style={{ color: colors.gold }}>{t.title.split(' ')[1]}</span>.
      </Heading>
      <Text style={p}>
        {t.subtitle}
      </Text>
      
      <Section style={{ 
        background: '#000', 
        padding: '50px', 
        textAlign: 'center', 
        border: `1px solid rgba(212,175,55,0.3)`, 
        borderRadius: '20px', 
        margin: '40px 0',
        boxShadow: 'inset 0 0 40px rgba(212,175,55,0.05)'
      }}>
        <Text style={{ 
          fontSize: '56px', 
          fontWeight: 900, 
          letterSpacing: '15px', 
          color: colors.gold, 
          margin: '0',
          marginLeft: '15px'
        }}>
          {code}
        </Text>
      </Section>

      <SecurityNotice>
        {t.notice}
      </SecurityNotice>
    </EmailLayout>
  );
};

export default OTPCode;
