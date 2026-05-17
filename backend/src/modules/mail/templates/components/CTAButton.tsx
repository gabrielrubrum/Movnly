import * as React from 'react';
import { Button } from '@react-email/components';
import { btn } from './Styles';

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
}

export const CTAButton = ({ href, children }: CTAButtonProps) => (
  <Button style={btn} href={href}>
    {children}
  </Button>
);
