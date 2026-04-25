import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // Captura 10% das sessões em produção para performance (não sobrecarrega)
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Não captura erros em desenvolvimento local
  enabled: process.env.NODE_ENV === "production",

  // Ignora erros de rede comuns que não são bugs
  ignoreErrors: [
    "Network request failed",
    "Failed to fetch",
    "Load failed",
    "ResizeObserver loop limit exceeded",
  ],

  beforeSend(event) {
    // Remove dados sensíveis antes de enviar para o Sentry
    if (event.request?.cookies) delete event.request.cookies;
    if (event.user?.email) {
      const [name, domain] = event.user.email.split("@");
      event.user.email = `${name[0]}***@${domain}`;
    }
    return event;
  },
});
