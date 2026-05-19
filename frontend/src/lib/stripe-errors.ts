/** Maps common Stripe error codes/messages to user-friendly Portuguese copy. */
export function translateStripeError(message: string | undefined, code?: string): string {
  if (!message) return "Ocorreu um erro inesperado no pagamento. Tente novamente.";

  const lower = message.toLowerCase();

  // Test card used in live mode
  if (
    lower.includes("test mode") ||
    lower.includes("valid for test") ||
    lower.includes("válido apenas para testes") ||
    lower.includes("test card")
  ) {
    return "Este é um cartão de teste e não pode ser usado em modo real. Use um cartão real para finalizar a reserva.";
  }

  if (
    code === "card_declined" &&
    (lower.includes("does not support") ||
     lower.includes("não aceita essa moeda") ||
     lower.includes("currency"))
  ) {
    return "Este cartão não aceita pagamentos em Euros (EUR). Utilize um cartão internacional/Visa ou Mastercard habilitado para compras no estrangeiro.";
  }

  if (code === "card_declined") {
    return "O cartão foi recusado pelo banco. Verifique os dados ou utilize outro cartão.";
  }

  if (lower.includes("insufficient")) {
    return "Saldo insuficiente no cartão. Verifique o limite ou utilize outro cartão.";
  }

  if (lower.includes("expired")) {
    return "O cartão está expirado. Utilize outro cartão.";
  }

  if (lower.includes("incorrect_cvc") || lower.includes("cvc")) {
    return "Código de segurança (CVC) incorreto.";
  }

  if (lower.includes("processing_error")) {
    return "Erro temporário no processamento. Aguarde alguns segundos e tente novamente.";
  }

  return message;
}

export function isMockStripeSecret(clientSecret: string | null): boolean {
  return !!clientSecret && clientSecret.startsWith("pi_mock_");
}
