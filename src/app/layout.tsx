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
    default: "NEXRICE | Premium Chauffeur & Luxury Transfers Lisbon",
    template: "%s | NEXRICE",
  },
  description:
    "Experiência de transporte executivo de elite em Portugal. Chauffeurs bilingues, frota de luxo e transferes privados premium do Aeroporto de Lisboa para Cascais, Sintra e Algarve.",
  keywords: [
    "Luxury Chauffeur Lisbon",
    "Private Driver Portugal",
    "Lisbon Airport Transfer",
    "Executive Transport Lisbon",
    "Sintra Private Tour",
    "Cascais Luxury Limo",
    "NexRice Elite",
    "Motorista Particular Lisboa",
    "Transfer VIP Portugal"
  ],
  authors: [{ name: "NEXRICE ELITE" }],
  metadataBase: new URL("https://nexrice.com"),
  icons: {
    icon: "/logo-premium.png",
    apple: "/logo-premium.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NEXRICE — Elegância e Precisão em Cada Viagem",
    description:
      "A frota mais exclusiva de Lisboa ao seu serviço. Reserve o seu chauffeur particular para transferes, eventos e turismo de luxo.",
    url: "https://nexrice.com",
    siteName: "NEXRICE ELITE",
    images: [
      {
        url: "/logo-premium.png",
        width: 1200,
        height: 1200,
        alt: "NexRice Elite — Luxury Chauffeur Service Portugal",
      },
    ],
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NEXRICE — Premium Chauffeur Service",
    description: "Your journey starts with elite precision. Premium transfers in Lisbon & across Portugal.",
    images: ["/logo-premium.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#08080f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={`${sans.variable} ${serif.variable}`}>
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
