import * as React from 'react';
import { Section, Text, Img } from '@react-email/components';
import { header, logo, tagline, colors } from './Styles';

export const Header = () => (
  <Section style={header}>
    <Img 
      src="https://movnly.com/logoMov.png" 
      alt="MOVNLY" 
      width="140" 
      style={{ margin: '0 auto', display: 'block' }} 
    />
  </Section>
);
