import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond } from "next/font/google";
import { I18nProvider } from "@/i18n/context";
import { CookieConsent } from "@/components/ui/CookieConsent";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: "MOVNLY | Premium Chauffeur & Private Transfers in Lisbon, Portugal",
    template: "%s | MOVNLY Portugal",
  },
  description:
    "First-class executive transport & chauffeur service in Lisbon, Portugal. Premium fleet, bilingual drivers, and private transfers to Cascais, Sintra, and Algarve. Book your luxury ride today.",
  keywords: [
    "Luxury Chauffeur Lisbon",
    "Private Driver Portugal",
    "Lisbon Airport Transfer VIP",
    "Executive Transport Lisbon",
    "Sintra Private Tour",
    "Cascais Luxury Limo",
    "MOVNLY",
    "Motorista Particular Lisboa",
    "Transfer VIP Portugal",
    "Corporate Travel Lisbon",
    "Premium Cab Lisbon",
  ],
  authors: [{ name: "MOVNLY" }],
  metadataBase: new URL("https://movnly.com"),
  icons: {
    icon: "/logoMov.png",
    apple: "/logoMov.png",
  },
  alternates: {
    canonical: "/",
    languages: {
      "en-GB": "https://movnly.com/en",
      "pt-PT": "https://movnly.com/pt",
      "es-ES": "https://movnly.com/es",
      "fr-FR": "https://movnly.com/fr",
    },
  },
  openGraph: {
    title: "MOVNLY — Elegância e Precisão em Cada Viagem",
    description:
      "A frota mais exclusiva de Portugal ao seu serviço. Reserve o seu chauffeur particular para transferes, eventos e turismo de luxo em Lisboa e Cascais.",
    url: "https://movnly.com",
    siteName: "MOVNLY",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "MOVNLY — Premium Chauffeur Service Portugal",
      },
    ],
    locale: "pt_PT",
    alternateLocales: ["en_GB", "es_ES", "fr_FR"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MOVNLY — Chauffeur Service Lisbon",
    description: "Your journey starts with precision. Luxury transfers in Lisbon & across Portugal.",
    images: ["/preview.png"],
  },
  robots: { 
    index: true, 
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08080f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "MOVNLY",
    "image": "https://movnly.com/preview.png",
    "description": "Premium Chauffeur & Private Transfers in Lisbon, Portugal. Executive transport, bilingual drivers, and luxury fleet.",
    "@id": "https://movnly.com",
    "url": "https://movnly.com",
    "telephone": "+351910000000",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lisbon",
      "addressCountry": "PT"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 38.7223,
      "longitude": -9.1393
    },
    "priceRange": "$$$",
    "sameAs": [
      "https://www.instagram.com/movnly"
    ]
  };

  return (
    <html lang="pt" className={`${sans.variable} ${serif.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-surface-0 text-white antialiased font-sans" suppressHydrationWarning>
        <I18nProvider>
          {children}
          <Toaster position="top-right" richColors theme="dark" />
          <CookieConsent />
        </I18nProvider>
      </body>
    </html>
  );
}
