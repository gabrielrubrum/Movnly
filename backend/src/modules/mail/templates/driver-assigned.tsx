import * as React from 'react';
import { Text, Heading, Section } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { InfoCard } from './components/Specialized';
import { h1, colors } from './components/Styles';

interface DriverAssignedProps {
  reference: string;
  driverName: string;
  driverPhone: string;
  vehicleModel: string;
  vehiclePlate: string;
  language?: 'pt' | 'en' | 'fr';
}

const content = {
  pt: {
    title: 'CHAUFFEUR',
    accent: 'ATRIBUÍDO',
    subtitle: 'PROFISSIONAL DESIGNADO PARA A SUA MISSÃO',
    ref: 'Referência',
    name: 'Chauffeur',
    phone: 'Contacto Directo',
    car: 'Veículo Executivo',
    plate: 'Matrícula',
    preview: 'Seu Chauffeur foi designado para a viagem MOVNLY',
  },
  en: {
    title: 'CHAUFFEUR',
    accent: 'ASSIGNED',
    subtitle: 'PROFESSIONAL DESIGNATED FOR YOUR MISSION',
    ref: 'Reference',
    name: 'Chauffeur',
    phone: 'Direct Contact',
    car: 'Executive Vehicle',
    plate: 'License Plate',
    preview: 'Your Chauffeur has been assigned for your MOVNLY trip',
  },
  fr: {
    title: 'CHAUFFEUR',
    accent: 'ASSIGNÉ',
    subtitle: 'PROFESSIONNEL DÉSIGNÉ POUR VOTRE MISSION',
    ref: 'Référence',
    name: 'Chauffeur',
    phone: 'Contact Direct',
    car: 'Véhicule Exécutif',
    plate: 'Plaque d\'immatriculation',
    preview: 'Votre Chauffeur a été assigné pour votre voyage MOVNLY',
  },
};

export const DriverAssigned = ({ reference, driverName, driverPhone, vehicleModel, vehiclePlate, language = 'pt' }: DriverAssignedProps) => {
  const t = content[language] || content.en;

  return (
    <EmailLayout previewText={t.preview}>
      <Heading style={h1}>
        {t.title} <span style={{ color: colors.gold }}>{t.accent}</span>.
      </Heading>
      <Text style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: colors.muted, letterSpacing: '4px', marginBottom: '40px' }}>
        {t.subtitle}
      </Text>
      
      <Section style={{ background: colors.card, padding: '30px', borderLeft: `2px solid ${colors.gold}`, marginBottom: '40px' }}>
        <InfoCard label={t.ref} value={`#${reference}`} />
        <InfoCard label={t.name} value={driverName} accent />
        <InfoCard label={t.phone} value={driverPhone} />
        <InfoCard label={t.car} value={vehicleModel} accent />
        <InfoCard label={t.plate} value={vehiclePlate} />
      </Section>

      <Text style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '1px' }}>
        A MOVNLY seleciona apenas os melhores profissionais da rede para garantir o seu conforto e segurança.
      </Text>
    </EmailLayout>
  );
};

export default DriverAssigned;
