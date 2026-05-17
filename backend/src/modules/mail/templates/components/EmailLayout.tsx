import * as React from 'react';
import { Html, Head, Body, Container, Preview } from '@react-email/components';
import { main, container, content } from './Styles';
import { Header } from './Header';
import { Footer } from './Footer';

interface EmailLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

export const EmailLayout = ({ previewText, children }: EmailLayoutProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Header />
        <div style={content}>
          {children}
        </div>
        <Footer />
      </Container>
    </Body>
  </Html>
);
