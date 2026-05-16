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
    default: "MOVNLY | Chauffeur & Transfers Lisbon",
    template: "%s | MOVNLY",
  },
  description:
    "Experiência de transporte executivo em Portugal. Chauffeurs bilingues, frota moderna e transferes privados do Aeroporto de Lisboa para Cascais, Sintra e Algarve.",
  keywords: [
    "Luxury Chauffeur Lisbon",
    "Private Driver Portugal",
    "Lisbon Airport Transfer",
    "Executive Transport Lisbon",
    "Sintra Private Tour",
    "Cascais Luxury Limo",
    "MOVNLY",
    "Motorista Particular Lisboa",
    "Transfer VIP Portugal"
  ],
  authors: [{ name: "MOVNLY" }],
  metadataBase: new URL("https://movnly.com"),
  icons: {
    icon: "/logoMov.png",
    apple: "/logoMov.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MOVNLY — Elegância e Precisão em Cada Viagem",
    description:
      "A frota mais exclusiva de Lisboa ao seu serviço. Reserve o seu chauffeur particular para transferes, eventos e turismo de luxo.",
    url: "https://movnly.com",
    siteName: "MOVNLY",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 1200,
        alt: "MOVNLY — Chauffeur Service Portugal",
      },
    ],
    locale: "pt_PT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MOVNLY — Chauffeur Service",
    description: "Your journey starts with precision. Luxury transfers in Lisbon & across Portugal.",
    images: ["/preview.png"],
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
