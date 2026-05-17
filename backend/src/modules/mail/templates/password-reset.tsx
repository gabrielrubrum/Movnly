import * as React from 'react';
import { Text, Heading, Section } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { SecurityNotice } from './components/Specialized';
import { h1, p, colors } from './components/Styles';

interface PasswordResetProps {
  code: string;
  language?: 'pt' | 'en' | 'fr';
}

const content = {
  pt: {
    title: 'PROTOCOLO DE REDE',
    subtitle: 'Uma redefinição de segurança foi solicitada para o seu perfil corporativo. Utilize o código de acesso temporário abaixo:',
    notice: 'Validade: 60 minutos. Protocolo de segurança nível 4 ativo.',
    preview: 'Recuperação de acesso institucional MOVNLY',
  },
  en: {
    title: 'NETWORK PROTOCOL',
    subtitle: 'A security reset has been requested for your corporate profile. Use the temporary access code below:',
    notice: 'Validity: 60 minutes. Level 4 security protocol active.',
    preview: 'MOVNLY institutional access recovery',
  },
  fr: {
    title: 'PROTOCOLE RÉSEAU',
    subtitle: 'Une réinitialisation de sécurité a été demandée pour votre profil d\'entreprise. Utilisez le code d\'accès temporaire ci-dessous :',
    notice: 'Validité : 60 minutes. Protocole de sécurité de niveau 4 actif.',
    preview: 'Récupération de l\'accès institutionnel MOVNLY',
  },
};

export const PasswordReset = ({ code, language = 'pt' }: PasswordResetProps) => {
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

export default PasswordReset;
