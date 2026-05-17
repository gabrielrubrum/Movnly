import * as React from 'react';
import { Text, Heading, Section } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { InfoCard } from './components/Specialized';
import { h1, colors } from './components/Styles';

interface BookingConfirmationProps {
  reference: string;
  origin: string;
  destination: string;
  time: string;
  date: string;
  vehicle: string;
  price: string;
  pin?: string;
  language?: 'pt' | 'en' | 'fr';
}

const content = {
  pt: {
    title: 'SERVIÇO VALIDADO',
    subtitle: 'DETALHES DA SUA RESERVA EXECUTIVA',
    preview: 'Protocolo de Reserva Validado — MOVNLY Prestige',
    ref: 'Nº de Referência',
    from: 'Ponto de Recolha',
    to: 'Destino Final',
    schedule: 'Data e Horário',
    car: 'Categoria da Viatura',
    total: 'Valor do Serviço',
    securityPin: 'PIN de Segurança',
    footer: 'Por favor, apresente o código PIN ao seu motorista no momento do encontro.',
  },
  en: {
    title: 'SERVICE VALIDATED',
    subtitle: 'YOUR EXECUTIVE BOOKING DETAILS',
    preview: 'Validated Booking Protocol — MOVNLY Prestige',
    ref: 'Reference Number',
    from: 'Pickup Location',
    to: 'Final Destination',
    schedule: 'Date and Time',
    car: 'Vehicle Category',
    total: 'Service Amount',
    securityPin: 'Security PIN',
    footer: 'Please present the security PIN code to your driver upon meeting.',
  },
  fr: {
    title: 'SERVICE VALIDÉ',
    subtitle: 'DÉTAILS DE VOTRE RÉSERVATION EXÉCUTIVE',
    preview: 'Protocole de Réservation Validé — MOVNLY Prestige',
    ref: 'Numéro de Référence',
    from: 'Point de Prise en Charge',
    to: 'Destination Finale',
    schedule: 'Date et Heure',
    car: 'Catégorie du Véhicule',
    total: 'Montant du Service',
    securityPin: 'Code PIN de Sécurité',
    footer: 'Veuillez présenter le code PIN de sécurité à votre chauffeur lors de la rencontre.',
  },
};

export const BookingConfirmation = ({ 
  reference, origin, destination, time, date, vehicle, price, pin, language = 'pt' 
}: BookingConfirmationProps) => {
  const t = content[language] || content.en;

  return (
    <EmailLayout previewText={t.preview}>
      <Heading style={h1}>
        {t.title.split(' ')[0]} <span style={{ color: colors.gold }}>{t.title.split(' ')[1]}</span>.
      </Heading>
      <Text style={{ 
        fontSize: '14px', 
        fontWeight: 800, 
        textTransform: 'uppercase', 
        color: colors.muted, 
        letterSpacing: '3px', 
        marginBottom: '40px' 
      }}>
        {t.subtitle}
      </Text>
      
      <Section style={{ 
        background: '#0A0A0F', 
        padding: '30px', 
        borderLeft: `2px solid ${colors.gold}`, 
        marginBottom: '40px' 
      }}>
        <InfoCard label={t.ref} value={reference} />
        <InfoCard label={t.from} value={origin} />
        <InfoCard label={t.to} value={destination} />
        <InfoCard label={t.schedule} value={`${date} às ${time}`} accent />
        <InfoCard label={t.car} value={vehicle} />
        <InfoCard label={t.total} value={`${price}€`} accent />
        
        {pin && (
          <Section style={{ marginTop: '20px' }}>
            <Text style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', color: colors.muted }}>
              {t.securityPin}
            </Text>
            <Text style={{ fontSize: '32px', color: colors.white, fontWeight: 900, letterSpacing: '8px', margin: 0 }}>
              {pin}
            </Text>
          </Section>
        )}
      </Section>

      <Text style={{ fontSize: '13px', fontWeight: 400, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
        {t.footer}
      </Text>
    </EmailLayout>
  );
};

export default BookingConfirmation;
