import type { Locale } from "./config";

// Lazy-load translations
const translations: Record<string, Record<string, unknown>> = {};

async function loadLocale(locale: string) {
  if (!translations[locale]) {
    const mod = await import(`./locales/${locale}.json`);
    translations[locale] = mod.default;
  }
  return translations[locale];
}

// Deep get with dot notation: "nav.bookNow"
function deepGet(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return path;
    current = (current as Record<string, unknown>)[key];
  }
  if (typeof current === "string") return current;
  return path;
}

export async function getTranslations(locale: Locale) {
  const dict = await loadLocale(locale);
  return function t(key: string, vars?: Record<string, string | number>): string {
    let str = deepGet(dict, key);
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  };
}
