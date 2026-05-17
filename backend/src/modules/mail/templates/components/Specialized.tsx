import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { colors } from './Styles';

export const InfoCard = ({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) => (
  <Section style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <Text style={{ fontSize: '9px', fontWeight: 900, textTransform: 'uppercase', color: '#52525B', margin: '0 0 5px 0' }}>
      {label}
    </Text>
    <Text style={{ fontSize: accent ? '16px' : '15px', color: accent ? colors.gold : colors.white, fontWeight: accent ? 400 : 200, margin: 0 }}>
      {value}
    </Text>
  </Section>
);

export const SecurityNotice = ({ children }: { children: React.ReactNode }) => (
  <Text style={{ 
    color: '#444444', 
    fontSize: '11px', 
    fontWeight: 400, 
    lineHeight: '1.8', 
    marginTop: '50px', 
    textTransform: 'uppercase', 
    letterSpacing: '1px' 
  }}>
    {children}
  </Text>
);
