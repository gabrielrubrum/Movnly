import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['preoceanic-stefan-sluicelike.ngrok-free.dev'],
  devIndicators: false,
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com https://*.sentry.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: https://maps.gstatic.com https://maps.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' http://localhost:3002 ws://localhost:3002 wss://localhost:3002 https://api.nexrice.com wss://api.nexrice.com https://api.stripe.com https://maps.googleapis.com https://*.sentry.io https://*.ingest.sentry.io; frame-src 'self' https://js.stripe.com https://www.google.com;" },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: "nexrice",
  project: "nexrice-frontend",
  silent: true, // Não polui o output do build
  widenClientFileUpload: true,
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },
});
