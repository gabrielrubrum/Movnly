"use client";
// Last update: 2026-04-01 17:03:00 - Refreshing for B2B keys

import {
  createContext, useContext, useState, useCallback,
  useEffect, ReactNode,
} from "react";
import { locales, defaultLocale, type Locale } from "./config";

type Dict = Record<string, unknown>;

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => any;
  tArray: (key: string) => any[];
  isLoading: boolean;
}

const I18nContext = createContext<I18nContextValue>({
  locale: defaultLocale,
  setLocale: () => { },
  t: (k) => k as any,
  tArray: () => [],
  isLoading: true,
});

function deepGet(obj: Dict, path: string): any {
  const keys = path.split(".");
  let cur: unknown = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== "object") return path;
    cur = (cur as Dict)[k];
  }
  return cur !== undefined ? cur : path;
}

import enDict from './locales/en.json';
import ptDict from './locales/pt.json';
import esDict from './locales/es.json';
import frDict from './locales/fr.json';

const dictionaries: Record<Locale, Dict> = {
  en: enDict as Dict,
  pt: ptDict as Dict,
  es: esDict as Dict,
  fr: frDict as Dict,
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [dict, setDict] = useState<Dict>(enDict as Dict);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? localStorage.getItem("nx-locale") : null;
      if (stored && locales.includes(stored as Locale)) {
        setLocaleState(stored as Locale);
        setDict(dictionaries[stored as Locale]);
        document.documentElement.lang = stored;
        return;
      }

      // Robust browser detection
      let detected: Locale = defaultLocale;
      if (typeof navigator !== "undefined") {
        const browserLangs = navigator.languages || [navigator.language || (navigator as any).userLanguage];
        for (const raw of browserLangs) {
          if (!raw) continue;
          const short = raw.split("-")[0].toLowerCase();
          if (locales.includes(short as any)) {
            detected = short as Locale;
            break;
          }
        }
      }

      setLocaleState(detected);
      setDict(dictionaries[detected] || dictionaries.en);
      document.documentElement.lang = detected;
    } catch (e) {
      console.error("Language detection failed:", e);
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    setDict(dictionaries[l] || dictionaries.en);

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("nx-locale", l);
      }
    } catch (err) {
      console.warn("Could not save locale to localStorage", err);
    }

    if (typeof document !== "undefined") {
      document.documentElement.lang = l;
    }
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>): any => {
    let val = deepGet(dict, key);
    if (vars && typeof val === "string") {
      Object.entries(vars).forEach(([k, v]) => {
        val = val.replace(`{${k}}`, String(v));
      });
    }
    return val;
  }, [dict]);

  const tArray = useCallback((key: string): any[] => {
    const val = deepGet(dict, key);
    return Array.isArray(val) ? val : [];
  }, [dict]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, tArray, isLoading }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
