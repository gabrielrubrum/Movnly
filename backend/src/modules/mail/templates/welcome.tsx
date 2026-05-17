import * as React from 'react';
import { Text, Heading } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { CTAButton } from './components/CTAButton';
import { h1, p, colors } from './components/Styles';

interface WelcomeEmailProps {
  name: string;
  language?: 'pt' | 'en' | 'fr';
}

const content = {
  pt: {
    title: 'BEM-VINDO À',
    subtitle: 'MOVNLY — GESTÃO DE MOBILIDADE EXECUTIVA',
    body: 'O seu perfil na rede MOVNLY foi validado. A partir de agora, dispõe de um padrão de excelência, pontualidade e discrição absoluta para todas as suas deslocações em Portugal.',
    button: 'AGENDAR TRANSPORTE',
    preview: 'Confirmação de Acesso — MOVNLY Executive',
  },
  en: {
    title: 'WELCOME TO',
    subtitle: 'MOVNLY — EXECUTIVE MOBILITY MANAGEMENT',
    body: 'Your profile in the MOVNLY network has been validated. From this moment on, you have a standard of excellence, punctuality, and absolute discretion at your disposal for all your travels in Portugal.',
    button: 'SCHEDULE TRANSPORT',
    preview: 'Access Confirmation — MOVNLY Executive',
  },
  fr: {
    title: 'BIENVENUE À',
    subtitle: 'MOVNLY — GESTION DE MOBILITÉ EXÉCUTIVE',
    body: 'Votre profil sur le réseau MOVNLY a été validé. Désormais, vous disposez d\'un standard d\'excellence, de ponctualité et de discrétion absolue pour tous vos déplacements au Portugal.',
    button: 'PLANIFIER LE TRANSPORT',
    preview: 'Confirmation d\'accès — MOVNLY Executive',
  },
};

export const WelcomeEmail = ({ name, language = 'pt' }: WelcomeEmailProps) => {
  const t = content[language] || content.en;

  return (
    <EmailLayout previewText={t.preview}>
      <Heading style={h1}>
        {t.title} <span style={{ color: colors.gold }}>MOVNLY</span>.
      </Heading>
      <Text style={{ 
        fontSize: '14px', 
        fontWeight: 800, 
        textTransform: 'uppercase', 
        color: colors.muted, 
        letterSpacing: '4px', 
        marginBottom: '30px' 
      }}>
        {t.subtitle}
      </Text>
      <Text style={p}>
        Olá <span style={{ color: colors.white, fontWeight: 700 }}>{name}</span>, {t.body}
      </Text>
      <CTAButton href="https://movnly.com">
        {t.button}
      </CTAButton>
    </EmailLayout>
  );
};

export default WelcomeEmail;
