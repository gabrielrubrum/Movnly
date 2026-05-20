/** Maps common Stripe error codes/messages to user-friendly Portuguese copy. */
export function translateStripeError(
  message: string | undefined,
  code?: string,
  declineCode?: string,
): string {
  if (!message && !code) return "Ocorreu um erro inesperado no pagamento. Tente novamente.";

  const lower = (message || "").toLowerCase();

  // ── Test card in live mode ───────────────────────────────────────
  if (
    lower.includes("test mode") ||
    lower.includes("valid for test") ||
    lower.includes("test card")
  ) {
    return "Este é um cartão de teste e não pode ser usado em modo real. Use um cartão real para finalizar a reserva.";
  }

  // ── Currency not supported ──────────────────────────────────────
  if (
    declineCode === "currency_not_supported" ||
    lower.includes("does not support") ||
    lower.includes("currency") ||
    lower.includes("não aceita essa moeda")
  ) {
    return "Este método não aceita EUR. Tente Apple Pay, Google Pay, Link ou outro cartão internacional.";
  }

  // ── Card declined ───────────────────────────────────────────────
  if (code === "card_declined" || declineCode === "generic_decline" || declineCode === "do_not_honor") {
    if (declineCode === "insufficient_funds") {
      return "Saldo insuficiente. Verifique o saldo disponível ou use outro método de pagamento.";
    }
    if (declineCode === "lost_card" || declineCode === "stolen_card") {
      return "Este cartão não pode ser utilizado. Contacte o seu banco ou use outro método.";
    }
    if (declineCode === "card_velocity_exceeded") {
      return "Limite de tentativas excedido neste cartão. Aguarde alguns minutos ou use outro cartão.";
    }
    if (declineCode === "transaction_not_allowed") {
      return "Transação não permitida pelo seu banco. Tente Apple Pay, Google Pay ou outro cartão.";
    }
    return "Seu banco recusou esta cobrança internacional em EUR. Tente Apple Pay, Google Pay, Link ou outro cartão.";
  }

  // ── Authentication required (3DS) ──────────────────────────────
  if (
    code === "authentication_required" ||
    declineCode === "authentication_required" ||
    lower.includes("authentication_required") ||
    lower.includes("requires_action")
  ) {
    return "Confirmação 3D Secure necessária. Confirme o pagamento no aplicativo do seu banco.";
  }

  // ── Insufficient funds ──────────────────────────────────────────
  if (
    lower.includes("insufficient") ||
    code === "insufficient_funds" ||
    declineCode === "insufficient_funds"
  ) {
    return "Saldo insuficiente. Verifique o saldo disponível ou use outro método de pagamento.";
  }

  // ── Card expired ────────────────────────────────────────────────
  if (lower.includes("expired") || declineCode === "expired_card" || code === "expired_card") {
    return "O cartão está expirado. Utilize outro cartão.";
  }

  // ── Incorrect CVC ───────────────────────────────────────────────
  if (
    lower.includes("incorrect_cvc") ||
    lower.includes("cvc") ||
    code === "incorrect_cvc"
  ) {
    return "Código de segurança (CVC/CVV) incorreto.";
  }

  // ── Processing error ────────────────────────────────────────────
  if (lower.includes("processing_error") || code === "processing_error") {
    return "Não foi possível processar o pagamento agora. Tente novamente em alguns instantes.";
  }

  // ── Network errors ──────────────────────────────────────────────
  if (
    lower.includes("network") ||
    lower.includes("timeout") ||
    lower.includes("connection")
  ) {
    return "Erro de conexão. Verifique sua internet e tente novamente.";
  }

  // ── Rate limit ──────────────────────────────────────────────────
  if (code === "rate_limit" || lower.includes("rate limit")) {
    return "Muitas tentativas em pouco tempo. Aguarde alguns segundos e tente novamente.";
  }

  // ── Blocked by Radar ────────────────────────────────────────────
  if (lower.includes("radar") || declineCode === "fraudulent") {
    return "Pagamento recusado por segurança. Tente outro método ou contacte support@movnly.com.";
  }

  // ── Fallback ────────────────────────────────────────────────────
  return message || "Ocorreu um erro inesperado no pagamento. Tente novamente.";
}

export function isMockStripeSecret(clientSecret: string | null): boolean {
  return !!clientSecret && clientSecret.startsWith("pi_mock_");
}
