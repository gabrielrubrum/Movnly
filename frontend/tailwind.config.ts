import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        "surface-0": "#07070A",
        "surface-1": "#0A0A0F",
        "surface-2": "#101016",
        "surface-3": "#16161F",
        "surface-4": "#1C1C26",
        brand: {
          gold: "#D4AF37",
          "gold-muted": "rgba(212, 175, 55, 0.15)",
        },
        gold: {
          300: "#F0D680",
          400: "#D4AF37",
          500: "#B88E1F",
          600: "#8C6A15",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "serif"],
      },
      boxShadow: {
        "brand-sm": "0 4px 16px rgba(212,175,55,0.1)",
        "brand-md": "0 8px 32px rgba(212,175,55,0.15)",
        "nx-md": "0 4px 16px rgba(0,0,0,0.6)",
        "nx-lg": "0 12px 40px rgba(0,0,0,0.7)",
        "nx-xl": "0 24px 64px rgba(0,0,0,0.8)",
      },
      animation: {
        "fade-up": "nx-fade-up 0.8s cubic-bezier(0.23,1,0.32,1) both",
        "fade-in": "nx-fade-in 0.6s ease both",
        "scale-in": "nx-scale-in 0.5s cubic-bezier(0.23,1,0.32,1) both",
        "float": "nx-float 6s ease-in-out infinite",
        "pulse-glow": "nx-pulse-glow 2.5s ease-in-out infinite",
        "shimmer": "shimmer 2s infinite ease-in-out",
        "luxury-reveal": "luxury-reveal 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
      keyframes: {
        "nx-fade-up": { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "nx-fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "nx-scale-in": { from: { opacity: "0", transform: "scale(0.96)" }, to: { opacity: "1", transform: "scale(1)" } },
        "nx-float": { "0%,100%": { transform: "translateY(0px)" }, "50%": { transform: "translateY(-8px)" } },
        "nx-pulse-glow": { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.6" } },
        "shimmer": {
          "0%": { transform: "translateX(-200%)" },
          "100%": { transform: "translateX(200%)" }
        },
        "luxury-reveal": {
          "from": { opacity: "0", transform: "translateY(30px)" },
          "to": { opacity: "1", transform: "translateY(0)" }
        }
      },
    },
  },
  plugins: [],
};

export default config;
