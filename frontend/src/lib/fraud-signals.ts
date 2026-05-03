/**
 * Coleta sinais de risco do browser para enviar ao backend
 * O backend injeta estes dados no Stripe Radar metadata
 */

let formStartTime: number | null = null;

export function markFormStart() {
  formStartTime = Date.now();
}

export function getFraudHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  // Tempo de preenchimento do formulário
  if (formStartTime) {
    headers['x-form-fill-time'] = String(Date.now() - formStartTime);
  }

  // Fingerprint simples do browser (não PII — apenas características técnicas)
  try {
    const fp = [
      navigator.language,
      navigator.platform,
      screen.width + 'x' + screen.height,
      screen.colorDepth,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 0,
      (navigator as any).deviceMemory || 0,
    ].join('|');

    // Hash simples (não criptográfico — só para identificar o browser)
    let hash = 0;
    for (let i = 0; i < fp.length; i++) {
      hash = ((hash << 5) - hash) + fp.charCodeAt(i);
      hash |= 0;
    }
    headers['x-browser-fingerprint'] = Math.abs(hash).toString(36);
  } catch {
    // Silencioso — não bloquear o pagamento por isso
  }

  return headers;
}
