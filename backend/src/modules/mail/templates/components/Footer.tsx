import * as React from 'react';
import { Section, Text, Hr } from '@react-email/components';
import { footer, colors } from './Styles';

export const Footer = () => (
  <Section style={footer}>
    <Text style={{ 
      fontSize: '10px', 
      fontWeight: 900, 
      letterSpacing: '6px', 
      color: '#222', 
      textTransform: 'uppercase', 
      margin: '0' 
    }}>
      Institutional Network · Private Sector
    </Text>
    <Text style={{ 
      fontSize: '8px', 
      fontWeight: 400, 
      color: '#111', 
      marginTop: '15px', 
      textTransform: 'uppercase', 
      letterSpacing: '2px' 
    }}>
      MOVNLY Operations Hub • Lisbon, PT
    </Text>
    <Hr style={{ borderColor: 'rgba(255,255,255,0.02)', margin: '40px 0' }} />
    <Text style={{ 
      fontSize: '7px', 
      color: '#0a0a0a', 
      textTransform: 'uppercase', 
      letterSpacing: '1px' 
    }}>
      This communication is confidential and intended solely for the addressee. 
      © 2024 MOVNLY. All rights reserved.
    </Text>
  </Section>
);
