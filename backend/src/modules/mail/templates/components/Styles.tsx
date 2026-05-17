import { CSSProperties } from 'react';

export const colors = {
  bg: '#050505',
  card: '#0A0A0F',
  gold: '#D4AF37',
  white: '#F5F5F5',
  gray: '#A1A1AA',
  muted: '#52525B',
  border: 'rgba(255,255,255,0.05)',
};

export const main: CSSProperties = {
  backgroundColor: colors.bg,
  fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: '40px 0',
};

export const container: CSSProperties = {
  backgroundColor: colors.card,
  margin: '0 auto',
  width: '100%',
  maxWidth: '600px',
  borderRadius: '24px',
  border: `1px solid ${colors.border}`,
  overflow: 'hidden',
};

export const header: CSSProperties = {
  background: 'linear-gradient(180deg, #0A0A0F 0%, #050508 100%)',
  padding: '60px 40px',
  textAlign: 'center',
  borderBottom: `1px solid ${colors.border}`,
};

export const content: CSSProperties = {
  padding: '60px 50px',
};

export const footer: CSSProperties = {
  padding: '40px',
  textAlign: 'center',
  backgroundColor: '#050508',
  borderTop: `1px solid ${colors.border}`,
};

export const logo: CSSProperties = {
  fontSize: '32px',
  fontWeight: 900,
  letterSpacing: '-1.5px',
  textTransform: 'uppercase',
  color: colors.white,
  lineHeight: 1,
};

export const tagline: CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  color: colors.gold,
  textTransform: 'uppercase',
  letterSpacing: '6px',
  marginTop: '15px',
};

export const h1: CSSProperties = {
  fontSize: '48px',
  fontWeight: 900,
  letterSpacing: '-2px',
  textTransform: 'uppercase',
  lineHeight: 0.9,
  marginBottom: '30px',
  color: colors.white,
};

export const p: CSSProperties = {
  fontSize: '16px',
  fontWeight: 400,
  lineHeight: '1.6',
  color: 'rgba(255,255,255,0.4)',
  marginBottom: '40px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};

export const btn: CSSProperties = {
  display: 'inline-block',
  backgroundColor: colors.gold,
  color: '#000000',
  padding: '22px 50px',
  textDecoration: 'none',
  fontWeight: 900,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '5px',
  borderRadius: '12px',
  marginTop: '30px',
};

export const textMuted: CSSProperties = {
  color: '#444444',
  fontSize: '11px',
  fontWeight: 400,
  lineHeight: '1.8',
  marginTop: '50px',
  textTransform: 'uppercase',
  letterSpacing: '1px',
};
